import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function TemplateCard({ name, content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error("copy failed", e);
    }
  };

  return (
    <div
      style={{
        background: "#0F241B",
        border: "1px solid rgba(234,242,236,0.08)",
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 13.5 }}>{name}</span>
        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: copied ? "rgba(34,197,94,0.16)" : "rgba(234,242,236,0.06)",
            border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(234,242,236,0.1)"}`,
            borderRadius: 20,
            padding: "5px 10px",
            color: copied ? "#4ADE80" : "#8AA396",
            fontSize: 11.5,
            cursor: "pointer",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: "#C7D6CC", margin: 0, whiteSpace: "pre-wrap" }}>{content}</p>
    </div>
  );
}
