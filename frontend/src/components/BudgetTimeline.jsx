import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatAUD, formatChangeType, shortVenueName } from "../utils";

const COLOURS = {
  initial_estimate: "#93c5fd",
  revised_estimate: "#f59e0b",
  approved_budget: "#1a56db",
  actual: "#0e9f6e",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--grey-200)",
        borderRadius: 8,
        padding: "0.75rem 1rem",
        fontSize: "0.82rem",
        boxShadow: "var(--shadow-md)",
        maxWidth: 260,
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 4, color: "var(--grey-800)" }}>
        {d.venue_name}
      </p>
      <p style={{ color: "var(--blue)", fontWeight: 600, fontSize: "1rem" }}>
        {formatAUD(d.amount_aud)}
      </p>
      <p style={{ color: "var(--grey-400)", marginTop: 4 }}>
        {formatChangeType(d.change_type)}
      </p>
      <p style={{ color: "var(--grey-400)" }}>{d.announced_at}</p>
    </div>
  );
};

// Custom x-axis tick that renders two lines if the name has a space
const CustomTick = ({ x, y, payload }) => {
  const name = payload.value;
  const parts = name.length > 14 ? name.split(" ") : [name];
  const mid = Math.ceil(parts.length / 2);
  const line1 = parts.slice(0, mid).join(" ");
  const line2 = parts.slice(mid).join(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="end"
        fill="var(--grey-600)"
        fontSize={11}
        transform="rotate(-30)"
      >
        {line1}
      </text>
      {line2 && (
        <text
          x={0}
          y={0}
          dy={24}
          textAnchor="end"
          fill="var(--grey-600)"
          fontSize={11}
          transform="rotate(-30)"
        >
          {line2}
        </text>
      )}
    </g>
  );
};

export default function BudgetTimeline({ data }) {
  const chartData = data
    .filter((e) => e.amount_aud)
    .reduce((acc, entry) => {
      const existing = acc.find((e) => e.venue_slug === entry.venue_slug);
      if (!existing || entry.announced_at > existing.announced_at) {
        return [...acc.filter((e) => e.venue_slug !== entry.venue_slug), entry];
      }
      return acc;
    }, [])
    .map((e) => ({
      ...e,
      short_name: shortVenueName(e.venue_name),
    }))
    .sort((a, b) => b.amount_aud - a.amount_aud);

  if (!chartData.length)
    return (
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          color: "var(--grey-400)",
          textAlign: "center",
          padding: "3rem",
        }}
      >
        No cost data yet.
      </div>
    );

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--grey-800)",
            }}
          >
            Announced costs by venue
          </h2>
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--grey-400)",
              marginTop: 2,
            }}
          >
            Latest announced figure per venue · AUD
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {Object.entries(COLOURS).map(([k, c]) => (
            <span
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.72rem",
                color: "var(--grey-600)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: c,
                  flexShrink: 0,
                }}
              />
              {formatChangeType(k)}
            </span>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 8, bottom: 70 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--grey-100)"
            vertical={false}
          />
          <XAxis dataKey="short_name" tick={<CustomTick />} interval={0} />
          <YAxis
            tickFormatter={formatAUD}
            tick={{ fontSize: 11, fill: "var(--grey-600)" }}
            width={60}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "var(--grey-50)" }}
          />
          <Bar dataKey="amount_aud" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={COLOURS[entry.change_type] || "#93c5fd"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
