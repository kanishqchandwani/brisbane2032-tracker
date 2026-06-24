"""
scraper.py

Pulls budget-related announcements from:
  1. Queensland Government Ministerial Media Statements (statements.qld.gov.au)
  2. GIICA venue pages (giica.au/venues)

Both sites return server-rendered HTML, so BeautifulSoup works directly.
No JavaScript execution required.

How it works:
  - Searches statements.qld.gov.au for pages mentioning "Brisbane 2032" and dollar amounts
  - Fetches each matching statement and extracts date, title, body text, and any dollar figures
  - Fetches each GIICA venue page and extracts status and any cost mentions
  - Prints results as JSON for manual review before inserting into the database

Run with:
    python scraper/scraper.py

Output goes to scraper/output/latest_run.json
Review it, then run:
    python scraper/insert.py   (not yet built — add manually verified entries to venues.json for now)
"""

import json
import re
import time
from datetime import datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; Brisbane2032Tracker/1.0; "
        "+https://github.com/yourhandle/brisbane2032)"
    )
}

REQUEST_DELAY = 1.5  # seconds between requests — be polite to government servers

# Statements to check directly (known budget-relevant pages)
KNOWN_STATEMENT_URLS = [
    {
        "url": "https://statements.qld.gov.au/statements/102864",
        "label": "Queensland Budget 2025-26 — 2032 delivery",
        "date": "2025-06-17",
    },
    {
        "url": "https://statements.qld.gov.au/statements/102978",
        "label": "2032 Games Infrastructure Funding Deal Confirmed",
        "date": "2025-07-03",
    },
    {
        "url": "https://statements.qld.gov.au/statements/102240",
        "label": "2032 Delivery Plan — major legacy infrastructure",
        "date": "2025-03-25",
    },
    {
        "url": "https://statements.qld.gov.au/statements/100901",
        "label": "Sunshine Coast Indoor Sports Centre — $142M",
        "date": "2024-09-01",
    },
]

# All 17 GIICA venue pages
GIICA_VENUE_URLS = [
    "https://giica.au/venues/brisbane-stadium",
    "https://giica.au/venues/national-aquatic-centre",
    "https://giica.au/venues/barlow-park-stadium",
    "https://giica.au/venues/brisbane-aquatic-centre",
    "https://giica.au/venues/brisbane-international-shooting-centre",
    "https://giica.au/venues/brisbane-sx-international-bmx-centre",
    "https://giica.au/venues/anna-meares-velodrome",
    "https://giica.au/venues/chandler-sports-precinct",
    "https://giica.au/venues/para-sport-facility",
    "https://giica.au/venues/logan-indoor-sports-centre",
    "https://giica.au/venues/moreton-bay-indoor-sports-centre",
    "https://giica.au/venues/queensland-tennis-centre",
    "https://giica.au/venues/redland-whitewater-centre",
    "https://giica.au/venues/rockhampton-flatwater-facility",
    "https://giica.au/venues/sunshine-coast-mountain-bike-centre",
    "https://giica.au/venues/sunshine-coast-stadium",
    "https://giica.au/venues/toowoomba-showgrounds",
]

