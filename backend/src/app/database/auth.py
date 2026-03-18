from typing import Annotated
from fastapi import Header, HTTPException


async def get_current_user_id(x_user_id: Annotated[str | None, Header()] = None) -> str:
    """
    Extracts the anonymous user/session ID from the X-User-ID header.
    """
    if not x_user_id:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: X-User-ID header is required to identify the session.",
        )
    return x_user_id
