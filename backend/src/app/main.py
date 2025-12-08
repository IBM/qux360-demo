from typing import Any
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile
import qux360
from qux360.core import Interview
from mellea import MelleaSession
from mellea.backends.litellm import LiteLLMBackend
from dotenv import load_dotenv
import logging
import os
import sqlite3
from datetime import datetime
from pathlib import Path
from pydantic import BaseModel

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

# Initialize a very small SQLite DB to store uploaded files as blobs
def init_db(path: Path):
    conn = sqlite3.connect(path)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS uploads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            content_type TEXT,
            content BLOB NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    return conn


db_conn = init_db(DB_PATH)

def save_file_to_db(conn: sqlite3.Connection, filename: str, content_type: str, content: bytes) -> int:
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO uploads (filename, content_type, content, created_at) VALUES (?, ?, ?, ?)",
        (filename, content_type, content, datetime.utcnow().isoformat()),
    )
    conn.commit()
    return cur.lastrowid


def get_file_from_db(conn: sqlite3.Connection, file_id: int):
    cur = conn.cursor()
    cur.execute("SELECT filename, content_type, content FROM uploads WHERE id = ?", (file_id,))
    row = cur.fetchone()
    if row:
        return {"filename": row[0], "content_type": row[1], "content": row[2]}
    return None


def write_temp_file(row: dict[str, Any]) -> str:
    # write to a temporary file for qux360's Interview which expects a path
    suffix = Path(row["filename"]).suffix or ".xlsx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(row["content"])
        tmp_path = tmp.name

    return tmp_path


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Save uploaded file and return its temp path"""
    try:
        content = await file.read()
        file_id = save_file_to_db(db_conn, file.filename, file.content_type or "", content)
        print(f"✅ File saved in DB with id: {file_id}")
        return {"file_id": file_id}
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return {"error": str(e)}


class FilePathRequest(BaseModel):
    path: str


class FileIdRequest(BaseModel):
    id: int

@app.post("/identify_participant")
async def identify_participant(request: FileIdRequest):
    file_id = request.id
    print(f"🔍 Extracting speakers and identifying participant from file id: {file_id}")
    row = get_file_from_db(db_conn, file_id)
    if not row:
        return {
            "error": "file not found",
            "speakers": [],
            "participant": "",
            "validation": None,
        }

    tmp_path = write_temp_file(row)

    try:
        i = Interview(tmp_path)
        speakers: list[str] = i.get_speakers()
        interviewee = i.identify_interviewee(m)
        participant = interviewee.result
        return {
            "message": "Speakers found (participant identified)",
            "speakers": speakers,
            "participant": participant,
            "validation": interviewee.validation,
        }
    except Exception as e:
        print(f"❌ qux360 failed: {e}")
        return {"error": str(e), "speakers": [], "participant": "", "validation": None}


@app.post("/anonymization_map")
async def get_speakers_anonymization_map(request: FileIdRequest):
    file_id = request.id
    print(f"🔍 Building anonymization map for file id: {file_id}")
    row = get_file_from_db(db_conn, file_id)
    if not row:
        return {"anonymization_map": {}, "error": "file not found"}

    tmp_path = write_temp_file(row)

    try:
        i = Interview(tmp_path)
        map = i.anonymize_speakers_generic()
        return {"message": "Anonymization map", "anonymization_map": map}
    except Exception as e:
        print(f"❌ qux360 failed: {e}")
        return {"anonymization_map": {}, "error": str(e)}


@app.get("/transcript/{file_id}")
async def get_transcript(file_id: int):
    row = get_file_from_db(db_conn, file_id)
    if not row:
        return {
            "error": "file not found",
        }

    tmp_path = write_temp_file(row)

    try:
        i = Interview(tmp_path)
        transcript_raw = i.transcript_raw
        selected_df = transcript_raw[["timestamp", "speaker", "statement"]]
        data = selected_df.to_dict(orient="records")

        return JSONResponse(content=data)

    except Exception as e:
        print(f"❌ qux360 failed: {e}")
        return {"error": str(e)}
