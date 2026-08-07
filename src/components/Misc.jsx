export function SectionLabel({ text }) {
  return (
    <div
      style={{
        fontFamily: "JetBrains Mono",
        fontSize: 10.5,
        letterSpacing: 1.5,
        color: "#8AA396",
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {text}
    </div>
  );
}

export function StatCard({ label, value }) {
  return (
    <div style={{ background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 14, padding: 16 }}>
      <div style={{ color: "#8AA396", fontSize: 11.5 }}>{label}</div>
      <div style={{ fontFamily: "Space Grotesk", fontWeight: 800, fontSize: 21, marginTop: 4 }}>{value}</div>
    </div>
  );
}

export function EmptyNote({ text }) {
  return (
    <div
      style={{
        color: "#52685A",
        fontSize: 12.5,
        textAlign: "center",
        padding: "18px 10px",
        border: "1px dashed rgba(234,242,236,0.12)",
        borderRadius: 12,
      }}
    >
      {text}
    </div>
  );
}
