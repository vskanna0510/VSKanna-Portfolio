import { useEffect, useState } from "react";
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";

type Vitals = Partial<Record<"LCP" | "CLS" | "INP" | "FCP" | "TTFB", Metric>>;

const THRESHOLDS: Record<string, [number, number]> = {
  LCP: [2500, 4000],
  CLS: [0.1, 0.25],
  INP: [200, 500],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

function rate(name: string, value: number): "good" | "ni" | "poor" {
  const t = THRESHOLDS[name];
  if (!t) return "good";
  if (value <= t[0]) return "good";
  if (value <= t[1]) return "ni";
  return "poor";
}

const COLORS = {
  good: "#10b981",
  ni: "#f59e0b",
  poor: "#ef4444",
};

function fmt(name: string, value: number) {
  return name === "CLS" ? value.toFixed(3) : `${Math.round(value)}ms`;
}

/**
 * Floating dev-only Web Vitals HUD.
 * Visible when import.meta.env.DEV is true OR URL has ?perf=1.
 * Zero impact on production users.
 */
export function WebVitalsHUD() {
  const [vitals, setVitals] = useState<Vitals>({});
  const [open, setOpen] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const on = import.meta.env.DEV || params.get("perf") === "1";
    if (!on) return;
    setEnabled(true);

    const upd = (m: Metric) => setVitals((v) => ({ ...v, [m.name]: m }));
    onLCP(upd);
    onCLS(upd);
    onINP(upd);
    onFCP(upd);
    onTTFB(upd);
  }, []);

  if (!enabled) return null;

  const entries = (["LCP", "INP", "CLS", "FCP", "TTFB"] as const)
    .map((k) => vitals[k])
    .filter(Boolean) as Metric[];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
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
        minWidth: open ? 180 : "auto",
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
        <span style={{ width: 6, height: 6, borderRadius: 99, background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
        WEB VITALS {open ? "▾" : "▸"}
      </div>
      {open && (
        <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "3px 10px" }}>
          {entries.length === 0 && <div style={{ gridColumn: "1 / -1", opacity: 0.6 }}>collecting…</div>}
          {entries.map((m) => {
            const r = rate(m.name, m.value);
            return (
              <Row key={m.name} name={m.name} value={fmt(m.name, m.value)} color={COLORS[r]} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ name, value, color }: { name: string; value: string; color: string }) {
  return (
    <>
      <span style={{ opacity: 0.7 }}>{name}</span>
      <span style={{ height: 4, alignSelf: "center", background: color, borderRadius: 2, opacity: 0.85 }} />
      <span style={{ color, fontWeight: 600 }}>{value}</span>
    </>
  );
}
