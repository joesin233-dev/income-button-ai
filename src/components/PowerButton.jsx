import { Zap } from "lucide-react";

export default function PowerButton({ onPress, pressed }) {
  return (
    <button
      onClick={onPress}
      style={{
        position: "relative",
        width: 216,
        height: 216,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: "transparent",
        padding: 0,
      }}
    >
      <div
        className="ring-outer"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "1.5px solid rgba(34,197,94,0.35)",
        }}
      />
      <div
        className="ring-mid"
        style={{
          position: "absolute",
          inset: 14,
          borderRadius: "50%",
          border: "1.5px dashed rgba(255,210,63,0.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 28,
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%, #34D96E 0%, #16A34A 55%, #0B5C2C 100%)",
          boxShadow: pressed
            ? "0 0 0 rgba(34,197,94,0)"
            : "0 0 40px rgba(34,197,94,0.55), 0 0 90px rgba(34,197,94,0.25), inset 0 -8px 18px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          transform: pressed ? "scale(0.96)" : "scale(1)",
          transition: "transform 0.12s ease, box-shadow 0.2s ease",
        }}
      >
        <Zap size={30} color="#081410" fill="#081410" strokeWidth={0} />
        <span
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 800,
            fontSize: 15,
            color: "#081410",
            marginTop: 6,
            letterSpacing: 0.5,
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          MAKE ME
          <br />
          MONEY
        </span>
      </div>
    </button>
  );
}
