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
