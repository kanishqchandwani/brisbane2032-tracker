import { Link } from "react-router-dom";
import { formatAUD, formatType, formatStatus } from "../utils";

const TYPE_STYLE = {
  new:      { background: "#dcfce7", color: "#166534" },
  upgraded: { background: "#dbeafe", color: "#1e40af" },
  existing: { background: "var(--grey-100)", color: "var(--grey-600)" },
};

export default function VenueTable({ venues }) {
  return (
    <div className="card">
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--grey-800)" }}>All 17 GIICA Venues</h2>
        <p style={{ fontSize: "0.78rem", color: "var(--grey-400)", marginTop: 2 }}>
          Click a venue to see its full budget history
        </p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--grey-200)", textAlign: "left" }}>
              {["Venue", "Type", "Status", "Initial", "Latest", "Change", "Revisions"].map((h) => (
                <th key={h} style={{ padding: "0.6rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", color: "var(--grey-400)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {venues.map((v) => {
              const change = v.initial_amount && v.latest_amount
                ? ((v.latest_amount - v.initial_amount) / v.initial_amount) * 100
                : null;

              return (
                <tr
                  key={v.slug}
                  style={{ borderBottom: "1px solid var(--grey-100)", transition: "background 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--grey-50)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "0.75rem", fontWeight: 500 }}>
                    <Link to={`/venue/${v.slug}`} style={{ color: "var(--blue)" }}>
                      {v.name}
                    </Link>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      ...(TYPE_STYLE[v.type] || TYPE_STYLE.existing),
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}>
                      {formatType(v.type)}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", color: "var(--grey-600)", fontSize: "0.82rem" }}>
                    {formatStatus(v.status)}
                  </td>
                  <td style={{ padding: "0.75rem", color: "var(--grey-600)" }}>
                    {v.initial_amount ? formatAUD(v.initial_amount) : <span style={{ color: "var(--grey-400)" }}>TBC</span>}
                  </td>
                  <td style={{ padding: "0.75rem", fontWeight: 600 }}>
                    {v.latest_amount ? formatAUD(v.latest_amount) : <span style={{ color: "var(--grey-400)", fontWeight: 400 }}>TBC</span>}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    {change !== null ? (
                      <span style={{ color: change > 0 ? "var(--red)" : "var(--green)", fontWeight: 600, fontSize: "0.82rem" }}>
                        {change > 0 ? "+" : ""}{change.toFixed(0)}%
                      </span>
                    ) : <span style={{ color: "var(--grey-400)" }}>—</span>}
                  </td>
                  <td style={{ padding: "0.75rem", color: "var(--grey-600)", textAlign: "center" }}>
                    {v.revision_count}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