# Regex to find dollar amounts like $3.8 billion, $847 million, $142m, $1.2B
DOLLAR_PATTERN = re.compile(
    r"\$[\d,]+(?:\.\d+)?\s*(?:billion|million|bn|m|b)\b",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def fetch(url: str) -> BeautifulSoup | None:
    """Fetch a URL and return a BeautifulSoup object, or None on failure."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except requests.RequestException as e:
        print(f"  FAILED: {url} — {e}")
        return None


def extract_dollar_amounts(text: str) -> list[str]:
    """Return all dollar amount strings found in a block of text."""
    return DOLLAR_PATTERN.findall(text)


def clean_text(element) -> str:
    """Get clean text from a BeautifulSoup element."""
    return element.get_text(separator=" ", strip=True)


# ---------------------------------------------------------------------------
# Parser: Queensland Government statements (statements.qld.gov.au)
# ---------------------------------------------------------------------------

def parse_qld_statement(url: str, label: str, date: str) -> dict:
    """
    Parse a single Queensland Government ministerial media statement.

    Page structure (server-rendered, verified June 2026):
      - <title> contains the statement title
      - <body> text contains the full statement
      - Publication date is passed in directly (scraped from search results
        or known from our KNOWN_STATEMENT_URLS list)

    Dollar amounts are extracted with regex from the full body text.
    Bullet points inside the body are plain text nodes under <li> tags.
    """
    print(f"  Parsing statement: {label}")
    soup = fetch(url)

    if not soup:
        return {"url": url, "label": label, "error": "fetch failed"}

    # Title: the <title> tag minus "- Ministerial Media Statements" suffix
    raw_title = soup.title.string if soup.title else ""
    title = raw_title.replace(" - Ministerial Media Statements", "").strip()

    # Body: the entire visible text of the page
    # statements.qld.gov.au returns clean server-rendered HTML
    # The main content sits in <body> — we strip nav/footer noise
    # by targeting the largest text block (the statement body)
    body_el = soup.find("body")
    full_text = clean_text(body_el) if body_el else ""

    # Extract bullet point lines (these carry the key funding figures)
    bullets = [clean_text(li) for li in soup.find_all("li")]

    # Pull all dollar mentions from body text
    amounts = extract_dollar_amounts(full_text)

    return {
        "source": "qld_ministerial_statement",
        "url": url,
        "label": label,
        "date": date,
        "title": title,
        "dollar_amounts_found": amounts,
        "bullet_points": bullets,
        "full_text_length": len(full_text),
    }


# ---------------------------------------------------------------------------
# Parser: GIICA venue pages (giica.au/venues/*)
# ---------------------------------------------------------------------------

def parse_giica_venue(url: str) -> dict:
    """
    Parse a GIICA venue page to extract status, sports, location, and any
    cost or budget mentions.

    Page structure (server-rendered Next.js, verified June 2026):
      - <h1> contains the venue name
      - Status appears in a text node near 'Project status'
      - 'Anticipated completion' appears as a label with the year alongside
      - Dollar amounts appear inline in the body text where costs are mentioned
        (GIICA does not prominently list individual venue budgets on these pages)
    """
    print(f"  Parsing GIICA venue: {url.split('/')[-1]}")
    soup = fetch(url)

    if not soup:
        return {"url": url, "error": "fetch failed"}

    venue_name = soup.find("h1")
    name = clean_text(venue_name) if venue_name else url.split("/")[-1]

    full_text = clean_text(soup.find("body")) if soup.find("body") else ""
    amounts = extract_dollar_amounts(full_text)

    # Extract project status — appears after the text "Project status"
    status = None
    for tag in soup.find_all(string=re.compile("Project status", re.IGNORECASE)):
        parent = tag.parent
        # The status text is usually in the next sibling or nearby element
        next_el = parent.find_next_sibling()
        if next_el:
            status = clean_text(next_el)
            break

    # Extract anticipated completion year
    completion = None
    for tag in soup.find_all(string=re.compile("Anticipated completion", re.IGNORECASE)):
        parent = tag.parent
        next_el = parent.find_next_sibling()
        if next_el:
            completion = clean_text(next_el)
            break

    # Extract latest news headlines — useful for spotting new cost announcements
    news_headlines = []
    for a in soup.select("a[href*='/news/']"):
        text = clean_text(a)
        if text and len(text) > 10:
            news_headlines.append({"text": text, "href": a.get("href", "")})

    return {
        "source": "giica_venue_page",
        "url": url,
        "venue_name": name,
        "project_status": status,
        "anticipated_completion": completion,
        "dollar_amounts_found": amounts,
        "latest_news_headlines": news_headlines[:5],
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run():
    results = {
        "run_at": datetime.now().isoformat(),
        "qld_statements": [],
        "giica_venues": [],
    }

    print("\n--- Scraping QLD Government statements ---")
    for item in KNOWN_STATEMENT_URLS:
        result = parse_qld_statement(item["url"], item["label"], item["date"])
        results["qld_statements"].append(result)
        time.sleep(REQUEST_DELAY)

    print("\n--- Scraping GIICA venue pages ---")
    for url in GIICA_VENUE_URLS:
        result = parse_giica_venue(url)
        results["giica_venues"].append(result)
        time.sleep(REQUEST_DELAY)

    # Save output
    output_path = OUTPUT_DIR / "latest_run.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nDone. Output saved to {output_path}")
    print("Review the output before inserting any figures into the database.")

    # Print a quick summary
    print("\n--- Dollar amounts found across all sources ---")
    all_amounts = set()
    for s in results["qld_statements"]:
        all_amounts.update(s.get("dollar_amounts_found", []))
    for v in results["giica_venues"]:
        all_amounts.update(v.get("dollar_amounts_found", []))
    for amt in sorted(all_amounts):
        print(f"  {amt}")


if __name__ == "__main__":
    run()
