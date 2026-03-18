import logging
import base64
from typing import Any

from app.database.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)


def save_or_update_interview(
    study_id: str, filename: str, content: bytes, user_id: str
) -> int:
    """
    Insert a new interview row or update the content of an existing one in Supabase.
    Returns the interview id.
    """
    supabase = get_supabase_client()

    # Check if exists
    response = (
        supabase.table("interviews")
        .select("id")
        .eq("study_id", study_id)
        .eq("filename", filename)
        .eq("user_id", user_id)
        .execute()
    )

    content_b64 = base64.b64encode(content).decode("utf-8")

    if response.data:
        interview_id: int = response.data[0]["id"]
        supabase.table("interviews").update({"content": content_b64}).eq(
            "id", interview_id
        ).execute()
        logger.info("Updated interview '%s' (id=%d)", filename, interview_id)
    else:
        insert_response = (
            supabase.table("interviews")
            .insert(
                {
                    "study_id": study_id,
                    "filename": filename,
                    "content": content_b64,
                    "user_id": user_id,
                }
            )
            .execute()
        )
        interview_id = insert_response.data[0]["id"]
        logger.info("Inserted interview '%s' (id=%d)", filename, interview_id)

    return interview_id


def delete_removed_interviews(
    study_id: str, kept_filenames: list[str], user_id: str
) -> None:
    """
    Delete interviews belonging to *study_id* and *user_id* whose filenames are NOT in
    *kept_filenames*.
    """
    supabase = get_supabase_client()
    query = (
        supabase.table("interviews")
        .delete()
        .eq("study_id", study_id)
        .eq("user_id", user_id)
    )

    if kept_filenames:
        query = query.not_.in_("filename", kept_filenames)

    query.execute()


def update_interview_in_db(
    file_id: int, filename: str, content: bytes, user_id: str
) -> int:
    """Overwrite the filename and content of an existing interview. Returns file_id."""
    supabase = get_supabase_client()
    content_b64 = base64.b64encode(content).decode("utf-8")
    supabase.table("interviews").update(
        {"content": content_b64, "filename": filename}
    ).eq("id", file_id).eq("user_id", user_id).execute()
    return file_id


def get_interview_from_db(file_id: int, user_id: str) -> dict[str, Any] | None:
    """Return {filename, content} for the interview, or None if not found."""
    supabase = get_supabase_client()
    response = (
        supabase.table("interviews")
        .select("filename, content")
        .eq("id", file_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not response.data:
        return None

    row = response.data[0]
    # Decode base64 back to bytes
    content = base64.b64decode(row["content"])
    return {"filename": row["filename"], "content": content}


def get_interviews_for_study_from_db(
    study_id: str, user_id: str
) -> list[dict[str, Any]]:
    """Return all interviews for a given study and user ordered by id."""
    supabase = get_supabase_client()
    response = (
        supabase.table("interviews")
        .select("id, filename, content")
        .eq("study_id", study_id)
        .eq("user_id", user_id)
        .order("id")
        .execute()
    )
    return [
        {
            "id": r["id"],
            "filename": r["filename"],
            "content": base64.b64decode(r["content"]),
        }
        for r in response.data
    ]
