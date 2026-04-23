"use client";

import { useWorkspaceStore } from "@/lib/store";
import { VisionHero } from "./VisionHero";
import { MissionVisionCard } from "./MissionVisionCard";
import { StrategicThemesCard } from "./StrategicThemesCard";
import { ValueAnchorsCard } from "./ValueAnchorsCard";
import { OkrsLinkCard } from "./OkrsLinkCard";
import { AlignmentPanel } from "./AlignmentPanel";

export function VisionPage() {
  const { currentWorkspaceId, workspaces } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  return (
    <div className="flex flex-col">
      <VisionHero ws={ws} />

      <section className="px-8 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left column: editable DNA */}
          <div className="space-y-6">
            <MissionVisionCard ws={ws} />
            <StrategicThemesCard ws={ws} />
            <ValueAnchorsCard ws={ws} />
            <OkrsLinkCard ws={ws} />
          </div>

          {/* Right column: sticky alignment panel */}
          <div>
            <AlignmentPanel ws={ws} />
          </div>
        </div>
      </section>
    </div>
  );
}
