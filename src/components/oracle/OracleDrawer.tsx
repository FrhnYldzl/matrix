"use client";

/**
 * OracleDrawer — full-screen slide-in panel accessible from TopBar.
 *
 * Oracle'ın her zaman bir tık uzakta olduğu kanonik yer. Önceden ayrı
 * bir /oracle route'u vardı — Simplification Sprint'te bu drawer'a
 * taşındı. Sidebar'dan çıktı, TopBar'dan çağrılır.
 *
 * Route /oracle hâlâ çalışır (back-compat) ama günlük kullanımda
 * artık bu drawer tercih edilir.
 */

import Link from "next/link";
import { cn } from "@/lib/cn";
import { OraclePage } from "./OraclePage";
import { ExternalLink, X } from "lucide-react";

export function OracleDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      <button
        onClick={onClose}
        aria-label="Kapat"
        className="flex-1 bg-void/70 backdrop-blur-sm"
      />
      <aside
        className={cn(
          "relative flex h-full w-full max-w-6xl flex-col overflow-hidden",
          "border-l border-border/70 bg-surface/95 backdrop-blur-xl",
          "shadow-[0_0_80px_rgba(0,0,0,0.6)] animate-in slide-in-from-right-8 duration-300"
        )}
      >
        {/* Top bar: close + open-in-page link */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-void/60 px-4 py-2 backdrop-blur-md">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
            Oracle · AI Suggestion Engine · ESC ile kapat
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/oracle"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-elevated/40 px-2 py-1 font-mono text-[10px] text-text-muted hover:text-text"
              title="Tam sayfa olarak aç"
            >
              <ExternalLink size={10} />
              tam sayfa
            </Link>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-text-muted hover:bg-elevated hover:text-text"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Embed the full Oracle page */}
        <div className="flex-1 overflow-y-auto">
          <OraclePage />
        </div>
      </aside>
    </div>
  );
}
