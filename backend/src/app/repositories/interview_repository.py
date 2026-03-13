import logging
import sqlite3
from typing import Any

from app.database.connection import get_connection

logger = logging.getLogger(__name__)


def save_or_update_interview(
    study_id: str, filename: str, content: bytes
) -> int:
    """
    Insert a new interview row or update the content of an existing one.
    Returns the interview id.
    """
    conn: sqlite3.Connection = get_connection()
    try:
        cur = conn.execute(
            "SELECT id FROM Interviews WHERE study_id = ? AND filename = ?",
            (study_id, filename),
        )
        row = cur.fetchone()

        if row:
            interview_id: int = row[0]
            conn.execute(
                "UPDATE Interviews SET content = ? WHERE id = ?",
                (content, interview_id),
            )
            logger.info("Updated interview '%s' (id=%d)", filename, interview_id)
        else:
            cur = conn.execute(
                "INSERT INTO Interviews (study_id, filename, content) VALUES (?, ?, ?)",
                (study_id, filename, content),
            )
            interview_id = cur.lastrowid  # type: ignore[assignment]
            logger.info("Inserted interview '%s' (id=%d)", filename, interview_id)

        conn.commit()
        return interview_id
    finally:
        conn.close()


def delete_removed_interviews(study_id: str, kept_filenames: list[str]) -> None:
    """
    Delete interviews belonging to *study_id* whose filenames are NOT in
    *kept_filenames*.  If *kept_filenames* is empty, all interviews for the
    study are removed.
    """
    conn: sqlite3.Connection = get_connection()
    try:
        if kept_filenames:
            placeholders = ",".join("?" * len(kept_filenames))
            conn.execute(
                f"DELETE FROM Interviews WHERE study_id = ? AND filename NOT IN ({placeholders})",
                [study_id, *kept_filenames],
            )
        else:
            conn.execute(
                "DELETE FROM Interviews WHERE study_id = ?", (study_id,)
            )
        conn.commit()
    finally:
        conn.close()


def update_interview_in_db(file_id: int, filename: str, content: bytes) -> int:
    """Overwrite the filename and content of an existing interview. Returns file_id."""
    conn: sqlite3.Connection = get_connection()
    try:
        conn.execute(
            "UPDATE Interviews SET content = ?, filename = ? WHERE id = ?",
            (sqlite3.Binary(content), filename, file_id),
        )
        conn.commit()
        return file_id
    finally:
        conn.close()


def get_interview_from_db(file_id: int) -> dict[str, Any] | None:
    """Return {filename, content} for the interview, or None if not found."""
    conn: sqlite3.Connection = get_connection()
    try:
        cur = conn.execute(
            "SELECT filename, content FROM Interviews WHERE id = ?", (file_id,)
        )
        row = cur.fetchone()
        if not row:
            return None
        return {"filename": row[0], "content": row[1]}
    finally:
        conn.close()


def get_interviews_for_study_from_db(study_id: str) -> list[dict[str, Any]]:
    """Return all interviews for a given study ordered by id."""
    conn: sqlite3.Connection = get_connection()
    try:
        cur = conn.execute(
            """
            SELECT id, filename, content
            FROM Interviews
            WHERE study_id = ?
            ORDER BY id
            """,
            (study_id,),
        )
        return [{"id": r[0], "filename": r[1], "content": r[2]} for r in cur.fetchall()]
    finally:
        conn.close()
