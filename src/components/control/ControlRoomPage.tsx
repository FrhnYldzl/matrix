"use client";

import { ControlRoomHero } from "./ControlRoomHero";
import { KillSwitchCard } from "./KillSwitchCard";
import { ApprovalQueue } from "./ApprovalQueue";
import { LiveAgentsGrid } from "./LiveAgentsGrid";
import { ErrorPatternsCard } from "./ErrorPatternsCard";
import { AuditLogTable } from "./AuditLogTable";

export function ControlRoomPage() {
  return (
    <div className="flex flex-col">
      <ControlRoomHero />

      <section className="space-y-6 px-8 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <KillSwitchCard />
          <ApprovalQueue />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LiveAgentsGrid />
          </div>
          <div>
            <ErrorPatternsCard />
          </div>
        </div>

        <AuditLogTable />
      </section>
    </div>
  );
}
