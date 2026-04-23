"use client";

import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import { agents, departments } from "@/lib/mock-data";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { StatusDot } from "../ui/StatusDot";
import { Network } from "lucide-react";
import Link from "next/link";

interface Node {
  id: string;
  label: string;
  model: string;
  status: "live" | "idle" | "paused" | "error";
  x: number; // 0-100 %
  y: number; // 0-100 %
}

function layoutAgents(workspaceId: string): Node[] {
  const wsAgents = agents.filter((a) => a.workspaceId === workspaceId);
  const n = wsAgents.length;
  if (n === 0) return [];

  // Orchestrator center, others on circle
  const orchestrator = wsAgents.find((a) => a.name === "orchestrator");
  const others = wsAgents.filter((a) => a.name !== "orchestrator");
  const nodes: Node[] = [];
  if (orchestrator) {
    nodes.push({
      id: orchestrator.id,
      label: orchestrator.displayName,
      model: orchestrator.model,
      status: orchestrator.status,
      x: 50,
      y: 50,
    });
  }
  const k = others.length;
  others.forEach((a, i) => {
    const angle = (i / Math.max(k, 1)) * Math.PI * 2 - Math.PI / 2;
    const r = 34;
    nodes.push({
      id: a.id,
      label: a.displayName,
      model: a.model,
      status: a.status,
      x: 50 + Math.cos(angle) * r,
      y: 50 + Math.sin(angle) * r,
    });
  });
  return nodes;
}

export function Constellation() {
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const nodes = layoutAgents(wsId);
  const wsDepartments = departments.filter((d) => d.workspaceId === wsId);
  const center = nodes.find((n) => n.label === "Orchestrator");

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Organizasyon Takımyıldızı</CardTitle>
          <p className="mt-1 text-xs text-text-muted">
            {nodes.length} ajan · {wsDepartments.length} departman · canlı durum
          </p>
        </div>
        <Link
          href="/org"
          className="inline-flex items-center gap-1.5 text-xs text-ion hover:text-ion/80"
        >
          <Network size={12} />
          Org Studio'yu aç
        </Link>
      </CardHeader>

      <CardBody>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-void via-surface to-void">
          {/* Constellation lines from center to others */}
          {center && (
            <svg className="absolute inset-0 h-full w-full">
              {nodes
                .filter((n) => n.id !== center.id)
                .map((n) => (
                  <line
                    key={n.id}
                    x1={`${center.x}%`}
                    y1={`${center.y}%`}
                    x2={`${n.x}%`}
                    y2={`${n.y}%`}
                    stroke="var(--color-border-strong)"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                    opacity="0.6"
                  />
                ))}
            </svg>
          )}

          {/* Nodes */}
          {nodes.map((n) => {
            const isCenter = center && n.id === center.id;
            return (
              <div
                key={n.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                <div
                  className={cn(
                    "group flex flex-col items-center gap-1.5 text-center"
                  )}
                >
                  <div
                    className={cn(
                      "relative flex items-center justify-center rounded-full border transition-all duration-300 group-hover:scale-110",
                      isCenter
                        ? "h-16 w-16 border-ion/60 bg-ion/15 shadow-[0_0_30px_rgba(77,184,255,0.45)]"
                        : "h-11 w-11 border-border-strong bg-elevated"
                    )}
                  >
                    <StatusDot tone={n.status} className="absolute -right-1 -top-1" />
                    <span
                      className={cn(
                        "font-mono font-semibold uppercase",
                        isCenter ? "text-sm text-ion" : "text-[11px] text-text"
                      )}
                    >
                      {n.label.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <span className="rounded-md bg-surface/90 px-1.5 py-0.5 text-[10px] font-medium text-text-muted backdrop-blur-sm whitespace-nowrap">
                    {n.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
