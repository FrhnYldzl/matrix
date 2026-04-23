import { cn } from "@/lib/cn";

type Tone = "live" | "idle" | "paused" | "error" | "waiting";

const tones: Record<Tone, { color: string; ring: string }> = {
  live: { color: "bg-quantum", ring: "shadow-[0_0_8px_rgba(61,224,168,0.8)]" },
  idle: { color: "bg-text-muted", ring: "" },
  paused: { color: "bg-solar", ring: "" },
  error: { color: "bg-crimson", ring: "shadow-[0_0_8px_rgba(255,90,111,0.8)]" },
  waiting: { color: "bg-ion", ring: "shadow-[0_0_8px_rgba(77,184,255,0.8)]" },
};

export function StatusDot({ tone, className }: { tone: Tone; className?: string }) {
  const t = tones[tone];
  const shouldBreathe = tone === "live" || tone === "waiting";
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)}>
      <span className={cn("absolute inset-0 rounded-full", t.color, t.ring)} />
      {shouldBreathe && (
        <span
          className={cn("absolute inset-0 rounded-full animate-breathe", t.color)}
          style={{ opacity: 0.4 }}
        />
      )}
    </span>
  );
}
