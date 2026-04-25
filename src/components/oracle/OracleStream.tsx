"use client";

/**
 * OracleStream — auto-pilot UX'in kalbi.
 *
 * Felsefe: Ferhan'ın Boeing kokpit eleştirisi. Kullanıcı 16 dashboard'la
 * boğulmasın, Oracle ne yapılacağını TEK TEK anlatsın, kullanıcı sadece
 * Onayla / Açıkla / Sonra desin. Matrix uçağı kaldırır, sen oturursun.
 *
 * Stream sırası (en acil önce):
 *   1. Pending quick-wins (Operator) — "ilk dopamin atışı"
 *   2. Yeni OKR'ler — "bunu sen yazmadın, ben hazırladım, onaylar mısın?"
 *   3. Bu haftaki ritüeller — "Pazartesi L10 başladı mı?"
 *   4. Oracle suggestion'ları (gap/strategy) — "şu skill eksik, ekleyelim mi?"
 *   5. Pending approvals (Control Room) — "external-send onayın gerekiyor"
 *
 * Her kartta 3 buton:
 *   - [Onayla / Yap] → ana aksiyon (state mutate + +XP)
 *   - [Açıkla] → glossary drawer açar, neden gerektiğini Oracle anlatır
 *   - [Sonra / Yoksay] → kart kapatılır, dismissed Set'ine düşer
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWorkspaceStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { GlossaryTerm } from "./Glossary";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

interface StreamItem {
  id: string;
  kind: "quick-win" | "okr" | "ritual" | "suggestion" | "approval";
  emoji: string;
  oracleSays: string;
  tone: "ion" | "nebula" | "quantum" | "solar" | "crimson";
  primaryAction: { label: string; href?: string; onClick?: () => void };
  glossaryTerm?: import("./Glossary").GlossaryKey;
  meta?: string;
}

export function OracleStream() {
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const createdGoals = useWorkspaceStore((s) => s.createdGoals);
  const createdRituals = useWorkspaceStore((s) => s.createdRituals);
  const createdOperatorTasks = useWorkspaceStore((s) => s.createdOperatorTasks);
  const setTaskStatus = useWorkspaceStore((s) => s.setTaskStatus);
  const completeRitual = useWorkspaceStore((s) => s.completeRitual);

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);

  const ws = workspaces.find((w) => w.id === wsId);

  const items = useMemo<StreamItem[]>(() => {
    if (!ws) return [];
    const out: StreamItem[] = [];

    // 1. Pending quick-wins (en acil)
    const wsTasks = createdOperatorTasks
      .filter((c) => c.entity.workspaceId === ws.id)
      .map((c) => c.entity);
    const quickWins = wsTasks.filter(
      (t) => t.tags.includes("quick-win") && t.status === "todo"
    );
    quickWins.slice(0, 2).forEach((t) => {
      out.push({
        id: `qw-${t.id}`,
        kind: "quick-win",
        emoji: "⚡",
        tone: "solar",
        oracleSays: `Hızlı bir kazanç var: "${t.title}" (${t.estimatedMinutes ?? 5} dk). Bunu bitirirsen ilk dopamin atışın geliyor — +5 XP.`,
        primaryAction: {
          label: "Yap (✓ Bitti)",
          onClick: () => setTaskStatus(t.id, "done"),
        },
        meta: t.description,
      });
    });

    // 2. New OKRs (kullanıcı onaylamadı) — INLINE acknowledge, /goals'a
    //    gitmeye gerek yok. Ferhan: "dashboardlara bağlı değil demek istiyorum"
    const wsGoals = createdGoals
      .filter((c) => c.entity.workspaceId === ws.id)
      .map((c) => c.entity);
    const oracleOriginGoals = createdGoals.filter(
      (c) => c.entity.workspaceId === ws.id && c.origin === "oracle"
    );
    if (oracleOriginGoals.length > 0 && !dismissed.has("okr-intro")) {
      const lag = wsGoals.find((g) => g.title.toLowerCase().includes("mrr")) || wsGoals[0];
      if (lag) {
        out.push({
          id: "okr-intro",
          kind: "okr",
          emoji: "🎯",
          tone: "quantum",
          oracleSays: `Senin için ${oracleOriginGoals.length} hedef hazırladım. Asıl olan: "${lag.title}". Onaylar mısın?`,
          primaryAction: {
            label: "Onayla",
            onClick: () => {
              // Dismiss et — gerçek "OKR'leri kabul ettim" sinyali. State'te
              // onlar zaten var, sadece kullanıcının görmüş+onaylamış olduğunu
              // dismissed Set'iyle takip ediyoruz.
            },
          },
          glossaryTerm: "okr",
          meta: `Hedef: ${lag.target}${lag.unit ?? ""} · Ölçüm: ${lag.metric} · Cadence: ${lag.cadence}. Goals'a gidip detaylı düzenlemek istersen yan menüden gidebilirsin — ama şu an gerek yok, ben takip ediyorum.`,
        });
      }
    }

    // 3. This week's rituals
    const wsRituals = createdRituals
      .filter((c) => c.entity.workspaceId === ws.id)
      .map((c) => c.entity);
    const todayRitual = wsRituals.find((r) => {
      if (!r.active) return false;
      const todayDone =
        r.lastRunAtIso &&
        new Date(r.lastRunAtIso).toDateString() === new Date().toDateString();
      if (todayDone) return false;
      // L10 monday, Weekly Review friday
      const today = new Date().getDay();
      const dayMap = today === 0 ? 7 : today; // ISO weekday
      return r.cadence === "daily" || r.dayOfWeek === dayMap;
    });
    if (todayRitual && !dismissed.has(`rit-${todayRitual.id}`)) {
      out.push({
        id: `rit-${todayRitual.id}`,
        kind: "ritual",
        emoji: "🔁",
        tone: "ion",
        oracleSays: `Bugünkü ritüelin: "${todayRitual.label}". ${todayRitual.durationMinutes} dakika sürer. Streak'ini başlatmak ister misin?`,
        primaryAction: {
          label: "Bugün yaptım",
          onClick: () => completeRitual(todayRitual.id),
        },
        glossaryTerm: "ritual",
        meta: todayRitual.description,
      });
    }

    return out;
  }, [
    ws,
    createdGoals,
    createdRituals,
    createdOperatorTasks,
    dismissed,
    setTaskStatus,
    completeRitual,
  ]);

  if (!ws) return null;

  // Tüm item'lar dismissed ise stream gizlenir
  const visibleItems = items.filter((i) => !dismissed.has(i.id));
  if (visibleItems.length === 0 && !collapsed) {
    return (
      <div className="rounded-2xl border border-quantum/30 bg-quantum-soft/15 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-quantum/40 bg-quantum-soft text-quantum">
            <CheckCircle2 size={18} />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-quantum">
              Oracle · all clear
            </div>
            <p className="mt-1 text-sm text-text">
              Şu an bekleyen aksiyon yok. <b>Matrix otomatik pilotta</b>. Yeni
              öneriler doğdukça burada görünür.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all",
        "border-nebula/30 bg-gradient-to-b from-nebula-soft/15 to-transparent"
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula to-transparent" />
      <div className="pointer-events-none absolute -top-20 left-1/4 h-32 w-[400px] rounded-full bg-nebula/15 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-border/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-nebula/40 bg-nebula-soft text-nebula">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
              Oracle · cofounder stream
            </div>
            <div className="text-sm font-medium text-text">
              {visibleItems.length} aksiyon bekliyor
            </div>
          </div>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-md p-1.5 text-text-faint transition-colors hover:bg-elevated/40 hover:text-text-muted"
          aria-label={collapsed ? "Aç" : "Kapat"}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Stream items */}
      {!collapsed && (
        <div className="relative space-y-2.5 p-5">
          {visibleItems.map((item) => (
            <StreamCard
              key={item.id}
              item={item}
              onDismiss={() => setDismissed((s) => new Set(s).add(item.id))}
            />
          ))}
        </div>
      )}

      {/* Footer hint */}
      {!collapsed && (
        <div className="relative border-t border-border/40 bg-elevated/30 px-5 py-2.5">
          <p className="text-center font-mono text-[10px] text-text-faint">
            <Zap size={10} className="mr-1 inline text-nebula" />
            Otomatik pilot — Matrix sırayı söylüyor, sen kabul/reddet diyorsun
          </p>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Tek kart
// ───────────────────────────────────────────────────────────────────────────

function StreamCard({
  item,
  onDismiss,
}: {
  item: StreamItem;
  onDismiss: () => void;
}) {
  const [done, setDone] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const handlePrimary = () => {
    if (item.primaryAction.onClick) {
      item.primaryAction.onClick();
      setDone(true);
      setTimeout(onDismiss, 800);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-quantum/40 bg-quantum-soft/30 px-3 py-2 text-quantum animate-in fade-in duration-300">
        <Check size={14} />
        <span className="text-sm font-medium">Yapıldı · +XP biner</span>
      </div>
    );
  }

  const toneCls =
    item.tone === "ion"
      ? "border-ion/30 bg-ion-soft/15"
      : item.tone === "nebula"
      ? "border-nebula/30 bg-nebula-soft/15"
      : item.tone === "quantum"
      ? "border-quantum/30 bg-quantum-soft/15"
      : item.tone === "solar"
      ? "border-solar/30 bg-solar-soft/15"
      : "border-crimson/30 bg-crimson-soft/15";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-3 transition-all",
        toneCls
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none">{item.emoji}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-text">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-nebula mr-1.5">
              Oracle:
            </span>
            {item.oracleSays}
            {item.glossaryTerm && (
              <>
                {" "}
                <GlossaryTerm term={item.glossaryTerm}>
                  {item.glossaryTerm.toUpperCase()}
                </GlossaryTerm>{" "}
                ne demek?
              </>
            )}
          </p>

          {showWhy && item.meta && (
            <div className="mt-2 rounded-md border border-border/50 bg-elevated/40 px-2.5 py-1.5 text-[11px] leading-relaxed text-text-muted">
              <b className="text-text-faint">Detay:</b> {item.meta}
            </div>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {item.primaryAction.href ? (
              <Link
                href={item.primaryAction.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  item.tone === "ion" && "bg-ion text-void hover:bg-ion/90",
                  item.tone === "nebula" && "bg-nebula text-void hover:bg-nebula/90",
                  item.tone === "quantum" && "bg-quantum text-void hover:bg-quantum/90",
                  item.tone === "solar" && "bg-solar text-void hover:bg-solar/90",
                  item.tone === "crimson" && "bg-crimson text-void hover:bg-crimson/90"
                )}
              >
                {item.primaryAction.label}
                <ArrowRight size={11} />
              </Link>
            ) : (
              <button
                onClick={handlePrimary}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  item.tone === "ion" && "bg-ion text-void hover:bg-ion/90",
                  item.tone === "nebula" && "bg-nebula text-void hover:bg-nebula/90",
                  item.tone === "quantum" && "bg-quantum text-void hover:bg-quantum/90",
                  item.tone === "solar" && "bg-solar text-void hover:bg-solar/90",
                  item.tone === "crimson" && "bg-crimson text-void hover:bg-crimson/90"
                )}
              >
                {item.primaryAction.label}
                <Check size={11} />
              </button>
            )}
            <button
              onClick={() => setShowWhy((w) => !w)}
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-elevated/40 px-3 py-1.5 text-xs text-text-muted transition-colors hover:text-text"
            >
              {showWhy ? "Detayı gizle" : "Açıkla"}
            </button>
            <button
              onClick={onDismiss}
              className="inline-flex items-center gap-1 rounded-md p-1.5 text-text-faint transition-colors hover:bg-elevated/40 hover:text-text-muted"
              title="Sonra"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
