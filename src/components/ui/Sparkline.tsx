import { cn } from "@/lib/cn";

type Tone = "quantum" | "ion" | "solar" | "crimson" | "nebula";

const strokeClass: Record<Tone, string> = {
  quantum: "stroke-quantum",
  ion: "stroke-ion",
  solar: "stroke-solar",
  crimson: "stroke-crimson",
  nebula: "stroke-nebula",
};

const fillClass: Record<Tone, string> = {
  quantum: "fill-quantum/20",
  ion: "fill-ion/20",
  solar: "fill-solar/20",
  crimson: "fill-crimson/20",
  nebula: "fill-nebula/20",
};

export function Sparkline({
  data,
  width = 220,
  height = 56,
  tone = "ion",
  target,
  className,
  invert = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  tone?: Tone;
  target?: number;
  className?: string;
  invert?: boolean;
}) {
  if (data.length === 0) return null;

  const pad = 4;
  const inner = { w: width - pad * 2, h: height - pad * 2 };
  const values = [...data];
  if (target != null) values.push(target);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const x = (i: number) => pad + (i / Math.max(data.length - 1, 1)) * inner.w;
  // when invert is true, LOWER values are better — we still draw the actual values,
  // but user reads progress as "line going DOWN toward target"
  const y = (v: number) => pad + (1 - (v - min) / range) * inner.h;

  const pathPoints = data.map((v, i) => `${x(i)},${y(v)}`).join(" L");
  const linePath = `M${pathPoints}`;
  const areaPath = `${linePath} L${x(data.length - 1)},${height - pad} L${x(0)},${height - pad} Z`;

  const lastY = y(data[data.length - 1]);
  const lastX = x(data.length - 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      preserveAspectRatio="none"
    >
      {target != null && (
        <line
          x1={pad}
          x2={width - pad}
          y1={y(target)}
          y2={y(target)}
          className="stroke-border-strong"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
      )}
      <path d={areaPath} className={cn(fillClass[tone])} />
      <path
        d={linePath}
        className={cn("fill-none", strokeClass[tone])}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r={3}
        className={cn("fill-void", strokeClass[tone])}
        strokeWidth={1.75}
      />
      {invert && (
        <text
          x={width - pad}
          y={y(target!) - 6}
          className="fill-text-faint font-mono"
          fontSize="9"
          textAnchor="end"
        >
          hedef ↓
        </text>
      )}
    </svg>
  );
}
