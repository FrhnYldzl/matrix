import { cn } from "@/lib/cn";

type Tone = "quantum" | "ion" | "solar" | "crimson" | "nebula";

const toneClass: Record<Tone, string> = {
  quantum: "stroke-quantum",
  ion: "stroke-ion",
  solar: "stroke-solar",
  crimson: "stroke-crimson",
  nebula: "stroke-nebula",
};

export function RadialProgress({
  value,
  size = 88,
  stroke = 8,
  tone = "ion",
  children,
  trackOpacity = 1,
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  tone?: Tone;
  children?: React.ReactNode;
  trackOpacity?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c * (1 - clamped / 100);

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="fill-none stroke-elevated"
          strokeWidth={stroke}
          opacity={trackOpacity}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={cn("fill-none transition-all duration-700", toneClass[tone])}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}
