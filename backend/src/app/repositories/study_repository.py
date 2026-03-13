import sqlite3
import uuid

from app.database.connection import get_connection


def save_study(name: str) -> str:
    """Insert a new study and return its generated UUID."""
    study_id = str(uuid.uuid4())
    conn: sqlite3.Connection = get_connection()
    try:
        conn.execute("INSERT INTO Studies (id, name) VALUES (?, ?)", (study_id, name))
        conn.commit()
    finally:
        conn.close()
    return study_id


def get_study_by_name(name: str) -> str | None:
    """Return the study id for a given name, or None if not found."""
    conn: sqlite3.Connection = get_connection()
    try:
        cur = conn.execute("SELECT id FROM Studies WHERE name = ?", (name,))
        row = cur.fetchone()
        return row[0] if row else None
    finally:
        conn.close()
