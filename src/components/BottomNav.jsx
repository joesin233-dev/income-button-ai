import { Flame, LayoutDashboard, Wallet } from "lucide-react";

const ITEMS = [
  { key: "landing", label: "Home", icon: Flame },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "payment", label: "Payout", icon: Wallet },
];

export default function BottomNav({ screen, setScreen, hasPlan }) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0B1F17",
        borderTop: "1px solid rgba(234,242,236,0.08)",
        display: "flex",
        zIndex: 10,
      }}
    >
      {ITEMS.map((it) => {
        const active = screen === it.key || (it.key === "landing" && (screen === "results" || screen === "action"));
        const disabled = it.key !== "landing" && !hasPlan;
        return (
          <button
            key={it.key}
            disabled={disabled}
            onClick={() => setScreen(it.key)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              padding: "10px 0 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              opacity: disabled ? 0.35 : 1,
              cursor: disabled ? "default" : "pointer",
            }}
          >
            <it.icon size={19} color={active ? "#FFD23F" : "#8AA396"} strokeWidth={active ? 2.4 : 2} />
            <span
              style={{
                fontFamily: "Inter",
                fontSize: 10.5,
                color: active ? "#FFD23F" : "#8AA396",
                fontWeight: 600,
              }}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
