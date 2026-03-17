import io
import os
import tempfile
import logging
from pathlib import Path
from typing import Any, List

import pandas as pd
from fastapi import UploadFile
from qux360.core import Interview

from app.models.schemas import LLMConfig
from app.services.llm_service import get_mellea_session

from app.repositories import study_repository, interview_repository

logger = logging.getLogger(__name__)


def write_temp_file(row: dict[str, Any]) -> str:
    """Write binary content to a temporary file and return its path."""
    suffix = Path(row["filename"]).suffix or ".xlsx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(row["content"])
        tmp_path = tmp.name
    return tmp_path


def json_to_xlsx_bytes(records: list[dict]) -> bytes:
    """Convert a list of dictionaries into an XLSX file using pandas."""
    if not records:
        raise ValueError("No data provided to generate XLSX.")

    df = pd.DataFrame(records)
    # Ensure columns match expected transcript format
    if all(col in df.columns for col in ["timestamp", "speaker", "statement"]):
        df = df[["timestamp", "speaker", "statement"]]

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Transcript")

    return buffer.getvalue()


def upload_interview_sync(study_name: str, files: List[UploadFile]):
    study_id = study_repository.get_study_by_name(study_name)
    if not study_id:
        study_id = study_repository.save_study(study_name)

    new_filenames = [file.filename for file in files if file.filename]

    interview_repository.delete_removed_interviews(study_id, new_filenames)

    uploaded_files = []
    for file in files:
        if not file.filename:
            continue
        content = file.file.read()
        logger.info("Uploading file: %s, size: %d bytes", file.filename, len(content))
        interview_id = interview_repository.save_or_update_interview(
            study_id, file.filename, content
        )
        uploaded_files.append({"file_id": interview_id, "filename": file.filename})

    return {"study_id": study_id, "uploaded_files": uploaded_files}


def identify_participant_sync(file_id: int, llm_config: LLMConfig):
    row = interview_repository.get_interview_from_db(file_id)
    if not row:
        return {
            "error": "file not found",
            "speakers": [],
            "participant": "",
            "validation": None,
        }

    mellea_session = get_mellea_session(llm_config)
    tmp_path = write_temp_file(row)
    try:
        i = Interview(tmp_path)
        speakers = i.get_speakers()
        interviewee = i.identify_interviewee(mellea_session)

        return {
            "message": "Speakers found (participant identified)",
            "speakers": speakers,
            "participant": interviewee.result,
            "validation": interviewee.validation,
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def speakers_anonymization_map_sync(file_id: int):
    row = interview_repository.get_interview_from_db(file_id)
    if not row:
        return {"speakers_anonymization_map": {}, "error": "file not found"}

    tmp_path = write_temp_file(row)
    try:
        i = Interview(tmp_path)
        speakers_map = i.anonymize_speakers_generic()

        return {
            "message": "Speakers Anonymization map",
            "speakers_anonymization_map": speakers_map,
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def entities_anonymization_map_sync(file_id: int):
    row = interview_repository.get_interview_from_db(file_id)
    if not row:
        return {"entities_anonymization_map": {}, "error": "file not found"}

    tmp_path = write_temp_file(row)
    try:
        i = Interview(tmp_path)
        entities = i.detect_entities()
        entities_map = i.build_replacement_map(entities)

        return {
            "message": "Entities anonymization map",
            "entities_anonymization_map": entities_map,
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def transcript_sync(file_id: int):
    row = interview_repository.get_interview_from_db(file_id)
    if not row:
        raise ValueError("file not found")

    tmp_path = write_temp_file(row)
    try:
        i = Interview(tmp_path)
        transcript_raw = i.transcript_raw
        selected_df = transcript_raw[["timestamp", "speaker", "statement"]]

        return [
            {"index": idx, **r}
            for idx, r in enumerate(selected_df.to_dict(orient="records"))
        ]
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def update_transcript_sync(file_id: int, content: list[dict]):
    row = interview_repository.get_interview_from_db(file_id)
    if not row:
        raise ValueError("file not found")

    xlsx_bytes = json_to_xlsx_bytes(content)
    filename = Path(row["filename"]).stem + ".xlsx"
    updated_id = interview_repository.update_interview_in_db(
        file_id, filename, xlsx_bytes
    )

    return {
        "message": "Transcript updated",
        "updated_transcript": updated_id,
    }


def get_interview_topics_sync(
    file_id: int,
    top_n: int,
    explain: bool,
    interview_context: str,
    llm_config: LLMConfig,
):
    row = interview_repository.get_interview_from_db(file_id)
    if not row:
        return {"interview_topics_result": None, "error": "file not found"}

    mellea_session = get_mellea_session(llm_config)
    tmp_path = write_temp_file(row)
    try:
        i = Interview(tmp_path)
        i.identify_interviewee(mellea_session)
        topics_result = i.suggest_topics_top_down(
            mellea_session,
            top_n,
            explain,
            interview_context,
        )

        return {
            "message": "Suggested topics result for interview",
            "interview_topics_result": topics_result,
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
