import { useEffect, useState } from "react";
import ProgrammeSummary from "../components/ProgrammeSummary";
import VenueTable from "../components/VenueTable";
import BudgetTimeline from "../components/BudgetTimeline";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || ""}/budget/summary`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL || ""}/budget/timeline`).then((r) => r.json()),
    ])
      .then(([s, t]) => { setSummary(s); setTimeline(t); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--grey-400)" }}>
      Loading...
    </div>
  );
  if (error) return (
    <div style={{ padding: "2rem", color: "var(--red)" }}>Error: {error}</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--grey-50)" }}>

      {/* Header */}
      <header style={{ background: "var(--navy)", color: "#fff", padding: "0 2rem" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ background: "var(--gold)", color: "var(--navy)", fontWeight: 700, fontSize: "0.75rem", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em" }}>
              BRISBANE 2032
            </span>
            <span style={{ fontWeight: 600, fontSize: "1rem" }}>Budget Tracker</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
            Tracking official venue cost announcements
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 1140, margin: "0 auto", padding: "2rem 1rem" }}>

        {/* Stat cards */}
        <ProgrammeSummary summary={summary} />

        {/* Timeline chart */}
        <BudgetTimeline data={timeline} />

        {/* Venue table */}
        <VenueTable venues={summary.venues} />

        {/* Footer note */}
        <p style={{ marginTop: "2rem", fontSize: "0.78rem", color: "var(--grey-400)", textAlign: "center" }}>
          Confirmed figures sourced from Queensland Government Budget papers and GIICA announcements.
          Entries marked "proportional estimate" are derived from the $847M minor venues package and are not official figures.
          Data last reviewed June 2026.
        </p>

      </main>
    </div>
  );
}
