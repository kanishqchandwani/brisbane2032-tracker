const fmt = (n) => {
  if (!n) return "—";
  return n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${(n / 1e6).toFixed(0)}M`;
};

export default function ProgrammeSummary({ summary }) {
  const total = summary.total_programme_cost_aud;
  const venueCount = summary.venues.length;
  const knownCount = summary.venues.filter((v) => v.latest_amount).length;

  const stats = [
    { label: "Total programme envelope", value: "$7.1B", sub: "AUD · confirmed by QLD + Federal Governments" },
    { label: "Venues with known costs", value: `${knownCount} / ${venueCount}`, sub: "Remaining within $847M package" },
    { label: "Brisbane Stadium", value: "$3.8B", sub: "Largest single venue · Victoria Park" },
    { label: "National Aquatic Centre", value: "$1.2B", sub: "Revised up from $650M initial estimate" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
      {stats.map((s) => (
        <div key={s.label} className="card">
          <p style={{ fontSize: "0.75rem", color: "var(--grey-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
            {s.label}
          </p>
          <p style={{ fontSize: "1.9rem", fontWeight: 700, color: "var(--navy)", lineHeight: 1.1, marginBottom: "0.3rem" }}>
            {s.value}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--grey-400)" }}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
