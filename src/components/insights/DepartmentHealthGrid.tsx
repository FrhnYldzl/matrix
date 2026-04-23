"use client";

import { cn } from "@/lib/cn";
import { departments } from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { Users } from "lucide-react";

export function DepartmentHealthGrid() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const wsDepts = departments.filter((d) => d.workspaceId === currentWorkspaceId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-ion" />
          <CardTitle>Departman Sağlığı</CardTitle>
        </div>
      </CardHeader>
      <CardBody>
        {wsDepts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-elevated/30 p-4 text-center text-sm text-text-muted">
            Bu workspace'te departman yok.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {wsDepts.map((d) => {
              const tone =
                d.health >= 85
                  ? "quantum"
                  : d.health >= 70
                  ? "ion"
                  : d.health >= 55
                  ? "solar"
                  : "crimson";
              return (
                <div
                  key={d.id}
                  className={cn(
                    "rounded-lg border p-3",
                    tone === "quantum" && "border-quantum/30 bg-quantum-soft/15",
                    tone === "ion" && "border-ion/30 bg-ion-soft/15",
                    tone === "solar" && "border-solar/30 bg-solar-soft/15",
                    tone === "crimson" && "border-crimson/30 bg-crimson-soft/15"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-text">
                      {d.name}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-lg font-semibold tabular-nums",
                        tone === "quantum" && "text-quantum",
                        tone === "ion" && "text-ion",
                        tone === "solar" && "text-solar",
                        tone === "crimson" && "text-crimson"
                      )}
                    >
                      %{d.health}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-text-muted leading-relaxed">
                    {d.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-elevated">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          tone === "quantum" && "bg-quantum",
                          tone === "ion" && "bg-ion",
                          tone === "solar" && "bg-solar",
                          tone === "crimson" && "bg-crimson"
                        )}
                        style={{ width: `${d.health}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-text-faint">{d.owner}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
