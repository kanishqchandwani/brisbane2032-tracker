"""
database.py

Shared SQLite connection helper used across API routes.
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parents[1] / "db" / "brisbane2032.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # rows behave like dicts
    return conn
