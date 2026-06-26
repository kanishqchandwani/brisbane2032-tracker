-- Brisbane 2032 Budget Tracker Database Schema

-- All 17 Olympic venues
CREATE TABLE IF NOT EXISTS venues (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL UNIQUE,       -- url-safe identifier e.g. "gabba-stadium"
    location      TEXT NOT NULL,
    type          TEXT NOT NULL,              -- "existing", "upgraded", "new"
    sport         TEXT NOT NULL,              -- primary sport(s)
    capacity      INTEGER,
    status        TEXT NOT NULL DEFAULT 'planning',  -- planning, under_construction, complete
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Every budget figure ever announced for a venue
CREATE TABLE IF NOT EXISTS budget_entries (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id      INTEGER NOT NULL REFERENCES venues(id),
    amount_aud    REAL,                        -- exact figure as announced, in AUD (NULL if not yet publicly disclosed)
    change_type   TEXT NOT NULL,             -- "initial_estimate", "revised_estimate", "approved_budget", "actual"
    announced_at  TEXT NOT NULL,             -- date the figure was made public (ISO 8601)
    source_url    TEXT,                      -- URL of the announcement or document
    source_label  TEXT,                      -- human readable e.g. "Queensland Budget 2024-25"
    notes         TEXT,                      -- scope changes, caveats, context
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    UNIQUE (venue_id, announced_at, change_type)
);

-- Scraper run log so we can track what was checked and when
CREATE TABLE IF NOT EXISTS scraper_runs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    source        TEXT NOT NULL,             -- e.g. "qld_media_releases", "giica_reports"
    ran_at        TEXT NOT NULL DEFAULT (datetime('now')),
    entries_found INTEGER NOT NULL DEFAULT 0,
    status        TEXT NOT NULL,             -- "success", "failed", "partial"
    error         TEXT
);
