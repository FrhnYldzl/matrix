import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Badge } from "../ui/Badge";

export function ComingSoon({
  title,
  subtitle,
  icon: Icon,
  accent = "ion",
  items,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent?: "ion" | "nebula" | "quantum" | "solar";
  items?: string[];
}) {
  const accentGlow: Record<string, string> = {
    ion: "shadow-[0_0_40px_rgba(77,184,255,0.35)] bg-ion/10 text-ion",
    nebula: "shadow-[0_0_40px_rgba(155,123,255,0.35)] bg-nebula/10 text-nebula",
    quantum: "shadow-[0_0_40px_rgba(61,224,168,0.35)] bg-quantum/10 text-quantum",
    solar: "shadow-[0_0_40px_rgba(255,181,71,0.35)] bg-solar/10 text-solar",
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-8 py-12">
      <div className="w-full max-w-xl text-center">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-border/70 ${accentGlow[accent]}`}
        >
          <Icon size={34} strokeWidth={1.4} />
        </div>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Badge tone={accent}>Yakında</Badge>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
            Hafta 2–4 arası aktif olacak
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text">{title}</h1>
        <p className="mt-3 text-sm text-text-muted leading-relaxed">{subtitle}</p>

        {items && items.length > 0 && (
          <ul className="mt-8 mx-auto max-w-md space-y-2 text-left">
            {items.map((it, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-elevated/40 px-4 py-3 text-sm text-text-muted"
              >
                <Sparkles size={13} className={`mt-0.5 shrink-0 ${accentGlow[accent].split(" ")[2]}`} />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
