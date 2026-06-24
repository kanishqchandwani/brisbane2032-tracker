"""
init_db.py

Creates the SQLite database, runs the schema, and loads seed venue data.
Run this once before starting the API server.

Usage:
    python db/init_db.py
"""

import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "brisbane2032.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"
SEED_PATH = Path(__file__).parents[2] / "data" / "seed" / "venues.json"


def init():
    print(f"Initialising database at {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    with open(SCHEMA_PATH) as f:
        cursor.executescript(f.read())

    with open(SEED_PATH) as f:
        seed = json.load(f)

    for venue in seed["venues"]:
        cursor.execute(
            """
            INSERT OR IGNORE INTO venues (name, slug, location, type, sport, capacity, status)
            VALUES (:name, :slug, :location, :type, :sport, :capacity, :status)
            """,
            venue,
        )

        venue_id = cursor.execute(
            "SELECT id FROM venues WHERE slug = ?", (venue["slug"],)
        ).fetchone()[0]

        for entry in venue.get("budget_entries", []):
            cursor.execute(
                """
                INSERT INTO budget_entries
                    (venue_id, amount_aud, change_type, announced_at, source_url, source_label, notes)
                VALUES
                    (:venue_id, :amount_aud, :change_type, :announced_at, :source_url, :source_label, :notes)
                """,
                {**entry, "venue_id": venue_id},
            )

    conn.commit()
    conn.close()

    print(f"Done. Loaded {len(seed['venues'])} venues.")


if __name__ == "__main__":
    init()
