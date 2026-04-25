"use client";

/**
 * OracleGuide — her dashboard'un tepesinde Oracle'ın bu sayfa için verdiği
 * "şimdi şunu yap" yönlendirmesi.
 *
 * Felsefe: Ferhan'ın direktifi → "Oracle kullanıcıyı yönlendirmeli, motive
 * etmeli, blok kaldırmalı, destek istemeli."
 *
 * Davranış:
 *   - Workspace'in mevcut state'ine göre next-action önerir (rule-based)
 *   - Tek tıkla aksiyon → ya yeni sayfaya git ya da hemen modal aç
 *   - Dismiss edilebilir (per-page, session bazlı)
 *   - Quick-win pending varsa onları öncelikle gösterir (momentum boost)
 *
 * Kullanım:
 *   <OracleGuide page="goals" />
 *   <OracleGuide page="vision" />
 *   <OracleGuide page="operator" />
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import { goals as seedGoals } from "@/lib/mock-data";
import { ArrowRight, Sparkles, X } from "lucide-react";

export type GuidePage =
  | "command-deck"
  | "vision"
  | "goals"
  | "org"
  | "library"
  | "operator"
  | "control"
  | "traction"
  | "prime"
  | "costs"
  | "insights";

interface NextAction {
  /** Tek cümle teklif */
  prompt: string;
  /** Aksiyon hedefi — link veya callback */
  cta: string;
  href?: string;
  /** Vurgu rengi */
  tone: "ion" | "nebula" | "quantum" | "solar";
  /** Tahmini süre */
  estMinutes?: number;
  /** Motivasyon notu (opsiyonel — neden) */
  why?: string;
}

