import { useEffect, useState } from "react";
import { AURORA_MODES, useAuroraMode, type AuroraMode } from "@/hooks/useAuroraMode";

const LABELS: Record<AuroraMode, string> = {
  silk: "Silk",
  horizon: "Horizon",
  prism: "Prism",
};

/**
 * Dev-only aurora mode picker. Visible when import.meta.env.DEV is true OR URL has ?aurora=1.
 */
export function AuroraModeToggle() {
  const { mode, setMode } = useAuroraMode();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setEnabled(import.meta.env.DEV || params.get("aurora") === "1");
  }, []);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        zIndex: 99999,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        color: "#fff",
        background: "rgba(15,15,20,0.86)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: open ? "8px 10px" : "6px 10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        minWidth: open ? 200 : "auto",
        userSelect: "none",
        pointerEvents: "auto",
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 600,
          letterSpacing: 0.5,
          opacity: 0.9,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 99,
            background: "linear-gradient(135deg, #4F46E5, #F97316)",
            boxShadow: "0 0 6px rgba(79,70,229,0.8)",
          }}
        />
        AURORA {open ? "▾" : "▸"}
      </div>
      {open && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {AURORA_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                cursor: "pointer",
                border: mode === m ? "1px solid rgba(249,115,22,0.6)" : "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                color: mode === m ? "#F97316" : "rgba(255,255,255,0.7)",
                background: mode === m ? "rgba(249,115,22,0.15)" : "transparent",
              }}
            >
              {LABELS[m]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
