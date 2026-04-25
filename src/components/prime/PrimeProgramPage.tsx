"use client";

/**
 * The Prime Program — günlük/haftalık ritüellerin kayıt ve takip ekranı.
 *
 * Matrix lore: "Prime Program" = sistemin kendi öz-disiplin programı. Filmde
 * Architect Neo'ya The Source'ta bunu açıklar. Burada ritüel kullanıcıyı
 * besler — günlük deep work, haftalık L10, aylık strategic review.
 *
 * Operasyonel rol:
 *   - Oracle onboarding 4 default ritual yarattı (Mon L10, Fri Review,
 *     Daily Deep Work, Monthly Strategic). Bu sayfa onları gösterir
 *   - Her ritüel için "✓ Bugün yaptım" butonu — streak +1, dopamine event
 *   - Streak kırılma uyarısı (renk + emoji)
 *   - Aktif/pasif toggle (yapamayacaksan duraklat)
 */

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import { OracleGuide } from "../oracle/OracleGuide";
import { Calendar, CheckCircle2, Clock, Flame, Pause, Play, Repeat } from "lucide-react";
import { toast } from "@/lib/toast";

const cadenceLabel: Record<string, string> = {
  daily: "Günlük",
  weekly: "Haftalık",
  biweekly: "İki haftada bir",
  monthly: "Aylık",
};

