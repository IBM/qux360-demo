import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[3] / "database.db"


def get_connection() -> sqlite3.Connection:
    """Return a new SQLite connection to the shared database."""
    return sqlite3.connect(DB_PATH)


def init_db() -> None:
    """Create database tables if they don't already exist."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS Studies (
            id   TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS Interviews (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT    NOT NULL,
            filename TEXT    NOT NULL,
            content  BLOB    NOT NULL,
            FOREIGN KEY (study_id) REFERENCES Studies(id) ON DELETE CASCADE
        )
        """
    )

    conn.commit()
    conn.close()
