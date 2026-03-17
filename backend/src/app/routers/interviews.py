import logging
from typing import List
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse

from app.models.schemas import (
    IdentifyParticipantPayload,
    InterviewTopicsPayload,
    UpdateTranscriptPayload,
)
from app.services import interview_service

router = APIRouter(prefix="/interviews", tags=["Interviews"])
logger = logging.getLogger(__name__)


@router.post("/upload")
async def upload_study_interviews(
    study_name: str = Form(...), files: List[UploadFile] = File(...)
):
    """Save uploaded interviews for a study and return their metadata."""
    try:
        return await run_in_threadpool(
            interview_service.upload_interview_sync, study_name, files
        )
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/{file_id}/identify-participant")
async def identify_participant(file_id: int, payload: IdentifyParticipantPayload):
    """Extract speakers and identify the main participant for an interview."""
    try:
        result = await run_in_threadpool(
            interview_service.identify_participant_sync, file_id, payload.llm_config
        )
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Participant identification failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/{file_id}/anonymize/speakers")
async def get_speakers_anonymization_map(file_id: int):
    """Generate a map for anonymizing speakers in an interview."""
    try:
        result = await run_in_threadpool(
            interview_service.speakers_anonymization_map_sync, file_id
        )
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Speakers anonymization failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/{file_id}/anonymize/entities")
async def get_entities_anonymization_map(file_id: int):
    """Generate a map for anonymizing entities (names, places) in an interview."""
    try:
        result = await run_in_threadpool(
            interview_service.entities_anonymization_map_sync, file_id
        )
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Entities anonymization failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get(
    "/{file_id}/transcript",
)
async def get_transcript(file_id: int):
    """Get the processed transcript for an interview."""
    try:
        data = await run_in_threadpool(interview_service.transcript_sync, file_id)
        return JSONResponse(content=data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        logger.exception("Transcript retrieval failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.put("/{file_id}/transcript")
async def update_transcript(file_id: int, payload: UpdateTranscriptPayload):
    """Update the transcript content for an interview."""
    try:
        return await run_in_threadpool(
            interview_service.update_transcript_sync,
            file_id,
            payload.content,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("Transcript update failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/{file_id}/suggest-topics")
async def get_suggested_topics_for_interview(
    file_id: int,
    payload: InterviewTopicsPayload,
):
    """Get AI-suggested topics for a single interview."""
    try:
        result = await run_in_threadpool(
            interview_service.get_interview_topics_sync,
            file_id,
            payload.top_n,
            payload.explain,
            payload.interview_context,
            payload.llm_config,
        )
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Topic suggestion failed")
        raise HTTPException(status_code=500, detail=str(e)) from e
