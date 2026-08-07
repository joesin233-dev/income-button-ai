export default function ChargeRing({ percent, size = 220, label }) {
  const r = 92;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size} viewBox="0 0 220 220">
      <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(234,242,236,0.08)" strokeWidth="10" />
      <circle
        cx="110"
        cy="110"
        r={r}
        fill="none"
        stroke="#FFD23F"
        strokeWidth="10"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 110 110)"
        style={{ transition: "stroke-dashoffset 0.15s linear" }}
      />
      <text x="110" y="104" textAnchor="middle" fill="#EAF2EC" fontSize="34" fontWeight="800" fontFamily="Space Grotesk">
        {Math.round(percent)}%
      </text>
      <text x="110" y="130" textAnchor="middle" fill="#8AA396" fontSize="11" fontFamily="Inter" letterSpacing="1">
        {label}
      </text>
    </svg>
  );
}
