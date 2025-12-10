from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
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
from typing import Dict, Any

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

i: Interview
# Allow frontend (Svelte) to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path.cwd().joinpath("uploads.db")


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
    return conn


db_conn = init_db(DB_PATH)

def save_file_to_db(conn: sqlite3.Connection, filename: str, content: bytes) -> int:
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO uploads (filename, content) VALUES (?, ?)",
        (filename, content),
    )
    conn.commit()
    return cur.lastrowid


def update_file_in_db(conn: sqlite3.Connection, file_id: int, content: bytes) -> int:
    cur = conn.cursor()
    cur.execute(
        "UPDATE uploads SET content = ? WHERE id = ?",
        (sqlite3.Binary(content), file_id),
    )
    conn.commit()
    return file_id


def get_file_from_db(conn: sqlite3.Connection, file_id: int):
    cur = conn.cursor()
    cur.execute("SELECT filename, content FROM uploads WHERE id = ?", (file_id, ))
    row = cur.fetchone()
    if row:
        return {"filename": row[0], "content": row[1]}
    return None

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Save uploaded file and return its temp path"""
    try:
        content = await file.read()
        print(f"📁 Uploading file: {file.filename}, size: {len(content)} bytes")
        file_id = save_file_to_db(db_conn, file.filename, content)
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
        return {"speakers": [], "participant": "", "error": "file not found"}

    # write to a temporary file for qux360's Interview which expects a path
    suffix = Path(row["filename"]).suffix or ".xlsx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(row["content"])
        tmp_path = tmp.name

    try:
        i = Interview(tmp_path)
        speakers = i.get_speakers()
        interiewee = i.identify_interviewee(m).result
        return {"message": "Speakers found (participant identified)", "speakers": speakers, "participant": interiewee}
    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        return {"speakers": [], "participant": "", "error": str(e)}


@app.post("/anonymization_map")
async def get_speakers_anonymization_map(request: FileIdRequest):
    file_id = request.id
    print(f"🔍 Building anonymization map for file id: {file_id}")
    row = get_file_from_db(db_conn, file_id)
    if not row:
        return {"anonymization_map": {}, "error": "file not found"}

    suffix = Path(row["filename"]).suffix or ".xlsx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(row["content"])
        tmp_path = tmp.name

    try:
        i = Interview(tmp_path)
        map = i.anonymize_speakers_generic()
        return {"message": "Anonymization map", "anonymization_map": map}
    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        return {"anonymization_map": {}, "error": str(e)}


@app.post("/anonymize_speakers")
async def anonymize_speakers(speakers: SpeakersPayload):
    file_id = speakers.fileId
    anonymization_map = speakers.anonymization_map
    print(f"🔍 Anonymizing speakers for file id: {file_id} with map: {anonymization_map}")
    row = get_file_from_db(db_conn, file_id)
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
            file_id = update_file_in_db(db_conn, file_id, updated_content)
            print(f"✅ File updated in DB with id: {file_id}")
            return {"message": "Speakers anonymized", "anonymized_speakers_map": anonymized_map}

    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        return {"anonymized_speakers_map": "", "error": str(e)}
    

@app.post("/entities_anonymization_map")
async def get_entities_anonymization_map(request: FileIdRequest):
    file_id = request.id
    print(f"🔍 Building entities anonymization map for file id: {file_id}")
    row = get_file_from_db(db_conn, file_id)
    if not row:
        return {"entities_anonymization_map": {}, "error": "file not found"}

    suffix = Path(row["filename"]).suffix or ".xlsx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(row["content"])
        tmp_path = tmp.name

    try:
        i = Interview(tmp_path)
        entities = i.detect_entities()
        map = i.build_replacement_map(entities)
        return {"message": "Entities anonymization map", "entities_anonymization_map": map}
    except Exception as e:
        print(f"❌ qux360-demo failed: {e}")
        return {"entities_anonymization_map": {}, "error": str(e)}


