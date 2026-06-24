import { CLUSTERS } from "./LatentConstellation";
import { Zap, RotateCcw } from "lucide-react";

type Props = {
  temperature: number; setTemperature: (n: number) => void;
  density: number;     setDensity: (n: number) => void;
  attention: number;   setAttention: (n: number) => void;
  active: number | null; setActive: (n: number | null) => void;
  onFuseAll: () => void;
  onReset: () => void;
};

function Slider({ label, value, min, max, step = 0.01, onChange, format }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void; format?: (n: number) => string;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-[var(--coral)]">{format ? format(value) : value.toFixed(2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="ai-slider w-full"
      />
    </label>
  );
}

export function AILabControls({
  temperature, setTemperature, density, setDensity, attention, setAttention,
  active, setActive, onFuseAll, onReset,
}: Props) {
  return (
    <div className="glass-strong flex h-full flex-col gap-4 rounded-2xl p-5">
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Focus area</div>
        <div className="flex flex-wrap gap-2">
          {CLUSTERS.map((c, i) => {
            const isActive = active === i;
            return (
              <button
                key={c.id}
                onClick={() => setActive(isActive ? null : i)}
                className="rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider transition-all"
                style={{
                  borderColor: isActive ? c.color : `${c.color}40`,
                  background: isActive ? `${c.color}22` : "transparent",
                  color: c.color,
                  boxShadow: isActive ? `0 0 16px ${c.color}55` : "none",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Slider label="Temperature" value={temperature} min={0} max={1} onChange={setTemperature} />
        <Slider label="Attention"   value={attention}   min={0} max={1} onChange={setAttention} />
        <Slider label="Density"     value={density}     min={120} max={520} step={20} onChange={setDensity} format={(n) => `${Math.round(n)}`} />
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2">
        <button
          onClick={onFuseAll}
          className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-primary-foreground animate-gradient"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          <Zap className="h-3.5 w-3.5" /> Combine all
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}
