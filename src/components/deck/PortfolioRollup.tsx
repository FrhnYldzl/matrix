"use client";

/**
 * Portfolio Rollup — the holdco operator's at-a-glance view of every
 * workspace (= every digital asset in the portfolio).
 *
 * Shown on The Construct as a bridge that says: "you're not just running
 * one thing — here's everything at once."
 */

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import {
  agents as allAgents,
  goals as allGoals,
  workflows as allWorkflows,
} from "@/lib/mock-data";
import { summarizeSpend, revenueAttribution } from "@/lib/costs";
import { Card } from "../ui/Card";
import { ArrowUpRight, Bot, Coins, Target, TrendingUp } from "lucide-react";

export function PortfolioRollup() {
  const { workspaces, setWorkspace, currentWorkspaceId } = useWorkspaceStore();

  const rows = useMemo(() => {
    const since = new Date(
      new Date("2026-04-23T00:00:00Z").getTime() - 30 * 86400000
    ).toISOString();

    return workspaces.map((w) => {
      const wAgents = allAgents.filter((a) => a.workspaceId === w.id);
      const liveAgents = wAgents.filter((a) => a.status === "live").length;
      const wWorkflows = allWorkflows.filter((f) => f.workspaceId === w.id);
      const activeWorkflows = wWorkflows.filter(
        (f) => f.lastStatus === "success" || f.lastStatus === "running"
      ).length;
      const wGoals = allGoals.filter((g) => g.workspaceId === w.id);
      const goalsAlive = wGoals.filter(
        (g) => g.trajectory === "on-track" || g.trajectory === "ahead"
      ).length;

      const spend = summarizeSpend(w.id, since).totalUsd;
      const revenue = revenueAttribution[w.id]?.monthlyUsd ?? 0;
      const roi = spend > 0 ? revenue / spend : revenue > 0 ? 999 : 0;

      return {
        ws: w,
        liveAgents,
        totalAgents: wAgents.length,
        activeWorkflows,
        totalWorkflows: wWorkflows.length,
        goalsAlive,
        totalGoals: wGoals.length,
        spend,
        revenue,
        roi,
      };
    });
  }, [workspaces]);

  const portfolioRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const portfolioSpend = rows.reduce((s, r) => s + r.spend, 0);
  const portfolioROI =
    portfolioSpend > 0 ? portfolioRevenue / portfolioSpend : 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            <TrendingUp size={11} className="text-nebula" />
            Portföy · {workspaces.length} dijital varlık
          </div>
          <h3 className="mt-0.5 text-base font-semibold text-text">
            Holdco anlık görünüm
          </h3>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            30g portföy ROI
          </div>
          <div
            className={cn(
              "mt-0.5 font-mono text-xl font-semibold",
              portfolioROI >= 10
                ? "text-quantum"
                : portfolioROI >= 3
                ? "text-ion"
                : "text-solar"
            )}
          >
            {portfolioROI >= 999
              ? "∞"
              : portfolioROI > 0
              ? `${portfolioROI.toFixed(1)}x`
              : "—"}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-elevated/30 font-mono text-[10px] uppercase tracking-wider text-text-faint">
              <th className="py-2.5 pl-5 pr-3 text-left">Asset</th>
              <th className="py-2.5 px-3 text-left">Sektör</th>
              <th className="py-2.5 px-3 text-right">Ajanlar</th>
              <th className="py-2.5 px-3 text-right">Workflow</th>
              <th className="py-2.5 px-3 text-right">OKR rotada</th>
              <th className="py-2.5 px-3 text-right">30g spend</th>
              <th className="py-2.5 px-3 text-right">30g gelir</th>
              <th className="py-2.5 px-3 text-right">ROI</th>
              <th className="py-2.5 pl-3 pr-5 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const roiTone =
                r.roi >= 10 ? "quantum" : r.roi >= 3 ? "ion" : r.roi > 0 ? "solar" : "text-muted";
              const isActive = r.ws.id === currentWorkspaceId;
              return (
                <tr
                  key={r.ws.id}
                  className={cn(
                    "border-b border-border/30 last:border-b-0 transition-colors hover:bg-elevated/40",
                    isActive && "bg-nebula-soft/20"
                  )}
                >
                  <td className="py-3 pl-5 pr-3">
                    <button
                      onClick={() => setWorkspace(r.ws.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md border font-mono text-[10px] font-semibold",
                          r.ws.accent === "ion" && "border-ion/40 bg-ion-soft text-ion",
                          r.ws.accent === "quantum" &&
                            "border-quantum/40 bg-quantum-soft text-quantum",
                          r.ws.accent === "nebula" &&
                            "border-nebula/40 bg-nebula-soft text-nebula",
                          r.ws.accent === "solar" &&
                            "border-solar/40 bg-solar-soft text-solar",
                          !r.ws.accent && "border-border/60 bg-elevated text-text"
                        )}
                      >
                        {r.ws.shortName}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text leading-tight">
                          {r.ws.name}
                        </div>
                        {isActive && (
                          <div className="font-mono text-[9px] text-nebula">aktif</div>
                        )}
                      </div>
                    </button>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-text-muted truncate">
                    {r.ws.industry}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-text-muted">
                    <span className="text-text">{r.liveAgents}</span>/{r.totalAgents}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-text-muted">
                    <span className="text-text">{r.activeWorkflows}</span>/{r.totalWorkflows}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-text-muted">
                    <span className="text-text">{r.goalsAlive}</span>/{r.totalGoals}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[12px] text-text-muted tabular-nums">
                    ${r.spend.toFixed(0)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[12px] text-text tabular-nums">
                    ${r.revenue.toLocaleString("tr-TR")}
                  </td>
                  <td
                    className={cn(
                      "py-3 px-3 text-right font-mono text-sm font-semibold tabular-nums",
                      roiTone === "quantum" && "text-quantum",
                      roiTone === "ion" && "text-ion",
                      roiTone === "solar" && "text-solar",
                      roiTone === "text-muted" && "text-text-muted"
                    )}
                  >
                    {r.roi >= 999 ? "∞" : r.roi > 0 ? `${r.roi.toFixed(1)}x` : "—"}
                  </td>
                  <td className="py-3 pl-3 pr-5 text-right">
                    <button
                      onClick={() => setWorkspace(r.ws.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-elevated/40 px-2 py-1 font-mono text-[10px] text-text-muted hover:text-text"
                    >
                      <ArrowUpRight size={10} />
                      yönet
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/40 bg-elevated/20 px-5 py-3 font-mono text-[10px]">
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-text-muted">
            <Bot size={11} className="text-ion" />
            {rows.reduce((s, r) => s + r.liveAgents, 0)} canlı ajan
          </span>
          <span className="flex items-center gap-1.5 text-text-muted">
            <Target size={11} className="text-quantum" />
            {rows.reduce((s, r) => s + r.goalsAlive, 0)} hedef rotada
          </span>
          <span className="flex items-center gap-1.5 text-text-muted">
            <Coins size={11} className="text-solar" />
            ${portfolioRevenue.toLocaleString("tr-TR")} / ay gelir
          </span>
        </span>
        <span className="text-text-faint">
          tüm portföy · son 30 gün · ROI {portfolioROI.toFixed(1)}x
        </span>
      </div>
    </Card>
  );
}
