import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.concurrency import run_in_threadpool

from app.database.auth import get_current_user_id
from app.models.schemas import SuggestThemesPayload
from app.services import study_service

router = APIRouter(prefix="/studies", tags=["Studies"])
logger = logging.getLogger(__name__)


@router.post("/{study_id}/suggest-themes")
async def get_suggested_themes_for_study(
    study_id: str,
    payload: SuggestThemesPayload,
    user_id: str = Depends(get_current_user_id),
):
    """Get AI-suggested themes across all interviews in a study."""
    if not payload.llm_config:
        raise HTTPException(
            status_code=400, detail="LLM configuration is mandatory for this operation."
        )
    try:
        result = await run_in_threadpool(
            study_service.get_study_themes_sync,
            study_id,
            payload.topics,
            payload.top_n,
            payload.study_context,
            payload.llm_config,
            user_id,
        )
        if "error" in result:
            # If study has no interviews, it's a 404 or 400 depending on preference
            # original code returned error field in 200, we'll use 400 for 'no interviews'
            status_code = 404 if "not found" in result["error"] else 400
            raise HTTPException(status_code=status_code, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Study themes suggestion failed")
        raise HTTPException(status_code=500, detail=str(e)) from e
