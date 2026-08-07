const STYLES = {
  Easy: { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80", border: "rgba(34,197,94,0.35)" },
  Medium: { bg: "rgba(255,210,63,0.14)", fg: "#FFD23F", border: "rgba(255,210,63,0.35)" },
  Hard: { bg: "rgba(248,113,113,0.14)", fg: "#F87171", border: "rgba(248,113,113,0.35)" },
};

export default function DifficultyBadge({ level }) {
  const s = STYLES[level] || STYLES.Medium;
  return (
    <span
      style={{
        fontFamily: "JetBrains Mono",
        fontSize: 10.5,
        letterSpacing: 0.5,
        color: s.fg,
        background: s.bg,
        border: `1px solid ${s.border}`,
        padding: "3px 9px",
        borderRadius: 20,
        whiteSpace: "nowrap",
      }}
    >
      {level || "—"}
    </span>
  );
}
