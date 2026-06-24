"""
main.py

FastAPI entry point for the Brisbane 2032 Budget Tracker API.

Run with:
    uvicorn api.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import venues, budget

app = FastAPI(
    title="Brisbane 2032 Budget Tracker API",
    description="Tracks official budget announcements for all 17 Brisbane 2032 Olympic venues.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(venues.router, prefix="/venues", tags=["Venues"])
app.include_router(budget.router, prefix="/budget", tags=["Budget"])


@app.get("/health")
def health():
    return {"status": "ok"}
