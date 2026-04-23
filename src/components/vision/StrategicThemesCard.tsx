"use client";

import { useWorkspaceStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { EditableText } from "../ui/EditableText";
import { Compass, Plus, Trash2 } from "lucide-react";
import type { Workspace } from "@/lib/types";
import { cn } from "@/lib/cn";

function toneForWeight(w: number) {
  if (w >= 80) return { bar: "bg-quantum", text: "text-quantum", label: "Yüksek" };
  if (w >= 50) return { bar: "bg-ion", text: "text-ion", label: "Orta" };
  return { bar: "bg-solar", text: "text-solar", label: "Düşük" };
}

export function StrategicThemesCard({ ws }: { ws: Workspace }) {
  const { addStrategicTheme, updateStrategicTheme, removeStrategicTheme } =
    useWorkspaceStore();

  const add = () => {
    addStrategicTheme(ws.id, {
      id: `st-${Date.now()}`,
      label: "Yeni tema",
      description: "",
      weight: 50,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-ion" />
          <CardTitle>Stratejik Temalar</CardTitle>
        </div>
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={add}>
          <Plus size={12} />
          Tema ekle
        </Button>
      </CardHeader>
      <CardBody className="space-y-3">
        {ws.strategicThemes.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 bg-elevated/30 p-4 text-center text-sm text-text-muted">
            Henüz tema yok. En az 3 tema önerilir — ajan ve skill kararlarını bunlara göre
            yapacaksın.
          </div>
        )}
        {ws.strategicThemes.map((t) => {
          const tone = toneForWeight(t.weight);
          return (
            <div
              key={t.id}
              className="group relative rounded-lg border border-border/60 bg-elevated/40 p-3 transition-colors hover:border-border-strong"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <EditableText
                    value={t.label}
                    onChange={(v) => updateStrategicTheme(ws.id, t.id, { label: v })}
                    placeholder="Tema adı"
                    className="-mx-2 -my-1"
                    textClassName="text-sm font-medium"
                  />
                  <EditableText
                    value={t.description}
                    onChange={(v) => updateStrategicTheme(ws.id, t.id, { description: v })}
                    placeholder="Bu tema ne anlama geliyor?"
                    multiline
                    className="-mx-2 -my-1 mt-1"
                    textClassName="text-xs text-text-muted"
                  />
                </div>
                <button
                  onClick={() => removeStrategicTheme(ws.id, t.id)}
                  className="ml-2 shrink-0 rounded p-1 text-text-faint opacity-0 transition-all hover:bg-crimson/10 hover:text-crimson group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={t.weight}
                    onChange={(e) =>
                      updateStrategicTheme(ws.id, t.id, { weight: Number(e.target.value) })
                    }
                    className="w-full accent-[color:var(--color-ion)]"
                  />
                </div>
                <div className="flex w-24 items-center gap-2">
                  <span className={cn("font-mono text-[11px] tabular-nums", tone.text)}>
                    %{t.weight}
                  </span>
                  <span className={cn("text-[10px] uppercase tracking-wider", tone.text)}>
                    {tone.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
