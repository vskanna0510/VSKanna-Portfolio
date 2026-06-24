import type { AuroraMode } from "@/hooks/useAuroraMode";

const VIGNETTE =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_92%)]";

type Props = { mode: AuroraMode };

/** Full-hero aurora — biased toward the text column on desktop. */
export function HeroAurora({ mode }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
      <div className="absolute inset-y-0 left-0 w-[62%]">
        {mode === "silk" && <SilkAurora />}
        {mode === "horizon" && <HorizonAurora />}
        {mode === "prism" && <PrismAurora />}
      </div>
      <div className={VIGNETTE} />
    </div>
  );
}

/** Column-scoped glow behind the portrait — visible on all breakpoints. */
export function PortraitAurora({ mode }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
      {mode === "silk" && <PortraitSilkGlow />}
      {mode === "horizon" && <PortraitHorizonGlow />}
      {mode === "prism" && <PortraitPrismGlow />}
    </div>
  );
}

function SilkAurora() {
  return (
    <div
      className="absolute left-[35%] top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 animate-aurora-slow rounded-full opacity-90"
      style={{
        background:
          "radial-gradient(circle at 40% 35%, rgba(79,70,229,0.28) 0%, rgba(249,115,22,0.18) 45%, transparent 72%)",
        filter: "blur(100px)",
      }}
    />
  );
}

function HorizonAurora() {
  return (
    <>
      <div className="absolute -top-[18%] left-[8%] h-[58%] w-[58%] animate-aurora-slow rounded-full bg-[var(--coral)]/18 blur-[110px]" />
      <div
        className="absolute -bottom-[22%] left-[20%] h-[58%] w-[58%] animate-aurora-slow-alt rounded-full bg-[var(--amber)]/14 blur-[120px]"
        style={{ animationDelay: "-8s" }}
      />
    </>
  );
}

function PrismAurora() {
  return (
    <>
      <div
        className="absolute inset-[-20%] animate-prism-rotate opacity-[0.22]"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(79,70,229,0.5) 0deg, rgba(249,115,22,0.35) 120deg, rgba(139,123,216,0.4) 240deg, rgba(79,70,229,0.5) 360deg)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute left-[35%] top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251,251,249,0.35) 0%, rgba(79,70,229,0.08) 50%, transparent 70%)",
        }}
      />
    </>
  );
}

function PortraitSilkGlow() {
  return (
    <div
      className="absolute left-1/2 top-1/2 h-[min(520px,95vw)] w-[min(520px,95vw)] -translate-x-1/2 -translate-y-1/2 animate-aurora-slow rounded-full"
      style={{
        background:
          "radial-gradient(circle at 50% 45%, rgba(79,70,229,0.2) 0%, rgba(249,115,22,0.1) 42%, transparent 72%)",
        filter: "blur(72px)",
      }}
    />
  );
}

function PortraitHorizonGlow() {
  return (
    <>
      <div className="absolute left-1/2 top-[18%] h-[55%] w-[70%] -translate-x-1/2 animate-aurora-slow rounded-full bg-[var(--coral)]/14 blur-[90px]" />
      <div
        className="absolute bottom-[12%] left-1/2 h-[50%] w-[65%] -translate-x-1/2 animate-aurora-slow-alt rounded-full bg-[var(--amber)]/10 blur-[100px]"
        style={{ animationDelay: "-6s" }}
      />
    </>
  );
}

function PortraitPrismGlow() {
  return (
    <div
      className="absolute left-1/2 top-1/2 h-[min(480px,90vw)] w-[min(480px,90vw)] -translate-x-1/2 -translate-y-1/2 animate-prism-rotate rounded-full opacity-[0.18]"
      style={{
        background:
          "conic-gradient(from 0deg, rgba(79,70,229,0.45) 0deg, rgba(249,115,22,0.3) 120deg, rgba(139,123,216,0.35) 240deg, rgba(79,70,229,0.45) 360deg)",
        filter: "blur(56px)",
      }}
    />
  );
}
