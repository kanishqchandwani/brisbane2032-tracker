"""
routes/budget.py

Endpoints for programme-level budget aggregation.

GET /budget/summary   - total announced cost across all venues
GET /budget/timeline  - all budget entries ordered by date (for the main timeline chart)
"""

from fastapi import APIRouter
from ..database import get_connection

router = APIRouter()


@router.get("/summary")
def budget_summary():
    conn = get_connection()

    rows = conn.execute(
    """
    SELECT
        b.announced_at,
        b.amount_aud,
        b.change_type,
        b.source_label,
        b.notes,
        v.name  AS venue_name,
        v.slug  AS venue_slug
    FROM budget_entries b
    JOIN venues v ON v.id = b.venue_id
    WHERE b.amount_aud IS NOT NULL
      AND b.announced_at = (
          SELECT MAX(b2.announced_at)
          FROM budget_entries b2
          WHERE b2.venue_id = b.venue_id
            AND b2.amount_aud IS NOT NULL
      )
    GROUP BY v.id
    ORDER BY b.amount_aud DESC
    """
    ).fetchall()

    total = conn.execute(
        """
        SELECT SUM(latest) FROM (
            SELECT MAX(amount_aud) AS latest
            FROM budget_entries
            GROUP BY venue_id
        )
        """
    ).fetchone()[0]

    conn.close()

    return {
        "total_programme_cost_aud": total,
        "venues": [dict(r) for r in rows],
    }


@router.get("/timeline")
def budget_timeline():
    conn = get_connection()

    rows = conn.execute(
        """
        SELECT
            b.announced_at,
            b.amount_aud,
            b.change_type,
            b.source_label,
            b.notes,
            v.name  AS venue_name,
            v.slug  AS venue_slug
        FROM budget_entries b
        JOIN venues v ON v.id = b.venue_id
        ORDER BY b.announced_at ASC
        """
    ).fetchall()

    conn.close()

    return [dict(r) for r in rows]
