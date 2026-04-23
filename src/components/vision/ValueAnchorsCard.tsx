"use client";

import { useWorkspaceStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { EditableText } from "../ui/EditableText";
import { Anchor, Plus, Trash2 } from "lucide-react";
import type { Workspace } from "@/lib/types";

export function ValueAnchorsCard({ ws }: { ws: Workspace }) {
  const { addValueAnchor, updateValueAnchor, removeValueAnchor } = useWorkspaceStore();

  const add = () => {
    addValueAnchor(ws.id, {
      id: `va-${Date.now()}`,
      label: "Yeni ilke",
      description: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Anchor size={14} className="text-quantum" />
          <CardTitle>Değer Çıpaları</CardTitle>
        </div>
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={add}>
          <Plus size={12} />
          İlke ekle
        </Button>
      </CardHeader>
      <CardBody className="space-y-2">
        <p className="text-xs leading-relaxed text-text-muted">
          İkilemde kaldığında ajanların dayanacağı ilkeler. Oracle bu çıpalarla çelişen her
          öneriyi işaretler.
        </p>
        <div className="space-y-2 pt-2">
          {ws.valueAnchors.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/60 bg-elevated/30 p-4 text-center text-sm text-text-muted">
              Henüz bir çıpa yok. En az 1 öneririm.
            </div>
          )}
          {ws.valueAnchors.map((a) => (
            <div
              key={a.id}
              className="group flex items-start gap-3 rounded-lg border border-border/60 bg-elevated/40 p-3 transition-colors hover:border-quantum/40"
            >
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-quantum" />
              <div className="min-w-0 flex-1">
                <EditableText
                  value={a.label}
                  onChange={(v) => updateValueAnchor(ws.id, a.id, { label: v })}
                  placeholder="İlke"
                  className="-mx-2 -my-1"
                  textClassName="text-sm font-medium"
                />
                <EditableText
                  value={a.description}
                  onChange={(v) => updateValueAnchor(ws.id, a.id, { description: v })}
                  placeholder="Neden önemli? Nasıl uygulanır?"
                  multiline
                  className="-mx-2 -my-1 mt-0.5"
                  textClassName="text-xs text-text-muted leading-relaxed"
                />
              </div>
              <button
                onClick={() => removeValueAnchor(ws.id, a.id)}
                className="shrink-0 rounded p-1 text-text-faint opacity-0 transition-all hover:bg-crimson/10 hover:text-crimson group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
