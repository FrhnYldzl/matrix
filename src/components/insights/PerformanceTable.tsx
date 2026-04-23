"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  agents as seedAgents,
  skills as seedSkills,
} from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";

type Tab = "skills" | "agents";

export function PerformanceTable() {
  const { currentWorkspaceId, createdSkills, createdAgents } = useWorkspaceStore();
  const [tab, setTab] = useState<Tab>("skills");

  const skills = useMemo(
    () => [
      ...seedSkills.filter((s) => s.workspaceId === currentWorkspaceId),
      ...createdSkills
        .filter((c) => c.entity.workspaceId === currentWorkspaceId)
        .map((c) => c.entity),
    ],
    [currentWorkspaceId, createdSkills]
  );

  const agents = useMemo(
    () => [
      ...seedAgents.filter((a) => a.workspaceId === currentWorkspaceId),
      ...createdAgents
        .filter((c) => c.entity.workspaceId === currentWorkspaceId)
        .map((c) => c.entity),
    ],
    [currentWorkspaceId, createdAgents]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performans</CardTitle>
        <div className="flex gap-1">
          <TabBtn active={tab === "skills"} onClick={() => setTab("skills")}>
            Skills ({skills.length})
          </TabBtn>
          <TabBtn active={tab === "agents"} onClick={() => setTab("agents")}>
            Agents ({agents.length})
          </TabBtn>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {tab === "skills" ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border/60 bg-elevated/50 text-left font-mono text-[10px] uppercase tracking-wider text-text-faint">
                <th className="px-5 py-2 font-medium">Skill</th>
                <th className="px-3 py-2 font-medium">Sahip</th>
                <th className="px-3 py-2 text-right font-medium">Hafta</th>
                <th className="px-3 py-2 text-right font-medium">Golden</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border/30 text-xs transition-colors hover:bg-elevated/30"
                >
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-text">{s.displayName}</span>
                      <span className="truncate font-mono text-[10px] text-text-faint">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-ion">
                    {ownerAgentName(s.ownerAgentId, agents)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-text-muted">
                    {s.runsThisWeek}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-mono text-[11px]",
                        s.goldenTestPassing ? "text-quantum" : "text-crimson"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          s.goldenTestPassing ? "bg-quantum" : "bg-crimson"
                        )}
                      />
                      {s.goldenTestPassing ? "geçiyor" : "kırık"}
                    </span>
                  </td>
                </tr>
              ))}
              {skills.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-xs text-text-muted">
                    Bu workspace'te skill yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border/60 bg-elevated/50 text-left font-mono text-[10px] uppercase tracking-wider text-text-faint">
                <th className="px-5 py-2 font-medium">Agent</th>
                <th className="px-3 py-2 font-medium">Model</th>
                <th className="px-3 py-2 text-right font-medium">Çağrı</th>
                <th className="px-3 py-2 text-right font-medium">Başarı</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => {
                const pct = Math.round(a.successRate * 100);
                const tone =
                  pct >= 90 ? "text-quantum" : pct >= 70 ? "text-solar" : "text-crimson";
                return (
                  <tr
                    key={a.id}
                    className="border-b border-border/30 text-xs transition-colors hover:bg-elevated/30"
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-text">{a.displayName}</span>
                        <span className="truncate font-mono text-[10px] text-text-faint">
                          {a.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-muted uppercase">
                      {a.model}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-text-muted">
                      {a.callsToday}
                    </td>
                    <td className={cn("px-3 py-2.5 text-right font-mono tabular-nums", tone)}>
                      %{pct}
                    </td>
                  </tr>
                );
              })}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-xs text-text-muted">
                    Bu workspace'te agent yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ownerAgentName(ownerId: string, agents: any[]): string {
  const a = agents.find((x) => x.id === ownerId);
  return a ? a.name : "—";
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
        active
          ? "border-ion/40 bg-ion-soft text-ion"
          : "border-border/60 text-text-muted hover:border-border-strong hover:text-text"
      )}
    >
      {children}
    </button>
  );
}