export function OracleGuide({ page }: { page: GuidePage }) {
  const [dismissed, setDismissed] = useState(false);
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const createdGoals = useWorkspaceStore((s) => s.createdGoals);
  const createdAgents = useWorkspaceStore((s) => s.createdAgents);
  const createdOperatorTasks = useWorkspaceStore((s) => s.createdOperatorTasks);
  const createdRituals = useWorkspaceStore((s) => s.createdRituals);
  const createdBudgets = useWorkspaceStore((s) => s.createdBudgets);

  const ws = workspaces.find((w) => w.id === wsId);

  const action = useMemo<NextAction | null>(() => {
    if (!ws) return null;

    const wsGoals = [
      ...seedGoals.filter((g) => g.workspaceId === ws.id),
      ...createdGoals.filter((c) => c.entity.workspaceId === ws.id).map((c) => c.entity),
    ];
    const wsTasks = createdOperatorTasks
      .filter((c) => c.entity.workspaceId === ws.id)
      .map((c) => c.entity);
    const quickWins = wsTasks.filter((t) => t.tags.includes("quick-win") && t.status === "todo");

    return computeNextAction({
      page,
      ws,
      goalsCount: wsGoals.length,
      pendingQuickWins: quickWins.length,
      ritualsCount: createdRituals.filter((c) => c.entity.workspaceId === ws.id).length,
      budgetsCount: createdBudgets.filter((c) => c.entity.workspaceId === ws.id).length,
      agentsCount: createdAgents.filter((c) => c.entity.workspaceId === ws.id).length,
      hasMission: !!ws.mission?.trim(),
      hasVision: !!ws.vision?.trim(),
      themeCount: ws.strategicThemes?.length ?? 0,
    });
  }, [
    ws,
    page,
    createdGoals,
    createdOperatorTasks,
    createdRituals,
    createdBudgets,
    createdAgents,
  ]);

  if (!ws || !action || dismissed) return null;

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 overflow-hidden rounded-xl border p-4 transition-all",
        action.tone === "ion" && "border-ion/30 bg-ion-soft/15",
        action.tone === "nebula" && "border-nebula/30 bg-nebula-soft/15",
        action.tone === "quantum" && "border-quantum/30 bg-quantum-soft/15",
        action.tone === "solar" && "border-solar/30 bg-solar-soft/15"
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent",
          action.tone === "ion" && "text-ion",
          action.tone === "nebula" && "text-nebula",
          action.tone === "quantum" && "text-quantum",
          action.tone === "solar" && "text-solar"
        )}
      />
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
          action.tone === "ion" && "border-ion/40 bg-ion-soft text-ion",
          action.tone === "nebula" && "border-nebula/40 bg-nebula-soft text-nebula",
          action.tone === "quantum" && "border-quantum/40 bg-quantum-soft text-quantum",
          action.tone === "solar" && "border-solar/40 bg-solar-soft text-solar"
        )}
      >
        <Sparkles size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.22em]",
              action.tone === "ion" && "text-ion",
              action.tone === "nebula" && "text-nebula",
              action.tone === "quantum" && "text-quantum",
              action.tone === "solar" && "text-solar"
            )}
          >
            Oracle · şimdi şunu yap
          </span>
          {action.estMinutes != null && (
            <span className="font-mono text-[9px] text-text-faint">
              ~{action.estMinutes}dk
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-text">{action.prompt}</p>
        {action.why && (
          <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
            <span className="font-mono text-text-faint">neden:</span> {action.why}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action.href ? (
          <Link
            href={action.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              action.tone === "ion" && "bg-ion text-void hover:bg-ion/90",
              action.tone === "nebula" && "bg-nebula text-void hover:bg-nebula/90",
              action.tone === "quantum" && "bg-quantum text-void hover:bg-quantum/90",
              action.tone === "solar" && "bg-solar text-void hover:bg-solar/90"
            )}
          >
            {action.cta}
            <ArrowRight size={12} />
          </Link>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
              action.tone === "ion" && "bg-ion-soft text-ion",
              action.tone === "nebula" && "bg-nebula-soft text-nebula",
              action.tone === "quantum" && "bg-quantum-soft text-quantum",
              action.tone === "solar" && "bg-solar-soft text-solar"
            )}
          >
            {action.cta}
          </span>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="rounded-md p-1.5 text-text-faint hover:bg-elevated hover:text-text-muted"
          aria-label="Bu öneriyi gizle"
          title="Bu sayfada bu önerme gizle"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Rule engine — page × workspace state → next action
// ═══════════════════════════════════════════════════════════════════════════

interface GuideContext {
  page: GuidePage;
  ws: { name: string; mission: string; vision: string };
  goalsCount: number;
  pendingQuickWins: number;
  ritualsCount: number;
  budgetsCount: number;
  agentsCount: number;
  hasMission: boolean;
  hasVision: boolean;
  themeCount: number;
}

function computeNextAction(ctx: GuideContext): NextAction | null {
  // GLOBAL OVERRIDE — quick-win'ler her sayfada en yüksek öncelik (momentum)
  if (ctx.pendingQuickWins > 0 && ctx.page !== "operator") {
    return {
      prompt: `Operator'da ${ctx.pendingQuickWins} adet quick-win bekliyor — toplam 30 dakika, ilk dopamin atışını al.`,
      why: "İlk 24 saatte 1-2 task tamamlanmazsa onboarding momentum'u sönüyor (Skinner box).",
      cta: "Operator'a git",
      href: "/operator",
      tone: "solar",
      estMinutes: 30,
    };
  }

  switch (ctx.page) {
    case "command-deck":
      if (!ctx.hasMission) {
        return {
          prompt: `${ctx.ws.name} için misyon hâlâ boş. Tek cümle yaz, Oracle önerilerini buradan eğit.`,
          why: "Misyon yoksa Oracle stratejik hiza taraması yapamaz, öneriler genel kalır.",
          cta: "Vision'a git",
          href: "/vision",
          tone: "nebula",
          estMinutes: 5,
        };
      }
      if (ctx.goalsCount === 0) {
        return {
          prompt: "Hiç OKR yok. Oracle 4 hedef hazırladı, 2 dakikada başlangıç değerlerini gir.",
          cta: "Goals'a git",
          href: "/goals",
          tone: "quantum",
          estMinutes: 2,
        };
      }
      return {
        prompt: "Bu hafta için 1 Oracle önerisini kabul et — Matrix'i bu sinyalle eğitiyorsun.",
        why: "Her kabul edilen öneri Oracle'ın priorlarını günceller, sonraki öneriler daha isabetli olur.",
        cta: "Oracle'ı aç",
        href: "/oracle",
        tone: "nebula",
        estMinutes: 5,
      };

    case "vision":
      if (!ctx.hasMission) {
        return {
          prompt: "Misyon alanı boş — bu workspace'in 1 cümlelik amacını yaz.",
          why: "Misyon Strategic Themes ve Oracle priors'ı için kök referans.",
          cta: "Misyonu yaz",
          tone: "nebula",
          estMinutes: 5,
        };
      }
      if (!ctx.hasVision) {
        return {
          prompt: "3-5 yıllık vizyon henüz yok. 'Bu asset 36 ay sonra ne olacak?' — yaz.",
          cta: "Vizyonu yaz",
          tone: "ion",
          estMinutes: 8,
        };
      }
      if (ctx.themeCount === 0) {
        return {
          prompt: "Stratejik tema yok. En az 2 tema ekle (örn. 'AI-first content', 'community moat').",
          why: "Temalar olmadan Oracle 'şu agent şu temaya hizmet ediyor' bağını kuramaz.",
          cta: "Tema ekle",
          tone: "quantum",
          estMinutes: 10,
        };
      }
      return null;

    case "goals":
      if (ctx.goalsCount === 0) {
        return {
          prompt: "Bu workspace için OKR yok. Oracle interview cevaplarından 4 hedef hazır.",
          why: "OKR yoksa Goals & Orbits sayfası boş, sapma tespit edilemiyor.",
          cta: "Onboarding'i tekrar aç",
          href: "/",
          tone: "quantum",
          estMinutes: 2,
        };
      }
      return {
        prompt: "Her OKR'ye en az 1 agent ya da skill bağla — başıboş hedef sapma uyarısı tetikler.",
        why: "Linked goal = otomatik Scorecard takibi.",
        cta: "Goals'ta link kur",
        tone: "ion",
        estMinutes: 5,
      };

    case "operator":
      if (ctx.pendingQuickWins > 0) {
        return {
          prompt: `${ctx.pendingQuickWins} quick-win bekliyor — her biri 2-15 dakika. Bugün 2 tane bitir, streak başlat.`,
          why: "Quick-win'ler Dopamine engine'in 'first hit' stratejisi — 1 task = +5 XP + bonus rulosu.",
          cta: "İlk task'ı aç",
          tone: "solar",
          estMinutes: 10,
        };
      }
      return {
        prompt: "Bu hafta için fiziksel task ekle — supplier görüşmesi, demo ürün, ofis aksiyonu.",
        cta: "Yeni task",
        tone: "quantum",
        estMinutes: 5,
      };

    case "prime":
      if (ctx.ritualsCount === 0) {
        return {
          prompt: "Hiç ritüel yok. Oracle 4 default ritüel hazırladı (L10, Weekly Review, Deep Work, Strategic Review).",
          cta: "Ritüelleri kabul et",
          tone: "nebula",
          estMinutes: 3,
        };
      }
      return {
        prompt: "Pazartesi 09:30 L10 Meeting'i bugün gerçekleştir — streak'in başlasın.",
        why: "EOS L10 ritmi her hafta tutturulduğunda 5. haftada otomatik +300 XP achievement açar.",
        cta: "L10'u başlat",
        tone: "ion",
        estMinutes: 90,
      };

    case "costs":
      if (ctx.budgetsCount === 0) {
        return {
          prompt: "Bütçe satırı yok. Oracle başlangıç sermayene göre 4-5 bütçe önerdi.",
          why: "Bütçe yoksa kill-switch tetiklenmez, runaway LLM costs riski var.",
          cta: "Bütçeleri ayarla",
          tone: "solar",
          estMinutes: 5,
        };
      }
      return null;

    case "org":
      if (ctx.agentsCount === 0) {
        return {
          prompt: "Bu workspace'te hiç agent yok. Oracle Forge ile natural language'dan agent yarat.",
          cta: "Forge'a git",
          href: "/library",
          tone: "nebula",
          estMinutes: 8,
        };
      }
      return {
        prompt: "Org Studio'da bir agent'a tıkla — Inspector'dan model routing'i kontrol et.",
        why: "Yanlış model routing The Source modülünde maliyet patlatabilir.",
        cta: "Bir agent seç",
        tone: "ion",
        estMinutes: 5,
      };

    case "library":
      return {
        prompt: "Oracle Forge'da bir cümle ile yeni skill veya workflow yarat (örn. 'Slack'te yeni mesaj geldiğinde özetle').",
        cta: "Forge'u aç",
        tone: "nebula",
        estMinutes: 5,
      };

    case "control":
      return {
        prompt: "Approval queue'da bekleyen 1 aksiyon var — kabul ya da reddet, Oracle eğitilsin.",
        cta: "Approval'ı aç",
        tone: "solar",
        estMinutes: 3,
      };

    case "traction":
      return {
        prompt: "Captain's Log'a bu hafta 1 Rock güncellemesi ekle — milestone progress'i kayıtsız kalmasın.",
        cta: "Rock'ı güncelle",
        tone: "quantum",
        estMinutes: 5,
      };

    case "insights":
      return {
        prompt: "The Truth'ta 7 günlük rollup'ı oku — 1 sapma varsa Oracle'a sor.",
        cta: "Rollup'ı aç",
        tone: "ion",
        estMinutes: 8,
      };

    default:
      return null;
  }
}
