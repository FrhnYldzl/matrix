"use client";

import { useWorkspaceStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { EditableText } from "../ui/EditableText";
import type { Workspace } from "@/lib/types";
import { Flag, Telescope } from "lucide-react";

export function MissionVisionCard({ ws }: { ws: Workspace }) {
  const { updateWorkspace } = useWorkspaceStore();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flag size={14} className="text-ion" />
            <CardTitle>Misyon</CardTitle>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            neden var olduğun
          </span>
        </CardHeader>
        <CardBody>
          <EditableText
            value={ws.mission}
            onChange={(v) => updateWorkspace(ws.id, { mission: v })}
            placeholder="Bir cümlede: bu dijital iş neden var?"
            multiline
            className="-mx-3 -my-2"
            textClassName="text-[15px] leading-relaxed"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Telescope size={14} className="text-nebula" />
            <CardTitle>Vizyon</CardTitle>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            3-5 yılda nerede olacaksın
          </span>
        </CardHeader>
        <CardBody>
          <EditableText
            value={ws.vision}
            onChange={(v) => updateWorkspace(ws.id, { vision: v })}
            placeholder="3-5 yıl sonra hangi noktayı yakalamış olacaksın?"
            multiline
            className="-mx-3 -my-2"
            textClassName="text-[15px] leading-relaxed"
          />
        </CardBody>
      </Card>
    </div>
  );
}
