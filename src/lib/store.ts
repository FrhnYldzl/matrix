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
   * manuel yarattıklarını bırakır. Portfolio tarafındaki "sadece gerçek
   * asset'leri görmek istiyorum" ihtiyacı için.
   */
  clearDemoData: () => void;
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

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
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
  setWorkspace: (id) => set({ currentWorkspaceId: id }),
  toggleKillSwitch: () =>
    set((s) => ({ killSwitchArmed: !s.killSwitchArmed })),
  dismissApproval: (id) =>
    set((s) => {
      const next = new Set(s.dismissedApprovals);
      next.add(id);
      return { dismissedApprovals: next };
    }),
  createSkill: (item, source) =>
    set((s) => ({
      createdSkills: [...s.createdSkills, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    })),
  createAgent: (item, source) =>
    set((s) => ({
      createdAgents: [...s.createdAgents, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    })),
  createWorkflow: (item, source) =>
    set((s) => ({
      createdWorkflows: [...s.createdWorkflows, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    })),
  createDepartment: (item, source) =>
    set((s) => ({
      createdDepartments: [...s.createdDepartments, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    })),
  createGoal: (item, source) =>
    set((s) => ({
      createdGoals: [...s.createdGoals, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    })),
  createWorkspace: (item, source) =>
    set((s) => ({
      workspaces: [...s.workspaces, item.entity],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    })),
  clearDemoData: () =>
    set((s) => {
      // Sadece manual/oracle origin'li workspaces kalır — seed olanlar silinir.
      // Seed workspace'ler mock-data'dan geliyor ve store'a sadece initial
      // state'te yükleniyor; origin bilgisi yok — bu yüzden seedWorkspaces
      // listesiyle karşılaştırıyoruz.
      const seedIds = new Set(seedWorkspaces.map((w) => w.id));
      const remainingWorkspaces = s.workspaces.filter((w) => !seedIds.has(w.id));
      const remainingIds = new Set(remainingWorkspaces.map((w) => w.id));

      // Currentworkspace seed'di ise — ilk gerçek ws'e geç, o da yoksa boş bırak
      const nextCurrent = remainingIds.has(s.currentWorkspaceId)
        ? s.currentWorkspaceId
        : remainingWorkspaces[0]?.id ?? "";

      // İlişkili oluşturulan entity'leri de temizle (seed ws'e bağlı olanlar)
      const keep = <T extends { workspaceId: string }>(items: CreatedItem<T>[]) =>
        items.filter((c) => remainingIds.has(c.entity.workspaceId));

      return {
        workspaces: remainingWorkspaces,
        currentWorkspaceId: nextCurrent,
        createdSkills: keep(s.createdSkills),
        createdAgents: keep(s.createdAgents),
        createdWorkflows: keep(s.createdWorkflows),
        createdDepartments: keep(s.createdDepartments),
        createdGoals: keep(s.createdGoals),
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
