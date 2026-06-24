import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatAUD, formatChangeType, formatType, formatStatus } from "../utils";

const CHANGE_TYPE_STYLE = {
  initial_estimate: { background: "#dbeafe", color: "#1e40af" },
  revised_estimate: { background: "#fef3c7", color: "#92400e" },
  approved_budget:  { background: "#dcfce7", color: "#166534" },
  actual:           { background: "#f0fdf4", color: "#166534" },
};

export default function VenueDetail() {
  const { slug } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ""}/venues/${slug}`)
      .then((r) => r.json())
      .then((data) => { setVenue(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--grey-400)" }}>
      Loading...
    </div>
  );
  if (error) return <div style={{ padding: "2rem", color: "var(--red)" }}>Error: {error}</div>;

  const hasChart = venue.budget_history.filter((e) => e.amount_aud).length > 1;

  const chartData = venue.budget_history
    .filter((e) => e.amount_aud)
    .map((e) => ({
      date: e.announced_at,
      amount_m: parseFloat((e.amount_aud / 1e6).toFixed(0)),
      amount_aud: e.amount_aud,
      label: e.source_label,
    }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--grey-50)" }}>

      {/* Header */}
      <header style={{ background: "var(--navy)", color: "#fff", padding: "0 2rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ background: "var(--gold)", color: "var(--navy)", fontWeight: 700, fontSize: "0.75rem", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em" }}>
              BRISBANE 2032
            </span>
            <span style={{ fontWeight: 600, fontSize: "1rem" }}>Budget Tracker</span>
          </div>
          <Link to="/" style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            ← All Venues
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" }}>

        {/* Venue title + meta */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.5rem" }}>
            {venue.name}
          </h1>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--grey-600)" }}>{venue.location}</span>
            <span style={{ color: "var(--grey-200)" }}>·</span>
            <span style={{ fontSize: "0.82rem", color: "var(--grey-600)" }}>{venue.sport}</span>
            {venue.capacity && (
              <>
                <span style={{ color: "var(--grey-200)" }}>·</span>
                <span style={{ fontSize: "0.82rem", color: "var(--grey-600)" }}>
                  Capacity {venue.capacity.toLocaleString()}
                </span>
              </>
            )}
            <span style={{
              fontSize: "0.72rem", fontWeight: 600, padding: "2px 10px", borderRadius: 12,
              background: venue.type === "new" ? "#dcfce7" : "#dbeafe",
              color: venue.type === "new" ? "#166534" : "#1e40af",
            }}>
              {formatType(venue.type)}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--grey-400)", padding: "2px 8px", borderRadius: 12, background: "var(--grey-100)" }}>
              {formatStatus(venue.status)}
            </span>
          </div>
        </div>

        {/* Chart — only shown if there are 2+ data points */}
        {hasChart ? (
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Cost over time</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grey-100)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--grey-600)" }} />
                <YAxis tickFormatter={formatAUD} tick={{ fontSize: 11, fill: "var(--grey-600)" }} width={64} />
                <Tooltip formatter={(v, n, p) => [formatAUD(p.payload.amount_aud), "Announced Cost"]} />
                <Line type="monotone" dataKey="amount_m" stroke="var(--blue)" strokeWidth={2} dot={{ r: 5, fill: "var(--blue)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: "1.5rem", padding: "1.25rem 1.5rem", background: "var(--blue-light)" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--blue)" }}>
              Only one budget entry recorded so far. The chart will appear once a second figure is announced.
            </p>
          </div>
        )}

        {/* Budget history table */}
        <div className="card">
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>Budget History</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--grey-200)", textAlign: "left" }}>
                  {["Date", "Amount", "Entry Type", "Source", "Notes"].map((h) => (
                    <th key={h} style={{ padding: "0.6rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", color: "var(--grey-400)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {venue.budget_history.map((entry, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid var(--grey-100)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--grey-50)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "0.75rem", color: "var(--grey-600)", whiteSpace: "nowrap" }}>
                      {entry.announced_at}
                    </td>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: entry.amount_aud ? "var(--navy)" : "var(--grey-400)" }}>
                      {entry.amount_aud ? formatAUD(entry.amount_aud) : "TBC"}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{
                        ...(CHANGE_TYPE_STYLE[entry.change_type] || { background: "var(--grey-100)", color: "var(--grey-600)" }),
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 12,
                        whiteSpace: "nowrap",
                      }}>
                        {formatChangeType(entry.change_type)}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", maxWidth: 200 }}>
                      {entry.source_url ? (
                        <a href={entry.source_url} target="_blank" rel="noreferrer" style={{ color: "var(--blue)", fontSize: "0.82rem" }}>
                          {entry.source_label || "Source"}
                        </a>
                      ) : (
                        <span style={{ color: "var(--grey-600)", fontSize: "0.82rem" }}>{entry.source_label || "—"}</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem", color: "var(--grey-600)", fontSize: "0.82rem", maxWidth: 320 }}>
                      {entry.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
