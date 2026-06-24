# Brisbane 2032 Venue Cost & Budget Tracker

A public-facing tool that tracks official Brisbane 2032 Olympic venue budget announcements over time,
visualises cost changes, and compares announced budgets against actuals across all 17 venues.

Budget transparency for mega infrastructure projects is notoriously poor. This tool pulls from
government media releases, infrastructure reports, and official GIICA announcements to keep a
running, auditable record of every cost change.

---

## Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Scraper     | Python, BeautifulSoup, pdfplumber |
| Database    | SQLite                            |
| Backend API | Python, FastAPI                   |
| Frontend    | React, Recharts                   |
| Data seed   | JSON                              |

---

## Project Structure

```
brisbane2032/
  backend/
    scraper/        # Pulls announcements from gov sites and PDFs
    api/            # FastAPI routes serving venue and budget data
    db/             # SQLite schema and migration scripts
  frontend/
    src/
      components/   # Reusable UI components (charts, tables, cards)
      pages/        # Dashboard, venue detail, timeline views
      data/         # Static fallback data if API is unreachable
  data/
    seed/           # Initial venue budgets loaded from public announcements
  docs/             # Source citations and data methodology notes
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- pip
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python db/init_db.py        # Creates SQLite database and loads seed data
uvicorn api.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

---

## Data Sources

Budget figures are sourced from:

- Queensland Government media releases (statements.qld.gov.au)
- GIICA (Games Infrastructure and Investment Coordination Agency) reports
- Queensland Treasury infrastructure budgets
- Brisbane 2032 official announcements (olympics.com)

All figures are recorded in AUD. Each entry in the database includes the source URL,
announcement date, and the original figure as stated, with no adjustments.

---

## Roadmap

- [x] Project scaffold and seed data
- [ ] SQLite schema and database init script
- [ ] FastAPI endpoints for venues and budget history
- [ ] Scraper for Queensland Government media releases
- [ ] PDF parser for GIICA infrastructure reports
- [ ] React dashboard with venue overview cards
- [ ] Budget vs announced cost timeline chart per venue
- [ ] Total programme cost tracker across all 17 venues
- [ ] Deployment to Render or Railway

---

## Why This Exists

The Brisbane 2032 Olympics involves billions in public spending across 17 venues.
Official announcements exist but are scattered across PDFs, press releases, and government portals.
There is no single place that shows how costs have changed from initial announcement to today.
This project is that place.

---

## Data Methodology

All entries follow a strict format:

- **Source**: URL or document reference
- **Announced date**: Date the figure was made public
- **Amount (AUD)**: Exactly as stated in the source, no inflation adjustments
- **Change type**: Initial estimate, revised estimate, or approved budget
- **Notes**: Any relevant context (scope changes, scope inclusions, etc.)

Manual entries go through the same format so the dataset stays consistent whether
data came from the scraper or was entered by hand.
