import { useCallback, useEffect, useState } from "react";

export const AURORA_MODES = ["silk", "horizon", "prism"] as const;
export type AuroraMode = (typeof AURORA_MODES)[number];

const STORAGE_KEY = "portfolio-aurora-mode";
const DEFAULT_MODE: AuroraMode = "horizon";

function readMode(): AuroraMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  const stored = localStorage.getItem(STORAGE_KEY);
  return AURORA_MODES.includes(stored as AuroraMode) ? (stored as AuroraMode) : DEFAULT_MODE;
}

export function useAuroraMode() {
  const [mode, setModeState] = useState<AuroraMode>(DEFAULT_MODE);

  useEffect(() => {
    setModeState(readMode());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (AURORA_MODES.includes(e.newValue as AuroraMode)) {
          setModeState(e.newValue as AuroraMode);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setMode = useCallback((next: AuroraMode) => {
    localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
    window.dispatchEvent(new CustomEvent("aurora-mode-change", { detail: next }));
  }, []);

  useEffect(() => {
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<AuroraMode>).detail;
      if (AURORA_MODES.includes(detail)) setModeState(detail);
    };
    window.addEventListener("aurora-mode-change", onCustom);
    return () => window.removeEventListener("aurora-mode-change", onCustom);
  }, []);

  return { mode, setMode };
}
