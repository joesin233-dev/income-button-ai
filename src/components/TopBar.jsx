import { ArrowLeft } from "lucide-react";

export default function TopBar({ title, onBack }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "18px 20px 10px",
        position: "sticky",
        top: 0,
        background: "#081410",
        zIndex: 5,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: "#0F241B",
            border: "1px solid rgba(234,242,236,0.08)",
            borderRadius: 10,
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#EAF2EC",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={17} />
        </button>
      )}
      <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 16, color: "#EAF2EC" }}>{title}</span>
    </div>
  );
}
