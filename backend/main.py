from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import qux360
from qux360.core import Interview
from mellea import MelleaSession
from mellea.backends.litellm import LiteLLMBackend
from dotenv import load_dotenv
import logging
import os
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


ROOT_DIR = Path.cwd()
data_dir = ROOT_DIR.joinpath("examples/data")
file = data_dir.joinpath("interview_A.xlsx")
export_file = data_dir.joinpath("interview_A_exported.xlsx")
config_file = ROOT_DIR.joinpath("examples/config.json")

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


UPLOAD_DIR = "./app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Save uploaded file and return its temp path"""
    if file.filename.endswith(".csv"):
        suffix = ".csv"
    elif file.filename.endswith(".xlsx"):
        suffix = ".xlsx"
    else:
        suffix= ".docx"

    """Save uploaded file and return the full path."""
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        print(f"✅ File saved at: {file_path}")
        return {"file_path": file_path}

    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return {"error": str(e)}


class FilePathRequest(BaseModel):
    path: str

@app.post("/extract_speakers")
async def extract_speakers(request: FilePathRequest):
    file_path = request.path
    print(f"🔍 Extracting speakers from: {file_path}")

    try:
        i = Interview(file_path)
        speakers = i.get_speakers()
        interiewee = i.identify_interviewee(m).result
        return {"message": "Speakers found", "speakers": speakers, "interviewee": interiewee}
    except Exception as e:
        print(f"❌ qux360 failed: {e}")
        return {"speakers": [], "interviewee": "", "error": str(e)}



@app.post("/analyze")
async def analyze_file(path: str = Form(...)):
    """Run qux360.xxxxxx(file) and return results"""
    results = qux360.xxxxxx(path)  # <-- replace with actual function name
    return {"results": results}

@app.post("/execute")
async def execute_action(choice: str = Form(...)):
    """Execute the right function based on user selection"""
    if choice == "A":  # adapt to your logic
        output = qux360.yyyyyy()
    else:
        output = qux360.zzzzz()
    return {"result": output}
