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
        v.name,
        v.slug,
        v.status,
        v.type,
        MAX(b.amount_aud) AS latest_amount,
        MIN(b.amount_aud) AS initial_amount,
        COUNT(b.id)       AS revision_count
    FROM venues v
    LEFT JOIN budget_entries b ON b.venue_id = v.id
    GROUP BY v.id
    ORDER BY latest_amount DESC
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
