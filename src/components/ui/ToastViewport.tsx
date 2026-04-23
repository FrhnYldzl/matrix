"use client";

import { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useToastStore } from "@/lib/toast";
import { CheckCircle2, AlertTriangle, Info, Sparkles, X, Zap } from "lucide-react";

const toneClass = {
  quantum: "border-quantum/40 bg-quantum-soft/40 text-quantum",
  ion: "border-ion/40 bg-ion-soft/40 text-ion",
  nebula: "border-nebula/40 bg-nebula-soft/40 text-nebula",
  solar: "border-solar/40 bg-solar-soft/40 text-solar",
  crimson: "border-crimson/40 bg-crimson-soft/40 text-crimson",
} as const;

const icons = {
  quantum: CheckCircle2,
  ion: Zap,
  nebula: Sparkles,
  solar: Info,
  crimson: AlertTriangle,
} as const;

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    toasts.forEach((t) => {
      if (t.ttlMs == null) return;
      const remaining = t.createdAt + t.ttlMs - Date.now();
      if (remaining <= 0) {
        dismiss(t.id);
      } else {
        timers.push(setTimeout(() => dismiss(t.id), remaining));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(92vw,380px)] flex-col gap-2"
    >
      {toasts.slice(-5).map((t) => {
        const Icon = icons[t.tone];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto relative overflow-hidden rounded-lg border bg-surface/95 p-3 shadow-[0_0_30px_rgba(0,0,0,0.4)] backdrop-blur-xl animate-in slide-in-from-right-4 duration-300",
              toneClass[t.tone]
            )}
          >
            <span
              className={cn(
                "pointer-events-none absolute left-0 top-0 h-full w-0.5",
                t.tone === "quantum" && "bg-quantum",
                t.tone === "ion" && "bg-ion",
                t.tone === "nebula" && "bg-nebula",
                t.tone === "solar" && "bg-solar",
                t.tone === "crimson" && "bg-crimson"
              )}
            />
            <div className="flex items-start gap-2 pl-2">
              <Icon size={14} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text leading-tight">
                  {t.title}
                </div>
                {t.description && (
                  <div className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
                    {t.description}
                  </div>
                )}
                {t.action && (
                  <div className="mt-2">
                    {t.action.href ? (
                      <Link
                        href={t.action.href}
                        onClick={() => dismiss(t.id)}
                        className="font-mono text-[10px] uppercase tracking-wider underline underline-offset-2 hover:text-text"
                      >
                        {t.action.label} →
                      </Link>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-wider">
                        {t.action.label}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 text-text-faint hover:bg-elevated hover:text-text"
                aria-label="Kapat"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
