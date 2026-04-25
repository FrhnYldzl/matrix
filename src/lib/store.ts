"use client";

import { create } from "zustand";
import { workspaces as seedWorkspaces } from "./mock-data";
import type {
  Agent,
  Department,
  Goal,
  Ritual,
  Skill,
  StrategicTheme,
  ValueAnchor,
  Workflow,
  Workspace,
} from "./types";
import type { Task } from "./operator";
import type { Budget } from "./costs";
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
  // Onboarding dashboard coverage — Oracle proposal'ından gelen ekler
  createdOperatorTasks: CreatedItem<Task>[];
  createdRituals: CreatedItem<Ritual>[];
  createdBudgets: CreatedItem<Budget>[];
  /** Workspace başına bağlı connector ID'leri — TrainStation attach state.
   *  Map: workspaceId → connectorId[]. Aynı workspace bir connector'a 1 kez bağlanır. */
  attachedConnectors: Record<string, string[]>;
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
  /** Goal'un current progress'ini güncelle. Hedef tamamlandıysa
   *  goal.completed event'i tetiklenir, aksi halde goal.progressed. */
  updateGoalProgress: (goalId: string, newCurrent: number) => void;
  createOperatorTask: (item: CreatedItem<Task>, source?: string) => void;
  /** Task status değiştir (todo→doing→review→done→blocked).
   *  done'a geçince task.completed event'i fışkırır + variable bonus rulosu. */
  setTaskStatus: (taskId: string, status: Task["status"]) => void;
  createRitual: (item: CreatedItem<Ritual>, source?: string) => void;
  /** Bir ritüel tamamlandı (örn. L10 yapıldı). Streak + lastRunAt güncel,
   *  ritm tipine göre prime.program.block.done veya weekly.review.completed. */
  completeRitual: (ritualId: string) => void;
  createBudget: (item: CreatedItem<Budget>, source?: string) => void;
  /** Bir connector'ı current workspace'e bağla.
   *  Aynı connector zaten varsa no-op. Connector attach event tetiklenir (+40 XP). */
  attachConnector: (connectorId: string, workspaceId?: string) => void;
  /** Connector'ı çıkar (silent — XP geri alınmaz, sadece state update) */
  detachConnector: (connectorId: string, workspaceId?: string) => void;
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
  // Public landing + auth tasarımı: kullanıcı login eder, BOŞ portföy görür.
  // Mock seed workspaces artık otomatik yüklenmez — kullanıcı kendi
  // yarattığını veya "Demo asset yükle" butonuyla seed Newsletter'ı görür.
  // Seed mock-data hâlâ duruyor (Codex örnekleri için referans), sadece
  // store init'te kullanılmıyor.
  currentWorkspaceId: "",
  workspaces: [],
  killSwitchArmed: false,
  dismissedApprovals: new Set<string>(),
  createdSkills: [],
  createdAgents: [],
  createdWorkflows: [],
  createdDepartments: [],
  createdGoals: [],
  createdOperatorTasks: [],
  createdRituals: [],
  createdBudgets: [],
  attachedConnectors: {},
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
  updateGoalProgress: (goalId, newCurrent) => {
    const state = get();
    const item = state.createdGoals.find((c) => c.entity.id === goalId);
    if (!item) return;
    const oldCurrent = item.entity.current;
    if (oldCurrent === newCurrent) return;

    // Trajectory'i basit recompute — invert metric'lerde lower-better
    const target = item.entity.target;
    const ratio = item.entity.invert
      ? newCurrent <= target
        ? 1
        : target / Math.max(newCurrent, 1)
      : newCurrent / Math.max(target, 1);
    const trajectory: Goal["trajectory"] =
      ratio >= 1 ? "ahead" : ratio >= 0.85 ? "on-track" : ratio >= 0.5 ? "at-risk" : "off-track";

    set((s) => ({
      createdGoals: s.createdGoals.map((c) =>
        c.entity.id === goalId
          ? {
              ...c,
              entity: {
                ...c.entity,
                current: newCurrent,
                trajectory,
                history: [...(c.entity.history ?? []), newCurrent].slice(-12),
              },
            }
          : c
      ),
    }));

    // Hedef tamamlandı mı?
    const reached = item.entity.invert ? newCurrent <= target : newCurrent >= target;
    if (reached && !(item.entity.invert ? oldCurrent <= target : oldCurrent >= target)) {
      get().recordAction("goal.completed", {
        workspaceId: item.entity.workspaceId,
        meta: { goalTitle: item.entity.title, target, achieved: newCurrent },
      });
    } else {
      get().recordAction("goal.progressed", {
        workspaceId: item.entity.workspaceId,
        meta: { goalTitle: item.entity.title, from: oldCurrent, to: newCurrent },
      });
    }
  },
  createOperatorTask: (item, source) => {
    set((s) => ({
      createdOperatorTasks: [...s.createdOperatorTasks, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    }));
    get().recordAction("task.created", {
      workspaceId: item.entity.workspaceId,
      silent: source?.startsWith("oracle-onboarding:") ?? false,
      meta: { taskTitle: item.entity.title },
    });
  },
  setTaskStatus: (taskId, status) => {
    const state = get();
    const item = state.createdOperatorTasks.find((c) => c.entity.id === taskId);
    if (!item) return; // unknown task
    const oldStatus = item.entity.status;
    if (oldStatus === status) return; // no-op

    const nowIso = new Date().toISOString();
    set((s) => ({
      createdOperatorTasks: s.createdOperatorTasks.map((c) =>
        c.entity.id === taskId
          ? {
              ...c,
              entity: {
                ...c.entity,
                status,
                startedAtIso:
                  status === "doing" && !c.entity.startedAtIso
                    ? nowIso
                    : c.entity.startedAtIso,
                completedAtIso: status === "done" ? nowIso : c.entity.completedAtIso,
              },
            }
          : c
      ),
    }));

    // Dopamine — geçişe göre uygun event
    if (status === "doing" && oldStatus !== "doing") {
      get().recordAction("task.started", {
        workspaceId: item.entity.workspaceId,
        silent: true, // mikro, bildirme
        meta: { taskTitle: item.entity.title },
      });
    } else if (status === "done" && oldStatus !== "done") {
      get().recordAction("task.completed", {
        workspaceId: item.entity.workspaceId,
        meta: {
          taskTitle: item.entity.title,
          isQuickWin: item.entity.tags.includes("quick-win"),
        },
      });
    }
  },
  createRitual: (item, source) => {
    set((s) => ({
      createdRituals: [...s.createdRituals, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    }));
    // Ritual'lar agent.invoked değil — kendi event'i yok, mikro XP olarak
    // workflow.created ile aynı pattern'i kullan
    get().recordAction("workflow.created", {
      workspaceId: item.entity.workspaceId,
      silent: true, // ritual genelde batch onboarding'te
      meta: { ritualLabel: item.entity.label },
    });
  },
  completeRitual: (ritualId) => {
    const state = get();
    const item = state.createdRituals.find((c) => c.entity.id === ritualId);
    if (!item) return;
    const nowIso = new Date().toISOString();

    // Streak — son tamamlama 8 günden eskiyse reset, değilse +1
    const lastIso = item.entity.lastRunAtIso;
    const continued =
      !!lastIso && Date.now() - new Date(lastIso).getTime() < 8 * 86400000;
    const newStreak = continued ? item.entity.streak + 1 : 1;

    set((s) => ({
      createdRituals: s.createdRituals.map((c) =>
        c.entity.id === ritualId
          ? {
              ...c,
              entity: { ...c.entity, lastRunAtIso: nowIso, streak: newStreak },
            }
          : c
      ),
    }));

    // Cadence'a göre uygun XP event'i seç
    const label = item.entity.label.toLowerCase();
    if (label.includes("weekly review") || label.includes("the truth")) {
      get().recordAction("weekly.review.completed", {
        workspaceId: item.entity.workspaceId,
        meta: { label: item.entity.label, streak: newStreak },
      });
    } else if (label.includes("l10")) {
      get().recordAction("l10.meeting.completed", {
        workspaceId: item.entity.workspaceId,
        meta: { label: item.entity.label, streak: newStreak },
      });
    } else {
      get().recordAction("prime.program.block.done", {
        workspaceId: item.entity.workspaceId,
        meta: { label: item.entity.label, streak: newStreak },
      });
    }
  },
  createBudget: (item, source) => {
    set((s) => ({
      createdBudgets: [...s.createdBudgets, item],
      acceptedSuggestionSources: source
        ? [...s.acceptedSuggestionSources, source]
        : s.acceptedSuggestionSources,
    }));
    // Budget'lar oracle.suggestion.accepted gibi sayılır
    get().recordAction("oracle.suggestion.accepted", {
      workspaceId: item.entity.workspaceId,
      silent: source?.startsWith("oracle-onboarding:") ?? false,
      meta: { budgetLabel: item.entity.scopeLabel },
    });
  },
  attachConnector: (connectorId, workspaceId) => {
    const state = get();
    const wsId = workspaceId ?? state.currentWorkspaceId;
    if (!wsId) return;
    const existing = state.attachedConnectors[wsId] ?? [];
    if (existing.includes(connectorId)) return; // already attached
    set((s) => ({
      attachedConnectors: {
        ...s.attachedConnectors,
        [wsId]: [...existing, connectorId],
      },
    }));
    get().recordAction("connector.attached", {
      workspaceId: wsId,
      meta: { connectorId },
    });
  },
  detachConnector: (connectorId, workspaceId) => {
    const state = get();
    const wsId = workspaceId ?? state.currentWorkspaceId;
    if (!wsId) return;
    const existing = state.attachedConnectors[wsId] ?? [];
    if (!existing.includes(connectorId)) return; // already detached
    set((s) => ({
      attachedConnectors: {
        ...s.attachedConnectors,
        [wsId]: existing.filter((id) => id !== connectorId),
      },
    }));
    // No XP penalty — silent state change
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
      // Demo veri = (a) eski seedWorkspaces ID'lerinden geleni + (b) "Demo
      // asset yükle" butonuyla yaratılan ws-demo-* prefix'li ID'ler.
      // Manuel olarak yaratılan gerçek workspace'ler korunur.
      const seedIds = new Set(seedWorkspaces.map((w) => w.id));
      const remainingWorkspaces = s.workspaces.filter(
        (w) => !seedIds.has(w.id) && !w.id.startsWith("ws-demo-")
      );
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

      // attachedConnectors da silinen ws'lerden temizlensin
      const keptAttached: Record<string, string[]> = {};
      Object.entries(s.attachedConnectors).forEach(([wsId, ids]) => {
        if (remainingIds.has(wsId)) keptAttached[wsId] = ids;
      });

      return {
        workspaces: remainingWorkspaces,
        currentWorkspaceId: nextCurrent,
        createdSkills: keep(s.createdSkills),
        createdAgents: keep(s.createdAgents),
        createdWorkflows: keep(s.createdWorkflows),
        createdDepartments: keep(s.createdDepartments),
        createdGoals: keep(s.createdGoals),
        createdOperatorTasks: keep(s.createdOperatorTasks),
        createdRituals: keep(s.createdRituals),
        createdBudgets: keep(s.createdBudgets),
        attachedConnectors: keptAttached,
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
