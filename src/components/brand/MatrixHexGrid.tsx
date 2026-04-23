import { cn } from "@/lib/cn";

/**
 * Decorative hex grid — a nod to The Architect's room of monitors and the
 * geometric precision of the Matrix construct. Pure SVG, very cheap to render.
 *
 * Intended as a background layer inside a relatively-positioned container.
 */
export function MatrixHexGrid({
  className,
  tone = "ion",
  opacity = 0.1,
}: {
  className?: string;
  tone?: "ion" | "nebula" | "quantum" | "solar";
  opacity?: number;
}) {
  const color =
    tone === "ion"
      ? "#4db8ff"
      : tone === "nebula"
      ? "#9b7bff"
      : tone === "solar"
      ? "#ffb547"
      : "#3de0a8";

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
      aria-hidden
    >
      <svg
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <pattern
            id="mx-hex"
            x="0"
            y="0"
            width="56"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            {/* Two interlocking hex rings per tile */}
            <path
              d="M14 0 L42 0 L56 24 L42 48 L14 48 L0 24 Z"
              fill="none"
              stroke={color}
              strokeWidth="0.6"
              strokeOpacity="0.6"
            />
            <circle cx="28" cy="24" r="1" fill={color} fillOpacity="0.5" />
          </pattern>

          <radialGradient id="mx-hex-mask" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          <mask id="mx-hex-fade">
            <rect width="800" height="400" fill="url(#mx-hex-mask)" />
          </mask>
        </defs>

        <rect width="800" height="400" fill="url(#mx-hex)" mask="url(#mx-hex-fade)" />

        {/* A few glowing anchor nodes */}
        {[
          [180, 120],
          [520, 80],
          [620, 260],
          [300, 310],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="4" fill={color} fillOpacity="0.45" />
            <circle cx={cx} cy={cy} r="14" fill={color} fillOpacity="0.08" />
          </g>
        ))}
      </svg>
    </div>
  );
}
