"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { MatrixMark } from "../brand/MatrixMark";

const accentColor: Record<string, string> = {
  ion: "text-ion",
  nebula: "text-nebula",
  quantum: "text-quantum",
  solar: "text-solar",
};

const groupLabels: Record<string, string> = {
  bootstrap: "Kurulum",
  primary: "Organizasyon",
  connect: "Bağlantı",
  ops: "Operasyon",
  insight: "Analiz",
};

export function Sidebar() {
  const pathname = usePathname();
  const groups: Array<"bootstrap" | "primary" | "connect" | "ops" | "insight"> = [
    "bootstrap",
    "primary",
    "connect",
    "ops",
    "insight",
  ];

  return (
    <aside className="relative z-10 hidden w-64 shrink-0 border-r border-border/70 bg-surface/60 backdrop-blur-md md:flex md:flex-col">
      {/* Brand — sidebar logo authenticated user için Command Deck'e götürür */}
      <Link href="/dashboard" className="flex items-center gap-3 px-5 py-5 group">
        <MatrixMark className="h-8 w-8 text-ion transition-transform group-hover:rotate-[24deg]" />
        <div className="leading-tight">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-text-muted">
            matrix
          </div>
          <div className="text-sm font-medium text-text">Agent Organization OS</div>
        </div>
      </Link>

      <div className="mx-3 border-t border-border/60" />

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => {
          const items = navItems.filter((i) => i.group === g);
          if (!items.length) return null;
          return (
            <div key={g} className="mb-6 last:mb-0">
              <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-text-faint">
                {groupLabels[g]}
              </div>
              <ul className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  const accent = item.accent ? accentColor[item.accent] : "text-text-muted";
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          active
                            ? "bg-elevated text-text shadow-[inset_0_0_0_1px_var(--color-border)]"
                            : "text-text-muted hover:bg-elevated/50 hover:text-text"
                        )}
                      >
                        <Icon
                          size={16}
                          strokeWidth={1.75}
                          className={cn(
                            "mt-0.5 shrink-0 transition-colors",
                            active ? accent : "text-text-faint group-hover:text-text-muted"
                          )}
                        />
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block truncate font-medium">{item.label}</span>
                          {item.subLabel && (
                            <span className="block truncate text-[10px] text-text-faint">
                              {item.subLabel}
                            </span>
                          )}
                        </span>
                        {active && <span className="h-1 w-1 shrink-0 rounded-full bg-ion animate-breathe" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 p-4">
        <div className="rounded-lg border border-border/70 bg-elevated/50 p-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-faint">
            Matrix Build
          </div>
          <div className="mt-1 flex items-baseline gap-2 text-xs text-text-muted">
            <span className="text-text">Iteration 6 · Midnight</span>
          </div>
          <div className="mt-1.5 font-mono text-[9px] italic text-text-faint">
            "There is no spoon."
          </div>
        </div>
      </div>
    </aside>
  );
}
