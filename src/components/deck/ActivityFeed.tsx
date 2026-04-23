"use client";

import { activityFeed } from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { StatusDot } from "../ui/StatusDot";
import { cn } from "@/lib/cn";

function timeAgo(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa önce`;
  return `${Math.floor(diff / 86400)}g önce`;
}

export function ActivityFeed() {
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const items = activityFeed.filter((a) => a.workspaceId === wsId);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Son Aktivite</CardTitle>
          <p className="mt-1 text-xs text-text-muted">Canlı feed · her Task kaydı Notion'a yazılır</p>
        </div>
      </CardHeader>
      <CardBody>
        <ul className="space-y-3">
          {items.map((e) => {
            const tone =
              e.status === "ok"
                ? "live"
                : e.status === "waiting"
                ? "waiting"
                : "error";
            return (
              <li key={e.id} className="flex items-start gap-3">
                <div className="mt-1.5">
                  <StatusDot tone={tone} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="font-mono text-ion">{e.actor}</span>
                    <span className="text-text-muted">{e.verb}</span>
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 truncate text-sm",
                      e.status === "failed" ? "text-crimson" : "text-text"
                    )}
                  >
                    {e.object}
                  </div>
                </div>
                <span className="whitespace-nowrap font-mono text-[10px] text-text-faint">
                  {timeAgo(e.at)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}
