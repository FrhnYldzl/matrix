"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Command, Search, Sparkles } from "lucide-react";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { Button } from "../ui/Button";
import { useWorkspaceStore } from "@/lib/store";
import {
  agents as allAgents,
  departments as allDepartments,
  goals as allGoals,
  skills as allSkills,
  workflows as allWorkflows,
} from "@/lib/mock-data";
import { scanWorkspace } from "@/lib/oracle";
import { connectors as allConnectorsTop } from "@/lib/connectors";
import { getBudgetsWithSpend as getBudgetsTop } from "@/lib/costs";
import { toast } from "@/lib/toast";
import { OracleDrawer } from "../oracle/OracleDrawer";

export function TopBar() {
  const { currentWorkspaceId, workspaces } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];
  const [searchFocus, setSearchFocus] = useState(false);
  const [oracleOpen, setOracleOpen] = useState(false);

  // ESC to close Oracle drawer
  useEffect(() => {
    if (!oracleOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOracleOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [oracleOpen]);
  const oracleCount = useMemo(
    () =>
      scanWorkspace({
        workspace: ws,
        departments: allDepartments.filter((d) => d.workspaceId === ws.id),
        agents: allAgents.filter((a) => a.workspaceId === ws.id),
        skills: allSkills.filter((s) => s.workspaceId === ws.id),
        workflows: allWorkflows.filter((w) => w.workspaceId === ws.id),
        goals: allGoals.filter((g) => g.workspaceId === ws.id),
        connectors: allConnectorsTop,
        budgets: getBudgetsTop(ws.id),
      }).length,
    [ws]
  );

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border/60 bg-void/60 px-6 backdrop-blur-xl">
      <WorkspaceSwitcher />

      <div className="ml-2 hidden flex-1 max-w-lg items-center gap-2 rounded-lg border border-border/70 bg-elevated/50 px-3 py-1.5 text-sm text-text-muted md:flex">
        <Search size={14} className="text-text-faint" />
        <input
          placeholder="Ajan, skill veya workflow ara…"
          className="flex-1 bg-transparent outline-none placeholder:text-text-faint"
          onFocus={() => {
            if (!searchFocus) {
              setSearchFocus(true);
              toast({
                tone: "ion",
                title: "Command Palette yakında",
                description: "Cmd+K global search bir sonraki sprint'te — şimdilik Archive'dan arama yapabilirsin.",
                action: { label: "Archive'a git", href: "/library" },
              });
            }
          }}
        />
        <kbd className="inline-flex items-center gap-0.5 rounded border border-border/70 bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-faint">
          <Command size={10} />K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setOracleOpen(true)}
        >
          <Sparkles size={14} className="text-nebula" />
          <span>Oracle</span>
          {oracleCount > 0 && (
            <span className="rounded-md bg-nebula-soft px-1.5 py-0.5 font-mono text-[10px] text-nebula">
              {oracleCount}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            toast({
              tone: "nebula",
              title: "Bildirim kuyruğu",
              description: `${oracleCount} Oracle önerisi · 3 approval bekliyor · 2 audit flag. Control Room'da tüm detay.`,
              action: { label: "Control Room'a git", href: "/control" },
            })
          }
        >
          <Bell size={16} />
        </Button>
        <button
          onClick={() =>
            toast({
              tone: "ion",
              title: `${ws.name}`,
              description: `Ferhan · patron · ${workspaces.length} workspace aktif.`,
              action: { label: "Çıkış yap", href: "/api/auth/logout" },
            })
          }
          className="ml-2 h-8 w-8 rounded-full bg-gradient-to-br from-ion/80 to-nebula/60 font-mono text-xs font-semibold flex items-center justify-center text-void transition-transform hover:scale-105"
          aria-label="Profil"
        >
          FY
        </button>
      </div>

      <OracleDrawer open={oracleOpen} onClose={() => setOracleOpen(false)} />
    </header>
  );
}
