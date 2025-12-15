from http.client import HTTPException
from typing import Any
from fastapi import FastAPI, UploadFile, File
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile
from qux360.core import Interview
from mellea import MelleaSession
from mellea.backends.litellm import LiteLLMBackend, litellm
from dotenv import load_dotenv
import logging
import os
import sqlite3
from pathlib import Path
from pydantic import BaseModel
from typing import Dict, Any
import pandas as pd
import io

app = FastAPI()
load_dotenv()
ROOT_DIR = os.path.dirname(os.path.dirname(os.getcwd()))

m = MelleaSession(backend=LiteLLMBackend(model_id=os.getenv("MODEL_ID")))

# Suppress Mellea's FancyLogger (MelleaSession resets it to DEBUG, so we set it here)
logging.getLogger('fancy_logger').setLevel(logging.WARNING)

# Configure logging
logging.basicConfig(level=logging.WARNING, format='%(message)s')

# Enable INFO logging only for qux360
logging.getLogger("qux360").setLevel(logging.INFO)


m = MelleaSession(backend=LiteLLMBackend(model_id=os.getenv("MODEL_ID"))) # type: ignore

# Allow frontend (Svelte) to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path.cwd().joinpath("uploads.db")


class FilePathRequest(BaseModel):
    path: str


class FileIdRequest(BaseModel):
    id: int

class SpeakersPayload(BaseModel):
    fileId: int
    anonymization_map: Dict[str, Any]

# Initialize a very small SQLite DB to store uploaded files as blobs
def init_db(path: Path):
    conn = sqlite3.connect(path)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS uploads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            content BLOB NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def get_connection() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def save_file_to_db(filename: str, content: bytes) -> int:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO uploads (filename, content) VALUES (?, ?)",
            (filename, content),
        )
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def update_file_in_db(file_id: int, filename: str, content: bytes) -> int:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE uploads SET content = ?, filename = ? WHERE id = ?",
            (sqlite3.Binary(content), filename, file_id),
        )
        conn.commit()
        return file_id
    finally:
        conn.close()


def get_file_from_db(file_id: int):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT filename, content FROM uploads WHERE id = ?", (file_id,))
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


def upload_file_sync(file: UploadFile):
    content = file.file.read()
    print(f"📁 Uploading file: {file.filename}, size: {len(content)} bytes")
    file_id = save_file_to_db(file.filename, content)
    print(f"✅ File saved in DB with id: {file_id}")
    return {"file_id": file_id}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Save uploaded file and return its temp path"""
    try:
        return await run_in_threadpool(upload_file_sync, file)
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return {"error": str(e)}


'''
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Save uploaded file and return its file ID in the DB"""
    try:
        content = await file.read()
        i = Interview(content)
        transcript_raw = i.transcript_raw
        selected_df = transcript_raw[["timestamp", "speaker", "statement"]]
        data = [
            {"index": idx, **row}
            for idx, row in enumerate(selected_df.to_dict(orient="records"))
        ]

        transcript_json = JSONResponse(content=data)
        print(f"📁 Uploading file: {file.filename}, size: {len(transcript_json)} bytes")
        file_id = save_file_to_db(file.filename, transcript_json)
        print(f"✅ File saved in DB with id: {file_id}")
        return {"file_id": file_id}
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return {"error": str(e)}
'''


def identify_participant_sync(file_id: int):
    print(f"🔍 Extracting speakers and identifying participant from file id: {file_id}")

    row = get_file_from_db(file_id)
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
    row = get_file_from_db(file_id)
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


@app.post("/anonymize_speakers")
async def anonymize_speakers(speakers: SpeakersPayload):
    file_id = speakers.fileId
    anonymization_map = speakers.anonymization_map
    print(f"🔍 Anonymizing speakers for file id: {file_id} with map: {anonymization_map}")
    row = get_file_from_db(file_id)
    if not row:
        return {"anonymized_speakers_map": "", "error": "file not found"}

    suffix = Path(row["filename"]).suffix or ".xlsx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(row["content"])
        tmp_path = tmp.name

    try:
        i = Interview(tmp_path)

        if "speaker" not in i.transcript.columns:
            raise ValueError("No 'speaker' column found in the transcript.")

        i.speaker_mapping = anonymization_map
        for k in anonymization_map.keys():
            old = k
            new = anonymization_map.get(k)

            print(f"🔄 Renaming speaker '{old}' to '{new}'")
            anonymized_map = i.rename_speaker(old, new)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as updated_tmp:
            i.to_xlsx(updated_tmp, include_enriched=False)
            updated_tmp_path = updated_tmp.name

        with open(updated_tmp_path, "rb") as f:
            updated_content = f.read()
            filename = Path(row["filename"]).stem + ".xlsx"
            file_id = update_file_in_db(file_id, filename, updated_content)
            print(f"✅ File updated in DB with id: {file_id}")
            return {"message": "Speakers anonymized", "anonymized_speakers_map": anonymized_map}

    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        return {"anonymized_speakers_map": "", "error": str(e)}


def entities_anonymization_map_sync(file_id: int):
    print(f"🔍 Building entities anonymization map for file id: {file_id}")
    row = get_file_from_db(file_id)
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
    row = get_file_from_db(file_id)
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

    buffer = io.BytesIO()

    # Explicitly use openpyxl engine for writing
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Transcript")

    return buffer.getvalue()


def update_transcript_sync(file_id: int, content: list[dict]):
    row = get_file_from_db(file_id)
    if not row:
        return {"error": "file not found"}

    try:
        xlsx_bytes = json_to_xlsx_bytes(content)
    except Exception as e:
        raise Exception(e)

    # Update DB
    filename = Path(row["filename"]).stem + ".xlsx"
    updated_id = update_file_in_db(file_id, filename, xlsx_bytes)

    print(f"✅ File updated in DB with id: {updated_id}")

    return {
        "message": "Transcript updated",
        "updated_transcript": updated_id,
    }


@app.post("/update_transcript")
async def update_transcript(file_id: int, content: list[dict]):
    try:
        return await run_in_threadpool(
            update_transcript_sync,
            file_id,
            content,
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

    row = get_file_from_db(file_id)
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
