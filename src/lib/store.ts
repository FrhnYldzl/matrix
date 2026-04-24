"use client";

import { create } from "zustand";
import { workspaces as seedWorkspaces } from "./mock-data";
import type {
  Agent,
  Department,
  Goal,
  Skill,
  StrategicTheme,
  ValueAnchor,
  Workflow,
  Workspace,
} from "./types";
import {
  CELEBRATION_MAP,
  detectRankUp,
  makeEvent,
  totalXp,
  type DopamineEvent,
  type DopamineEventKind,
} from "./dopamine";
import { toast } from "./toast";

export type CreationOrigin = "oracle" | "catalog" | "import" | "manual";

export interface CreatedItem<T> {
  entity: T;
  origin: CreationOrigin;
  createdAt: string; // ISO
  file?: { path: string; language: "markdown" | "yaml" | "json"; content: string };
}

interface WorkspaceState {
  currentWorkspaceId: string;
  workspaces: Workspace[];
  killSwitchArmed: boolean;
  dismissedApprovals: Set<string>;
  // creations -- local additions beyond the seed mock data
  createdSkills: CreatedItem<Skill>[];
  createdAgents: CreatedItem<Agent>[];
  createdWorkflows: CreatedItem<Workflow>[];
  createdDepartments: CreatedItem<Department>[];
  createdGoals: CreatedItem<Goal>[];
  acceptedSuggestionSources: string[]; // Oracle "learning" signal
  // Dopamine — event-driven XP stream
  dopamineEvents: DopamineEvent[];
  setWorkspace: (id: string) => void;
  updateWorkspace: (id: string, patch: Partial<Workspace>) => void;
  toggleKillSwitch: () => void;
  dismissApproval: (id: string) => void;
  createSkill: (item: CreatedItem<Skill>, source?: string) => void;
  createAgent: (item: CreatedItem<Agent>, source?: string) => void;
  createWorkflow: (item: CreatedItem<Workflow>, source?: string) => void;
  createDepartment: (item: CreatedItem<Department>, source?: string) => void;
  createGoal: (item: CreatedItem<Goal>, source?: string) => void;
  createWorkspace: (item: CreatedItem<Workspace>, source?: string) => void;
  /**
   * Seed/demo workspaces'i (mock-data'dan gelen) siler — sadece Ferhan'ın
   * manuel yarattıklarını bırakır.
   */
  clearDemoData: () => void;
  /**
   * Dopamine kaydı — herhangi bir UI aksiyonu bunu çağırır. XP eklenir,
   * rank-up tetiklenirse macro-celebration basılır, aksi halde micro-toast.
   *
   * opts.silent=true → event kaydolur ama toast gösterilmez (sessiz batch
   * işlemlerde kullan — örn. onboarding'te 5 agent yaratırken).
   */
  recordAction: (
    kind: DopamineEventKind,
    opts?: {
      workspaceId?: string;
      silent?: boolean;
      forceBonus?: boolean;
      meta?: Record<string, string | number | boolean>;
    }
  ) => void;
  addStrategicTheme: (workspaceId: string, theme: StrategicTheme) => void;
  updateStrategicTheme: (
    workspaceId: string,
    themeId: string,
    patch: Partial<StrategicTheme>
  ) => void;
  removeStrategicTheme: (workspaceId: string, themeId: string) => void;
  addValueAnchor: (workspaceId: string, anchor: ValueAnchor) => void;
  updateValueAnchor: (
    workspaceId: string,
    anchorId: string,
    patch: Partial<ValueAnchor>
  ) => void;
  removeValueAnchor: (workspaceId: string, anchorId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentWorkspaceId: seedWorkspaces[0].id,
  workspaces: seedWorkspaces,
  killSwitchArmed: false,
  dismissedApprovals: new Set<string>(),
  createdSkills: [],
  createdAgents: [],
  createdWorkflows: [],
  createdDepartments: [],
  createdGoals: [],
  acceptedSuggestionSources: [],
  dopamineEvents: [],
  setWorkspace: (id) => set({ currentWorkspaceId: id }),
  toggleKillSwitch: () =>
    set((s) => ({ killSwitchArmed: !s.killSwitchArmed })),
  dismissApproval: (id) =>
    set((s) => {
      const next = new Set(s.dismissedApprovals);
      next.add(id);
      return { dismissedApprovals: next };
    }),
  recordAction: (kind, opts) => {
    const state = get();
    const before = totalXp(state.dopamineEvents);
    const event = makeEvent(kind, {
      workspaceId: opts?.workspaceId ?? state.currentWorkspaceId,
      forceBonus: opts?.forceBonus,
      meta: opts?.meta,
    });
    const after = before + event.xp + (event.bonus ?? 0);
    set({ dopamineEvents: [...state.dopamineEvents, event] });

    // Silent mode — sadece event kaydedilir, toast yok
    if (opts?.silent) return;

    // Rank-up macro-celebration — her şeyin üstünde
    const rankUp = detectRankUp(before, after);
    if (rankUp) {
      toast({
        tone: rankUp.tone === "crimson" ? "crimson" : rankUp.tone,
        title: `🎖️ Rank up · ${rankUp.label}`,
        description: `"${rankUp.matrixQuote}" — ${rankUp.speaker}`,
        ttlMs: 8000,
      });
      return; // rank-up celebrate oldu, micro'yu atla
    }

    // Event-specific celebration profili
    const profile = CELEBRATION_MAP[kind];
    if (!profile) return; // mapped değilse sessiz XP
    const total = event.xp + (event.bonus ?? 0);
    toast({
      tone: profile.tone,
      title: profile.titleFor(event.xp, event.bonus ?? 0),
      description: profile.quote
        ? `"${profile.quote.line}" — ${profile.quote.speaker}`
        : profile.description,
      ttlMs: profile.intensity === "macro" ? 6000 : profile.intensity === "mid" ? 4500 : 2500,
    });
    // Variable reward bonus hit — extra micro-toast (Skinner box)
    if (event.bonus && event.bonus > 0 && profile.intensity !== "macro") {
      // bonus zaten title'da gösterildi — ek log sadece analiz
      void total;
    }
  },
  createSkill: (item, source) => {
    set((s) => ({
      createdSkills: [...s.createdSkills, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    }));
    get().recordAction("skill.created", {
      workspaceId: item.entity.workspaceId,
      silent: source?.startsWith("oracle-onboarding:") ?? false,
      meta: { skillName: item.entity.name },
    });
  },
  createAgent: (item, source) => {
    set((s) => ({
      createdAgents: [...s.createdAgents, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    }));
    get().recordAction("agent.created", {
      workspaceId: item.entity.workspaceId,
      silent: source?.startsWith("oracle-onboarding:") ?? false,
      meta: { agentName: item.entity.name },
    });
  },
  createWorkflow: (item, source) => {
    set((s) => ({
      createdWorkflows: [...s.createdWorkflows, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    }));
    get().recordAction("workflow.created", {
      workspaceId: item.entity.workspaceId,
      silent: source?.startsWith("oracle-onboarding:") ?? false,
      meta: { workflowName: item.entity.name },
    });
  },
  createDepartment: (item, source) => {
    set((s) => ({
      createdDepartments: [...s.createdDepartments, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    }));
    get().recordAction("department.created", {
      workspaceId: item.entity.workspaceId,
      silent: source?.startsWith("oracle-onboarding:") ?? false,
      meta: { deptName: item.entity.name },
    });
  },
  createGoal: (item, source) => {
    set((s) => ({
      createdGoals: [...s.createdGoals, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    }));
    get().recordAction("goal.created", {
      workspaceId: item.entity.workspaceId,
      silent: source?.startsWith("oracle-onboarding:") ?? false,
      meta: { goalTitle: item.entity.title },
    });
  },
  createWorkspace: (item, source) => {
    set((s) => ({
      workspaces: [...s.workspaces, item.entity],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    }));
    // Workspace create → Big XP. Own toast kalır (gamification mesajı),
    // dopamine silent olarak akar ki double-toast olmasın.
    get().recordAction("workspace.created", {
      workspaceId: item.entity.id,
      silent: true,
      meta: { name: item.entity.name },
    });
  },
  clearDemoData: () =>
    set((s) => {
      const seedIds = new Set(seedWorkspaces.map((w) => w.id));
      const remainingWorkspaces = s.workspaces.filter((w) => !seedIds.has(w.id));
      const remainingIds = new Set(remainingWorkspaces.map((w) => w.id));

      const nextCurrent = remainingIds.has(s.currentWorkspaceId)
        ? s.currentWorkspaceId
        : remainingWorkspaces[0]?.id ?? "";

      const keep = <T extends { workspaceId: string }>(items: CreatedItem<T>[]) =>
        items.filter((c) => remainingIds.has(c.entity.workspaceId));

      // Dopamine events — sadece gerçek ws'ler için olanları tut
      const keptEvents = s.dopamineEvents.filter(
        (e) => !e.workspaceId || remainingIds.has(e.workspaceId)
      );

      return {
        workspaces: remainingWorkspaces,
        currentWorkspaceId: nextCurrent,
        createdSkills: keep(s.createdSkills),
        createdAgents: keep(s.createdAgents),
        createdWorkflows: keep(s.createdWorkflows),
        createdDepartments: keep(s.createdDepartments),
        createdGoals: keep(s.createdGoals),
        dopamineEvents: keptEvents,
      };
    }),
  updateWorkspace: (id, patch) =>
    set((s) => ({
      workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    })),
  addStrategicTheme: (workspaceId, theme) =>
    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === workspaceId
          ? { ...w, strategicThemes: [...w.strategicThemes, theme] }
          : w
      ),
    })),
  updateStrategicTheme: (workspaceId, themeId, patch) =>
    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === workspaceId
          ? {
              ...w,
              strategicThemes: w.strategicThemes.map((t) =>
                t.id === themeId ? { ...t, ...patch } : t
              ),
            }
          : w
      ),
    })),
  removeStrategicTheme: (workspaceId, themeId) =>
    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === workspaceId
          ? { ...w, strategicThemes: w.strategicThemes.filter((t) => t.id !== themeId) }
          : w
      ),
    })),
  addValueAnchor: (workspaceId, anchor) =>
    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === workspaceId ? { ...w, valueAnchors: [...w.valueAnchors, anchor] } : w
      ),
    })),
  updateValueAnchor: (workspaceId, anchorId, patch) =>
    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === workspaceId
          ? {
              ...w,
              valueAnchors: w.valueAnchors.map((a) =>
                a.id === anchorId ? { ...a, ...patch } : a
              ),
            }
          : w
      ),
    })),
  removeValueAnchor: (workspaceId, anchorId) =>
    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === workspaceId
          ? { ...w, valueAnchors: w.valueAnchors.filter((a) => a.id !== anchorId) }
          : w
      ),
    })),
}));