const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function PrimeProgramPage() {
  const { currentWorkspaceId, workspaces, createdRituals } = useWorkspaceStore();
  const completeRitual = useWorkspaceStore((s) => s.completeRitual);
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  const wsRituals = useMemo(
    () => createdRituals.filter((c) => c.entity.workspaceId === ws?.id).map((c) => c.entity),
    [ws, createdRituals]
  );

  const stats = useMemo(() => {
    const active = wsRituals.filter((r) => r.active).length;
    const totalStreak = wsRituals.reduce((s, r) => s + r.streak, 0);
    const longest = wsRituals.reduce((m, r) => Math.max(m, r.streak), 0);
    const completedToday = wsRituals.filter((r) => {
      if (!r.lastRunAtIso) return false;
      const last = new Date(r.lastRunAtIso);
      const today = new Date();
      return (
        last.getFullYear() === today.getFullYear() &&
        last.getMonth() === today.getMonth() &&
        last.getDate() === today.getDate()
      );
    }).length;
    return { active, totalStreak, longest, completedToday };
  }, [wsRituals]);

  if (!ws) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-text-muted">
        Workspace yok — sol üstten ekle.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <div className="pointer-events-none absolute -top-20 left-1/4 h-48 w-[500px] rounded-full bg-nebula/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-40 w-[400px] rounded-full bg-ion/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <Repeat size={12} className="text-nebula" />
            The Prime Program · {ws.name}
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            {wsRituals.length} ritüel · {stats.completedToday} bugün işlendi
          </h1>
          <p className="mt-3 max-w-3xl text-base text-text-muted leading-relaxed">
            Architect Neo&apos;ya The Source&apos;ta sistemin kendi öz-disiplin
            programını anlatır. Bu sayfa o disiplinin kendisi — günlük deep
            work, haftalık L10, aylık strategic review. Her tamamlama Dopamine
            engine&apos;e <b className="text-text">+10–150 XP</b> akıtır,
            streak&apos;ler &gt;%300 makro ödül multiplier&apos;ı tetikler.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatPill count={stats.active} label="aktif" tone="ion" />
            <StatPill count={stats.completedToday} label="bugün ✓" tone="quantum" />
            <StatPill count={stats.totalStreak} label="toplam streak" tone="solar" />
            <StatPill count={stats.longest} label="en uzun" tone="nebula" />
          </div>
        </div>
      </section>

      <section className="px-8 py-8 space-y-6">
        <OracleGuide page="prime" />

        {wsRituals.length === 0 ? (
          <EmptyRituals />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {wsRituals.map((r) => (
              <RitualCard
                key={r.id}
                ritual={r}
                onComplete={() => {
                  completeRitual(r.id);
                  // recordAction zaten store'da fışkırıyor — burada extra toast
                  // yok ki overlap olmasın
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Ritual Card
// ───────────────────────────────────────────────────────────────────────────

function RitualCard({
  ritual,
  onComplete,
}: {
  ritual: import("@/lib/types").Ritual;
  onComplete: () => void;
}) {
  const lastIso = ritual.lastRunAtIso;
  const lastLabel = lastIso ? humanAgo(new Date(lastIso)) : "henüz yapılmadı";
  const isOverdue = ritual.lastRunAtIso
    ? Date.now() - new Date(ritual.lastRunAtIso).getTime() > expectedGapMs(ritual.cadence)
    : true;
  const todayDone =
    !!lastIso &&
    new Date(lastIso).toDateString() === new Date().toDateString();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-surface/70 transition-all",
        todayDone
          ? "border-quantum/30 bg-quantum-soft/15"
          : isOverdue
          ? "border-crimson/30 bg-crimson-soft/10"
          : "border-border/60"
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5",
          todayDone ? "bg-quantum" : isOverdue ? "bg-crimson/60" : "bg-nebula/40"
        )}
      />

      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
            todayDone
              ? "border-quantum/40 bg-quantum-soft text-quantum"
              : "border-nebula/40 bg-nebula-soft text-nebula"
          )}
        >
          {todayDone ? <CheckCircle2 size={18} /> : <Repeat size={18} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
              {cadenceLabel[ritual.cadence] ?? ritual.cadence}
              {ritual.cadence !== "daily" && ritual.dayOfWeek != null && (
                <> · {dayNames[ritual.dayOfWeek - 1]}</>
              )}
              {ritual.timeOfDay && <> · {ritual.timeOfDay}</>}
            </span>
            {!ritual.active && (
              <span className="rounded border border-border/60 bg-elevated/40 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-text-faint">
                duraklatıldı
              </span>
            )}
          </div>
          <h3 className="mt-1 text-[15px] font-medium text-text leading-snug">
            {ritual.label}
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
            {ritual.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10px] text-text-faint">
            <span className="inline-flex items-center gap-1">
              <Clock size={10} />
              {ritual.durationMinutes} dk
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1",
                ritual.streak >= 5 && "text-solar",
                ritual.streak >= 2 && ritual.streak < 5 && "text-nebula"
              )}
            >
              <Flame size={10} />
              {ritual.streak} streak
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1",
                isOverdue && !todayDone && "text-crimson"
              )}
            >
              <Calendar size={10} />
              {lastLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 px-5 py-3">
        <div className="flex items-center justify-between gap-2">
          {todayDone ? (
            <span className="font-mono text-[11px] text-quantum">
              ✓ Bugün tamamlandı — yarın görüşmek üzere.
            </span>
          ) : (
            <button
              onClick={onComplete}
              disabled={!ritual.active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all",
                ritual.active
                  ? "border-quantum/40 bg-quantum-soft text-quantum hover:bg-quantum/20"
                  : "border-border/60 bg-elevated text-text-faint cursor-not-allowed"
              )}
            >
              <CheckCircle2 size={11} />
              Bugün yaptım
            </button>
          )}
          <button
            onClick={() => {
              toast({
                tone: "ion",
                title: ritual.active ? "Ritüel duraklatıldı" : "Ritüel aktif",
                description:
                  "Pasif moda alma henüz mock — sonraki sprintte calendar push entegrasyonu var.",
              });
            }}
            className="inline-flex items-center gap-1 rounded-md p-1 text-text-faint hover:bg-elevated hover:text-text-muted"
            title={ritual.active ? "Duraklat" : "Devam ettir"}
          >
            {ritual.active ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function StatPill({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "ion" | "nebula" | "quantum" | "solar";
}) {
  const cls =
    tone === "ion"
      ? "text-ion bg-ion-soft border-ion/30"
      : tone === "nebula"
      ? "text-nebula bg-nebula-soft border-nebula/30"
      : tone === "quantum"
      ? "text-quantum bg-quantum-soft border-quantum/30"
      : "text-solar bg-solar-soft border-solar/30";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
        cls
      )}
    >
      <span className="font-mono text-sm font-semibold tabular-nums">{count}</span>
      <span className="uppercase tracking-wider">{label}</span>
    </span>
  );
}

function EmptyRituals() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-elevated/30 px-8 py-20 text-center">
      <Repeat size={32} className="text-text-faint" />
      <h3 className="mt-3 text-lg font-medium text-text">Henüz ritüel yok</h3>
      <p className="mt-2 max-w-md text-sm text-text-muted leading-relaxed">
        Oracle onboarding interview&apos;ı tamamla, 4 default ritüel
        otomatik kurulur (L10, Weekly Review, Daily Deep Work, Monthly
        Strategic). Veya buradan manuel ekleyebilirsin (sonraki sprint).
      </p>
    </div>
  );
}

function expectedGapMs(cadence: string): number {
  switch (cadence) {
    case "daily":
      return 36 * 3600000;
    case "weekly":
      return 8 * 86400000;
    case "biweekly":
      return 15 * 86400000;
    case "monthly":
      return 32 * 86400000;
    default:
      return 8 * 86400000;
  }
}

function humanAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const h = Math.round(ms / 3600000);
  if (h < 24) return `${h} saat önce`;
  const days = Math.round(ms / 86400000);
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.round(days / 7);
  if (weeks < 4) return `${weeks} hafta önce`;
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}
