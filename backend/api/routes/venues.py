"""
routes/venues.py

Endpoints for retrieving venue information.

GET /venues           - list all venues
GET /venues/{slug}    - get a single venue with its full budget history
"""

from fastapi import APIRouter, HTTPException
from ..database import get_connection

router = APIRouter()


@router.get("/")
def list_venues():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM venues ORDER BY name").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.get("/{slug}")
def get_venue(slug: str):
    conn = get_connection()

    venue = conn.execute(
        "SELECT * FROM venues WHERE slug = ?", (slug,)
    ).fetchone()

    if not venue:
        conn.close()
        raise HTTPException(status_code=404, detail="Venue not found")

    entries = conn.execute(
        """
        SELECT * FROM budget_entries
        WHERE venue_id = ?
        ORDER BY announced_at ASC
        """,
        (venue["id"],),
    ).fetchall()

    conn.close()

    return {
        **dict(venue),
        "budget_history": [dict(e) for e in entries],
    }
