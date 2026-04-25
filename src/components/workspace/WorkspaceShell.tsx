"use client";

/**
 * WorkspaceShell — Base44 paradigmasında workspace içi ana yerleşim.
 *
 * Ferhan'ın direktifi (screenshot'lardan): "Bir workspace'in içinde görmek
 * istediklerim base44'ten esinlendim." — sol Oracle paneli (cofounder
 * context'li), orta panel 4 tab (Preview/Operations/Data/Backoffice).
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ ┌── Oracle Panel ──┐ ┌── Workspace Header ──────┐│ Preview │ Ops │
 *   │ │ Workspace · OPUS │ │ TüketiciRadar  asistan   ││  *active*    │
 *   │ │ Bugünkü hamleler │ │                           ││              │
 *   │ │  - yeni gelir    │ ├───────────────────────────┴──────────────┤
 *   │ │  - risk          │ │                                          │
 *   │ │  - ölçek         │ │  TAB CONTENT (Operations / Data / etc.)  │
 *   │ │ Konuşma log      │ │                                          │
 *   │ │ ──────────────   │ │                                          │
 *   │ │ Oracle'a yaz...  │ │                                          │
 *   │ └──────────────────┘ └───────────────────────────────────────────┘
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Sol Oracle paneli MVP'de basit (geçmiş chat history gösterir, mesaj
 * gönderme entegrasyonu sonraki sprint).
 */

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import {
  ArrowLeft,
  Database,
  Eye,
  Settings as SettingsIcon,
  Sparkles,
  Zap,
} from "lucide-react";

interface TabDef {
  key: "preview" | "operations" | "data" | "backoffice";
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const TABS: TabDef[] = [
  {
    key: "preview",
    label: "Preview",
    icon: Eye,
    description: "Asset'in canlı/staging görünümü",
  },
  {
    key: "operations",
    label: "Operations",
    icon: Zap,
    description: "Canlı KPI · agents · tasks · workflows · rituals",
  },
  {
    key: "data",
    label: "Data",
    icon: Database,
    description: "Entity tabloları · spreadsheet view",
  },
  {
    key: "backoffice",
    label: "Backoffice",
    icon: SettingsIcon,
    description: "Domain · plan · ekip · vision · entegrasyonlar",
  },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const ws = workspaces.find((w) => w.id === params.id);

  // Active tab — pathname'den çıkar
  const activeTab =
    TABS.find((t) => pathname?.includes(`/${t.key}`))?.key ?? "operations";

  if (!ws) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <div className="text-center text-text-muted">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
            Workspace bulunamadı
          </div>
          <div className="mt-2 text-sm">
            <Link href="/dashboard" className="text-nebula hover:underline">
              ← Portföye dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-void text-text">
      {/* SOL: Oracle Panel — workspace context */}
      <WorkspaceOraclePanel workspaceId={ws.id} workspaceName={ws.name} />

      {/* SAĞ: Tab nav + content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header — workspace name + tabs */}
        <header className="sticky top-0 z-20 border-b border-border/60 bg-void/85 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md border font-mono text-[11px] font-semibold",
                  ws.accent === "ion" && "border-ion/40 bg-ion-soft text-ion",
                  ws.accent === "nebula" && "border-nebula/40 bg-nebula-soft text-nebula",
                  ws.accent === "quantum" && "border-quantum/40 bg-quantum-soft text-quantum",
                  ws.accent === "solar" && "border-solar/40 bg-solar-soft text-solar"
                )}
              >
                {ws.shortName}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">{ws.name}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-quantum animate-breathe" />
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  {ws.industry}
                </div>
              </div>
            </div>

            {/* Tab nav — Base44 stilinde */}
            <nav className="flex items-center gap-1 rounded-lg border border-border/60 bg-elevated/30 p-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <Link
                    key={tab.key}
                    href={`/workspace/${ws.id}/${tab.key}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                      active
                        ? "bg-elevated text-text shadow-[inset_0_0_0_1px_var(--color-border)]"
                        : "text-text-muted hover:bg-elevated/50 hover:text-text"
                    )}
                    title={tab.description}
                  >
                    <Icon size={12} />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// WorkspaceOraclePanel — sol sticky panel (MVP)
// ───────────────────────────────────────────────────────────────────────────

function WorkspaceOraclePanel({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string;
}) {
  const oracleChatHistory = useWorkspaceStore((s) => s.oracleChatHistory);
  const messages = oracleChatHistory[workspaceId] ?? [];

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border/60 bg-surface/40 backdrop-blur-md lg:flex">
      {/* Brand row — back to portfolio */}
      <div className="border-b border-border/50 p-4">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint transition-colors hover:text-text-muted"
        >
          <ArrowLeft size={11} />
          Portföye dön
        </Link>
      </div>

      {/* Oracle header */}
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-nebula/40 bg-nebula-soft text-nebula">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="text-sm font-semibold text-text">Oracle</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
              {workspaceName.toUpperCase().slice(0, 18)} · OPUS
            </div>
          </div>
        </div>
      </div>

      {/* Chat history */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-faint">
          Konuşma
        </div>
        {messages.length === 0 ? (
          <div className="text-[11px] leading-relaxed text-text-muted">
            Henüz Oracle ile bu workspace üzerinde konuşma başlatmadın. Cmd+K
            ile her sayfadan açılır — ya da aşağıdan başla.
          </div>
        ) : (
          messages.slice(-6).map((m, i) => (
            <div key={i} className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
                {m.role === "assistant" ? "Oracle" : "Ferhan"} ·{" "}
                {new Date(m.at).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-[11px] leading-relaxed text-text-muted line-clamp-3">
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input dock — Cmd+K hint */}
      <div className="border-t border-border/50 p-3">
        <div className="rounded-lg border border-nebula/30 bg-nebula-soft/15 px-3 py-2">
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <Sparkles size={11} className="text-nebula" />
            <span>Oracle&apos;a yaz</span>
            <kbd className="ml-auto font-mono text-[9px] text-nebula">⌘K</kbd>
          </div>
        </div>
      </div>
    </aside>
  );
}
