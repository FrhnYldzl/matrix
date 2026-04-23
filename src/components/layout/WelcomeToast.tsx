"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Rabbit, X } from "lucide-react";

/**
 * The Matrix has you.
 *
 * Shows once per session when the user first lands in the app.
 * Purely an easter egg — no functional data stored.
 */
export function WelcomeToast() {
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    // Only show once per tab session
    if (typeof window === "undefined") return;
    const key = "matrix:welcomed";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const t1 = setTimeout(() => {
      setVisible(true);
      setStage(0);
    }, 800);
    const t2 = setTimeout(() => setStage(1), 2800);
    const t3 = setTimeout(() => setStage(2), 4600);
    const t4 = setTimeout(() => setVisible(false), 7800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (!visible) return null;

  const lines = [
    { emoji: "🌀", text: "Wake up, Neo…" },
    { emoji: "🐇", text: "Follow the white rabbit." },
    { emoji: "🟢", text: "Welcome to the real world." },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[320px] rounded-xl border border-quantum/40 bg-surface/95 p-4 shadow-[0_20px_60px_-20px_rgba(61,224,168,0.35)] backdrop-blur-xl animate-[breathe_3.5s_ease-out]">
      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2 rounded-md p-1 text-text-faint transition-colors hover:bg-elevated hover:text-text"
      >
        <X size={12} />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-quantum/40 bg-quantum-soft text-quantum">
          <Rabbit size={18} strokeWidth={1.6} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-quantum">
            The Matrix
          </div>
          <div className="mt-1 space-y-1">
            {lines.slice(0, stage + 1).map((l, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-baseline gap-2 font-mono text-xs leading-relaxed transition-opacity",
                  i === stage ? "text-text" : "text-text-muted"
                )}
                style={{
                  opacity: i <= stage ? 1 : 0,
                }}
              >
                <span>{l.emoji}</span>
                <span>{l.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
