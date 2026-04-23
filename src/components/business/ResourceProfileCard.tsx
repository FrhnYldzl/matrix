"use client";

import { cn } from "@/lib/cn";
import type { ResourceProfile } from "@/lib/business-library";
import { Card } from "../ui/Card";
import { TaskKind } from "./ExecutionBadge";
import { Coins, Clock, MapPin, Wrench, Users } from "lucide-react";

const capitalMeta: Record<
  ResourceProfile["capital"]["level"],
  { label: string; tone: "quantum" | "ion" | "solar" | "crimson" }
> = {
  none: { label: "Sermaye gerekmez", tone: "quantum" },
  low: { label: "Düşük sermaye", tone: "ion" },
  medium: { label: "Orta sermaye", tone: "solar" },
  high: { label: "Yüksek sermaye", tone: "crimson" },
};

const presenceMeta: Record<
  ResourceProfile["physicalPresence"],
  { label: string; tone: "quantum" | "ion" | "solar" | "crimson" }
> = {
  none: { label: "Fiziksel yok", tone: "quantum" },
  occasional: { label: "Zaman zaman", tone: "ion" },
  regular: { label: "Düzenli", tone: "solar" },
  "full-time": { label: "Tam zamanlı", tone: "crimson" },
};

const toneCls = (tone: "quantum" | "ion" | "solar" | "crimson") =>
  tone === "quantum"
    ? "text-quantum border-quantum/30 bg-quantum-soft"
    : tone === "ion"
    ? "text-ion border-ion/30 bg-ion-soft"
    : tone === "solar"
    ? "text-solar border-solar/30 bg-solar-soft"
    : "text-crimson border-crimson/30 bg-crimson-soft";

export function ResourceProfileCard({ profile }: { profile: ResourceProfile }) {
  const cap = capitalMeta[profile.capital.level];
  const pres = presenceMeta[profile.physicalPresence];

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <Coins size={14} className="text-solar" />
          <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
            Kaynak Raporu
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          Ne lazım, ne lazım değil
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Capital */}
        <div className={cn("rounded-lg border px-3 py-3", toneCls(cap.tone))}>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
            <Coins size={11} />
            Sermaye
          </div>
          <div className="mt-1 text-sm font-semibold">{cap.label}</div>
          {profile.capital.minUsd != null && profile.capital.maxUsd != null && (
            <div className="mt-0.5 font-mono text-[11px] tabular-nums opacity-90">
              ${profile.capital.minUsd.toLocaleString()} – $
              {profile.capital.maxUsd.toLocaleString()}
            </div>
          )}
          {profile.capital.note && (
            <div className="mt-1 text-[10px] opacity-75 leading-snug">{profile.capital.note}</div>
          )}
        </div>

        {/* Time */}
        <div className="rounded-lg border border-border/60 bg-elevated/40 px-3 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            <Clock size={11} />
            Zaman
          </div>
          <div className="mt-1 text-sm font-semibold text-text">
            {profile.time.hoursPerWeek.min}–{profile.time.hoursPerWeek.max} sa / hafta
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-text-muted">
            MVP: {profile.time.weeksToMvp.min}–{profile.time.weeksToMvp.max} hafta
          </div>
        </div>

        {/* Physical presence */}
        <div className={cn("rounded-lg border px-3 py-3", toneCls(pres.tone))}>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
            <MapPin size={11} />
            Fiziksel Varlık
          </div>
          <div className="mt-1 text-sm font-semibold">{pres.label}</div>
          <div className="mt-0.5 text-[10px] opacity-75">
            {profile.physicalPresence === "none"
              ? "Evden ya da nereden istersen"
              : profile.physicalPresence === "occasional"
              ? "Ayda birkaç kez tedarikçi / etkinlik"
              : profile.physicalPresence === "regular"
              ? "Haftalık depo / stüdyo ziyareti"
              : "Saha operasyonu merkezi"}
          </div>
        </div>

        {/* Team */}
        <div className="rounded-lg border border-border/60 bg-elevated/40 px-3 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            <Users size={11} />
            Skill
          </div>
          <div className="mt-1 text-sm font-medium text-text line-clamp-2">
            {profile.humanSkills.slice(0, 2).join(", ")}
            {profile.humanSkills.length > 2 && "…"}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-text-faint">
            {profile.humanSkills.length} insan becerisi
          </div>
        </div>
      </div>

      {/* Tasks split */}
      {((profile.digitalTasks && profile.digitalTasks.length > 0) ||
        (profile.physicalTasks && profile.physicalTasks.length > 0)) && (
        <div className="grid grid-cols-1 gap-4 border-t border-border/50 p-5 md:grid-cols-2">
          {profile.digitalTasks && profile.digitalTasks.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <TaskKind kind="digital" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  {profile.digitalTasks.length} iş
                </span>
              </div>
              <ul className="space-y-1.5">
                {profile.digitalTasks.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-md border border-ion/20 bg-ion-soft/20 px-3 py-2 text-xs text-text"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-ion" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {profile.physicalTasks && profile.physicalTasks.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <TaskKind kind="physical" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  {profile.physicalTasks.length} iş
                </span>
              </div>
              <ul className="space-y-1.5">
                {profile.physicalTasks.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-md border border-solar/30 bg-solar-soft/25 px-3 py-2 text-xs text-text"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-solar" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tools */}
      {profile.tools.length > 0 && (
        <div className="border-t border-border/50 p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            <Wrench size={10} />
            Araçlar
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.tools.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border/50 bg-elevated/50 px-2 py-0.5 font-mono text-[11px] text-text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
