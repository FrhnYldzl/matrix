"use client";

import { agents, skills } from "@/lib/mock-data";
import type { Workspace } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { cn } from "@/lib/cn";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

function scoreAlignment(ws: Workspace) {
  const themes = ws.strategicThemes.map((t) => t.label.toLowerCase());
  const wsAgents = agents.filter((a) => a.workspaceId === ws.id);
  const wsSkills = skills.filter((s) => s.workspaceId === ws.id);

  // Primitive keyword match: how many themes are "represented" by any agent/skill text
  let matchedThemes = 0;
  const themeHits: { theme: string; hits: number }[] = themes.map((t) => {
    const needle = t.split(" ")[0].toLowerCase();
    const hits =
      wsAgents.filter((a) => a.description.toLowerCase().includes(needle)).length +
      wsSkills.filter((s) => s.description.toLowerCase().includes(needle)).length;
    if (hits > 0) matchedThemes += 1;
    return { theme: t, hits };
  });

  const coverage = themes.length === 0 ? 0 : Math.round((matchedThemes / themes.length) * 100);
  return { coverage, themeHits };
}

export function AlignmentPanel({ ws }: { ws: Workspace }) {
  const { coverage, themeHits } = scoreAlignment(ws);

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-nebula" />
          <CardTitle className="text-nebula">Oracle Hiza Paneli</CardTitle>
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.18em] text-text-faint">
              Tema kapsamı
            </span>
            <span className="font-mono text-xs text-text">
              %{coverage}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                coverage >= 75 ? "bg-quantum" : coverage >= 50 ? "bg-ion" : "bg-solar"
              )}
              style={{ width: `${coverage}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
            Stratejik temalarından {themeHits.filter((t) => t.hits > 0).length}/
            {themeHits.length} tanesi mevcut ajan veya skill'lerde karşılık buluyor.
          </p>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-text-faint">Temalar</div>
          <ul className="mt-2 space-y-1.5">
            {themeHits.map((t) => (
              <li
                key={t.theme}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="flex items-center gap-2 min-w-0">
                  {t.hits > 0 ? (
                    <CheckCircle2 size={12} className="shrink-0 text-quantum" />
                  ) : (
                    <AlertCircle size={12} className="shrink-0 text-solar" />
                  )}
                  <span className="truncate text-text capitalize">{t.theme}</span>
                </span>
                <span className="font-mono text-[10px] text-text-faint">
                  {t.hits} eşleşme
                </span>
              </li>
            ))}
            {themeHits.length === 0 && (
              <li className="text-xs text-text-faint italic">
                Henüz tema yok.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-nebula/30 bg-nebula-soft/40 p-3">
          <div className="flex items-start gap-2">
            <Sparkles size={12} className="mt-0.5 text-nebula" />
            <div className="flex-1 text-[11px] leading-relaxed text-text-muted">
              <span className="font-medium text-text">Oracle yakında:</span> Bu DNA kaydedildiğinde
              Matrix her gece mevcut ajan/skill/workflow'ları buna göre tarayıp hizalama önerisi
              üretecek.
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
