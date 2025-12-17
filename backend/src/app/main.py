import io
import logging
import os
import sqlite3
import tempfile
from http.client import HTTPException
from pathlib import Path
from typing import Any, List
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, Form, UploadFile, File
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mellea import MelleaSession
from mellea.backends.litellm import LiteLLMBackend
import pandas as pd
from pydantic import BaseModel
from qux360.core import Interview, Study


load_dotenv()

app = FastAPI()

m = MelleaSession(backend=LiteLLMBackend(model_id=os.getenv("MODEL_ID")))  # type: ignore

# Suppress Mellea's FancyLogger (MelleaSession resets it to DEBUG, so we set it here)
logging.getLogger("fancy_logger").setLevel(logging.WARNING)

# Configure logging
logging.basicConfig(level=logging.WARNING, format="%(message)s")

# Enable INFO logging only for qux360
logging.getLogger("qux360").setLevel(logging.INFO)


# Allow frontend (Svelte) to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path.cwd().joinpath("database.db")


# Initialize a very small SQLite DB to store uploaded files as blobs
def init_db(path: Path):
    conn = sqlite3.connect(path)
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS Studies (
            id TEXT PRIMARY KEY,
            name TEXT
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS Interviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT,
            filename TEXT NOT NULL,
            content BLOB NOT NULL,
            FOREIGN KEY (study_id) REFERENCES Studies(id) ON DELETE CASCADE
        )
        """
    )

    conn.commit()
    conn.close()


init_db(DB_PATH)


def get_connection() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def save_study(name: str) -> str:
    study_id = str(uuid.uuid4())
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("INSERT INTO Studies (id, name) VALUES (?, ?)", (study_id, name))
        conn.commit()
        return study_id
    finally:
        conn.close()


def get_study_by_name(name: str) -> str | None:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM Studies WHERE name = ?", (name,))
        row = cur.fetchone()
        return row[0] if row else None
    finally:
        conn.close()


def save_or_update_interview(
    study_id: str, filename: str, content: bytes
) -> int | None:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM Interviews WHERE study_id = ? AND filename = ?",
            (study_id, filename),
        )
        row = cur.fetchone()
        if row:
            interview_id = row[0]
            cur.execute(
                "UPDATE Interviews SET content = ? WHERE id = ?",
                (content, interview_id),
            )
            print(f"♻️ Updated file '{filename}' with id {interview_id}")
        else:
            cur.execute(
                "INSERT INTO Interviews (study_id, filename, content) VALUES (?, ?, ?)",
                (study_id, filename, content),
            )
            interview_id = cur.lastrowid
            print(f"✅ Inserted new file '{filename}' with id {interview_id}")
        conn.commit()
        return interview_id
    finally:
        conn.close()


def delete_removed_interviews(study_id: str, new_filenames: List[str | None]):
    conn = get_connection()
    try:
        cur = conn.cursor()
        if new_filenames:
            placeholders = ",".join("?" * len(new_filenames))
            sql = f"DELETE FROM Interviews WHERE study_id = ? AND filename NOT IN ({placeholders})"
            cur.execute(sql, [study_id, *new_filenames])
        else:
            cur.execute("DELETE FROM Interviews WHERE study_id = ?", (study_id,))
        conn.commit()
    finally:
        conn.close()


def update_interview_in_db(file_id: int, filename: str, content: bytes) -> int:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE Interviews SET content = ?, filename = ? WHERE id = ?",
            (sqlite3.Binary(content), filename, file_id),
        )
        conn.commit()
        return file_id
    finally:
        conn.close()


def get_interview_from_db(file_id: int):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT filename, content FROM Interviews WHERE id = ?", (file_id,))
        row = cur.fetchone()
        if not row:
            return None
        return {"filename": row[0], "content": row[1]}
    finally:
        conn.close()


def write_temp_file(row: dict[str, Any]) -> str:
    # write to a temporary file for qux360's Interview which expects a path
    suffix = Path(row["filename"]).suffix or ".xlsx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(row["content"])
        tmp_path = tmp.name

    return tmp_path


def upload_interview_sync(study_name: str, files: List[UploadFile]):
    study_id: str | None = get_study_by_name(study_name)
    if not study_id:
        study_id = save_study(study_name)

    new_filenames = [file.filename for file in files]

    delete_removed_interviews(study_id, new_filenames)

    uploaded_files = []
    for file in files:
        content = file.file.read()
        print(f"📁 Uploading file: {file.filename}, size: {len(content)} bytes")
        interview_id = save_or_update_interview(study_id, file.filename, content)
        print(f"✅ File saved in DB with id: {interview_id}")
        uploaded_files.append({"file_id": interview_id, "filename": file.filename})

    return {"study_id": study_id, "uploaded_files": uploaded_files}


@app.post("/upload_study_interviews")
async def upload_study_interviews(
    study_name: str = Form(...), files: List[UploadFile] = File(...)
):
    """Save uploaded file and return its temp path"""
    try:
        return await run_in_threadpool(upload_interview_sync, study_name, files)
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return {"error": str(e)}


def identify_participant_sync(file_id: int):
    print(f"🔍 Extracting speakers and identifying participant from file id: {file_id}")

    row = get_interview_from_db(file_id)
    if not row:
        return {
            "error": "file not found",
            "speakers": [],
            "participant": "",
            "validation": None,
        }

    tmp_path = write_temp_file(row)

    i = Interview(tmp_path)
    speakers = i.get_speakers()
    interviewee = i.identify_interviewee(m)

    return {
        "message": "Speakers found (participant identified)",
        "speakers": speakers,
        "participant": interviewee.result,
        "validation": interviewee.validation,
    }


@app.get("/identify_participant/{file_id}")
async def identify_participant(file_id: int):
    try:
        return await run_in_threadpool(identify_participant_sync, file_id)
    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        return {"error": str(e), "speakers": [], "participant": "", "validation": None}


def speakers_anonymization_map_sync(file_id: int):
    print(f"🔍 Building speakers anonymization map for file id: {file_id}")
    row = get_interview_from_db(file_id)
    if not row:
        return {"speakers_anonymization_map": {}, "error": "file not found"}

    tmp_path = write_temp_file(row)

    i = Interview(tmp_path)
    speakers_map = i.anonymize_speakers_generic()

    return {
        "message": "Speakers Anonymization map",
        "speakers_anonymization_map": speakers_map,
    }


@app.get("/speakers_anonymization_map/{file_id}")
async def get_speakers_anonymization_map(file_id: int):
    try:
        return await run_in_threadpool(speakers_anonymization_map_sync, file_id)
    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        return {"speakers_anonymization_map": {}, "error": str(e)}


def entities_anonymization_map_sync(file_id: int):
    print(f"🔍 Building entities anonymization map for file id: {file_id}")
    row = get_interview_from_db(file_id)
    if not row:
        return {"entities_anonymization_map": {}, "error": "file not found"}

    tmp_path = write_temp_file(row)

    i = Interview(tmp_path)
    entities = i.detect_entities()
    entities_map = i.build_replacement_map(entities)

    return {
        "message": "Entities anonymization map",
        "entities_anonymization_map": entities_map,
    }


@app.get("/entities_anonymization_map/{file_id}")
async def get_entities_anonymization_map(file_id: int):
    try:
        return await run_in_threadpool(entities_anonymization_map_sync, file_id)
    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        return {"entities_anonymization_map": {}, "error": str(e)}


def transcript_sync(file_id: int):
    row = get_interview_from_db(file_id)
    if not row:
        return {"error": "file not found"}

    tmp_path = write_temp_file(row)

    i = Interview(tmp_path)
    transcript_raw = i.transcript_raw
    selected_df = transcript_raw[["timestamp", "speaker", "statement"]]

    return [
        {"index": idx, **row}
        for idx, row in enumerate(selected_df.to_dict(orient="records"))
    ]


@app.get("/transcript/{file_id}")
async def get_transcript(file_id: int):
    try:
        data = await run_in_threadpool(transcript_sync, file_id)
        return JSONResponse(content=data)
    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        return {"error": str(e)}


def json_to_xlsx_bytes(records: list[dict]) -> bytes:
    """
    Convert a list of dictionaries into an XLSX file using pandas.
    Returns the XLSX data as bytes.
    """
    if not records:
        raise ValueError("No data provided to generate XLSX.")

    df = pd.DataFrame(records)
    df = df[["timestamp", "speaker", "statement"]]

    buffer = io.BytesIO()

    # Explicitly use openpyxl engine for writing
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Transcript")

    return buffer.getvalue()


def update_transcript_sync(file_id: int, content: list[dict]):
    row = get_interview_from_db(file_id)
    if not row:
        return {"error": "file not found"}

    try:
        xlsx_bytes = json_to_xlsx_bytes(content)
    except Exception as e:
        raise Exception(e)

    # Update DB
    filename = Path(row["filename"]).stem + ".xlsx"
    updated_id = update_interview_in_db(file_id, filename, xlsx_bytes)

    print(f"✅ File updated in DB with id: {updated_id}")

    return {
        "message": "Transcript updated",
        "updated_transcript": updated_id,
    }


class UpdateTranscriptPayload(BaseModel):
    file_id: int
    content: list[dict]


@app.post("/update_transcript")
async def update_transcript(payload: UpdateTranscriptPayload):
    try:
        return await run_in_threadpool(
            update_transcript_sync,
            payload.file_id,
            payload.content,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def get_interview_topics_sync(
    file_id: int,
    top_n: int,
    explain: bool,
    interview_context: str,
):
    print(f"🔍 Getting suggested topics for interview with file id: {file_id}")

    row = get_interview_from_db(file_id)
    if not row:
        return {"interview_topics_result": None, "error": "file not found"}

    tmp_path = write_temp_file(row)

    i = Interview(tmp_path)
    i.identify_interviewee(m)
    topics_result = i.suggest_topics_top_down(
        m,
        top_n,
        explain,
        interview_context,
    )

    return {
        "message": "Suggested topics result for interview",
        "interview_topics_result": topics_result,
    }


@app.get("/interview_topics/{file_id}")
async def get_suggested_topics_for_interview(
    file_id: int, top_n=5, explain: bool = True, interview_context: str = "General"
):
    try:
        return await run_in_threadpool(
            get_interview_topics_sync,
            file_id,
            top_n,
            explain,
            interview_context,
        )
    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        return {"interview_topics_result": None, "error": str(e)}


def get_interviews_for_study_from_db(study_id: str):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, filename, content
            FROM Interviews
            WHERE study_id = ?
            ORDER BY id
            """,
            (study_id,),
        )
        rows = cur.fetchall()
        return [{"id": r[0], "filename": r[1], "content": r[2]} for r in rows]
    finally:
        conn.close()


def get_study_topics_sync(
    study_id: str,
    top_n: int,
    interview_context: str,
):
    print(f"🔍 Getting suggested topics for study: {study_id}")

    rows = get_interviews_for_study_from_db(study_id)
    if not rows:
        return {
            "study_topics_result": None,
            "error": "study has no interviews",
        }

    interviews = []

    for row in rows:
        tmp_path = write_temp_file(row)
        interview = Interview(tmp_path)
        interview.id = row["id"]
        interview.identify_interviewee(m)
        interviews.append(interview)

    study = Study(interviews)

    topics_result = study.suggest_topics_all(
        m,
        top_n,
        interview_context,
    )

    return {
        "message": "Suggested topics result for study",
        "study_topics_result": topics_result,
    }


@app.get("/study_topics/{study_id}")
async def get_suggested_topics_for_study(
    study_id: str,
    top_n: int = 5,
    interview_context: str = "General",
):
    try:
        return await run_in_threadpool(
            get_study_topics_sync,
            study_id,
            top_n,
            interview_context,
        )
    except Exception as e:
        print(f"❌ study topic extraction failed: {e}")
        return {
            "study_topics_result": None,
            "error": str(e),
        }
