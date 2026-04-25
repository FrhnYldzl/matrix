"use client";

/**
 * Sidebar — Sprint A (Base44-style consolidation).
 *
 * Ferhan: "Sol paneldeki her şey fazla geliyor, aşama aşama gelmeli."
 * 16 düz menü → 4 grup:
 *   1. Pinned     — Construct + Oracle (her zaman görünür, başlık yok)
 *   2. Workspace  — bu asset'in iç dünyası (default OPEN, 5 item)
 *   3. Build      — yeniden kullanılabilir parçalar (default CLOSED, 3 item)
 *   4. System     — bağlantı/maliyet/analytics/bilgi (default CLOSED, 6 item)
 *
 * Kullanıcı bilişsel yükü 16'dan 7'ye düşer (default açık 2 pinned + 5 workspace).
 * Build ve System gerektikçe açılır.
 *
 * Cmd+K her sayfada erişilebilir → kullanıcı zaten sidebar'a hiç dokunmadan
 * Oracle ile tüm aksiyonları yapabilir. Sidebar artık ikinci sınıf navigasyon.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, type NavItem } from "./nav-items";
import { MatrixMark } from "../brand/MatrixMark";
import { ChevronDown, Command } from "lucide-react";

const accentColor: Record<string, string> = {
  ion: "text-ion",
  nebula: "text-nebula",
  quantum: "text-quantum",
  solar: "text-solar",
};

const STORAGE_KEY = "matrix-sidebar-expanded-v1";
const DEFAULT_EXPANDED: Record<NavItem["group"], boolean> = {
  pinned: true, // her zaman açık
  workspace: true,
  build: false,
  system: false,
};

const groupMeta: Record<
  NavItem["group"],
  { label: string; subLabel: string }
> = {
  pinned: { label: "", subLabel: "" },
  workspace: { label: "Workspace", subLabel: "bu asset'in iç dünyası" },
  build: { label: "Yarat", subLabel: "skills · agents · workflows" },
  system: { label: "Sistem", subLabel: "bağlantı · maliyet · ölçüm" },
};

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<NavItem["group"], boolean>>(
    DEFAULT_EXPANDED
  );
  const [hydrated, setHydrated] = useState(false);

  // Hydration'dan sonra localStorage'tan oku — SSR mismatch yok
  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<NavItem["group"], boolean>>;
        setExpanded({ ...DEFAULT_EXPANDED, ...parsed });
      }
    } catch {
      // localStorage yoksa default
    }
  }, []);

  function toggle(group: NavItem["group"]) {
    if (group === "pinned") return; // pinned hep açık
    setExpanded((prev) => {
      const next = { ...prev, [group]: !prev[group] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const groups: NavItem["group"][] = ["pinned", "workspace", "build", "system"];

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

      {/* Cmd+K hint — Oracle palette her sayfada açılır */}
      <div className="mx-3 mt-3 flex items-center justify-between rounded-md border border-nebula/20 bg-nebula-soft/15 px-3 py-2 text-[11px]">
        <span className="text-text-muted">Oracle her yerde</span>
        <kbd className="inline-flex items-center gap-0.5 rounded border border-nebula/30 bg-elevated/60 px-1.5 py-0.5 font-mono text-[9px] text-nebula">
          <Command size={9} />K
        </kbd>
      </div>

      {/* Nav groups — 4 group: pinned + 3 collapsible */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => {
          const items = navItems.filter((i) => i.group === g);
          if (!items.length) return null;
          const meta = groupMeta[g];
          const isOpen = !hydrated ? DEFAULT_EXPANDED[g] : expanded[g];

          return (
            <div key={g} className={cn("mb-4", g === "pinned" && "mb-3")}>
              {/* Section header — pinned'in başlığı yok */}
              {g !== "pinned" && (
                <button
                  onClick={() => toggle(g)}
                  className="group/h flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left transition-colors hover:bg-elevated/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
                      {meta.label}
                    </div>
                    {meta.subLabel && (
                      <div className="mt-0.5 text-[10px] text-text-faint/70 truncate">
                        {meta.subLabel}
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    size={12}
                    className={cn(
                      "shrink-0 text-text-faint transition-transform",
                      !isOpen && "-rotate-90"
                    )}
                  />
                </button>
              )}

              {/* Items — pinned hep açık, diğerleri toggle'a göre */}
              {(g === "pinned" || isOpen) && (
                <ul
                  className={cn(
                    "flex flex-col gap-0.5",
                    g !== "pinned" && "mt-1"
                  )}
                >
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    const accent = item.accent
                      ? accentColor[item.accent]
                      : "text-text-muted";
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
                            <span className="block truncate font-medium">
                              {item.label}
                            </span>
                            {item.subLabel && (
                              <span className="block truncate text-[10px] text-text-faint">
                                {item.subLabel}
                              </span>
                            )}
                          </span>
                          {active && (
                            <span className="h-1 w-1 shrink-0 rounded-full bg-ion animate-breathe" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
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
            <span className="text-text">Vibe Business · v0.7</span>
          </div>
          <div className="mt-1.5 font-mono text-[9px] italic text-text-faint">
            &quot;There is no spoon.&quot;
          </div>
        </div>
      </div>
    </aside>
  );
}
