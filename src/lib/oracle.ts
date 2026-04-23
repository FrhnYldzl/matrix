import type {
  Agent,
  Department,
  Goal,
  OracleKind,
  OracleSuggestion,
  Skill,
  Workflow,
  Workspace,
} from "./types";
import type { Connector } from "./connectors";
import type { Budget } from "./costs";

export type Priority = "high" | "medium" | "low";

export interface Suggestion extends OracleSuggestion {
  source: string; // which rule triggered this
  draft?: {
    filename: string;
    language: "yaml" | "markdown";
    content: string;
  };
}

export interface ScanInput {
  workspace: Workspace;
  departments: Department[];
  agents: Agent[];
  skills: Skill[];
  workflows: Workflow[];
  goals: Goal[];
  // Connector + budget awareness — optional so older callers still work
  connectors?: Connector[];
  budgets?: Budget[];
}

const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

/* --------------------------------------------------------------- */
/*  Rule 1 — GAP scan: departments/agents/skills that are missing   */
/* --------------------------------------------------------------- */

function scanGaps(input: ScanInput): Suggestion[] {
  const out: Suggestion[] = [];
  const { workspace, departments, agents, skills, workflows } = input;

  // Empty workspace
  if (departments.length === 0) {
    out.push({
      id: uid("ora-gap"),
      workspaceId: workspace.id,
      kind: "gap",
      priority: "high",
      title: "Hiç departman yok",
      rationale:
        "Bu workspace'te henüz bir departman tanımlanmadı. En az 1 departman olmadan ne ajan ne skill ne workflow eklenebilir.",
      target: "Departman ekle (örn. Operations, Sales, Exec)",
      createdAt: now(),
      source: "gap/no-departments",
    });
    return out;
  }

  // Departments without agents
  const agentsByDept = new Map<string, Agent[]>();
  agents.forEach((a) => {
    const arr = agentsByDept.get(a.departmentId) || [];
    arr.push(a);
    agentsByDept.set(a.departmentId, arr);
  });

  departments.forEach((d) => {
    const deptAgents = agentsByDept.get(d.id) || [];
    if (deptAgents.length === 0) {
      out.push({
        id: uid("ora-gap"),
        workspaceId: workspace.id,
        kind: "gap",
        priority: "medium",
        title: `${d.name} departmanında hiç ajan yok`,
        rationale: `${d.description} Sorumluluk tanımlı ama bu alanı yürütecek bir rol atanmamış.`,
        target: `Yeni ajan: ${d.name.toLowerCase()}-lead`,
        createdAt: now(),
        source: "gap/empty-department",
      });
    }
  });

  // Agents without skills
  const skillsByAgent = new Map<string, Skill[]>();
  skills.forEach((s) => {
    const arr = skillsByAgent.get(s.ownerAgentId) || [];
    arr.push(s);
    skillsByAgent.set(s.ownerAgentId, arr);
  });

  agents.forEach((a) => {
    if (a.name === "orchestrator") return; // orchestrator routes, does not own skills
    const agentSkills = skillsByAgent.get(a.id) || [];
    if (agentSkills.length === 0 && a.status !== "paused") {
      out.push({
        id: uid("ora-gap"),
        workspaceId: workspace.id,
        kind: "gap",
        priority: "medium",
        title: `${a.displayName} ajanında hiç skill yok`,
        rationale: `${a.displayName} aktif ama yapılandırılmış bir prosedürü yok — her çağrıda prompt sıfırdan kuruluyor, kalite tutarsız kalır.`,
        target: `Yeni skill (owner: ${a.name})`,
        createdAt: now(),
        source: "gap/agent-no-skills",
        draft: {
          filename: `skills/${a.name}-primary/SKILL.md`,
          language: "markdown",
          content: generateSkillDraft(a),
        },
      });
    }
  });

  // Departments without workflows
  const wfByDept = new Map<string, Workflow[]>();
  workflows.forEach((w) => {
    const arr = wfByDept.get(w.departmentId) || [];
    arr.push(w);
    wfByDept.set(w.departmentId, arr);
  });

  departments.forEach((d) => {
    const deptWfs = wfByDept.get(d.id) || [];
    const deptAgents = agentsByDept.get(d.id) || [];
    if (deptAgents.length > 0 && deptWfs.length === 0) {
      out.push({
        id: uid("ora-gap"),
        workspaceId: workspace.id,
        kind: "gap",
        priority: "low",
        title: `${d.name}'de hiç workflow yok`,
        rationale: `${d.name} departmanında ajan var ama otomatik tetiklenen bir iş akışı yok. Ritim kuramazsın — her şey manuel çağrıyla çalışır.`,
        target: `Yeni workflow: ${d.name.toLowerCase()}-weekly-review.yaml`,
        createdAt: now(),
        source: "gap/dept-no-workflow",
      });
    }
  });

  // Sales gap specific: lead-enrichment without lead-scoring
  const hasEnrichment = skills.some((s) => s.name.includes("enrichment"));
  const hasScoring = skills.some((s) => s.name.includes("scor"));
  if (hasEnrichment && !hasScoring) {
    out.push({
      id: uid("ora-gap"),
      workspaceId: workspace.id,
      kind: "gap",
      priority: "high",
      title: "lead-enrichment var ama lead-scoring yok",
      rationale:
        "Lead'ler zenginleştiriliyor ama hangisine önce dokunulacağı manuel kararla belirleniyor. Pipeline forecast doğruluğu bu yüzden düşüyor.",
      target: "Yeni skill: lead-scorer.yaml (owner: sales-assistant)",
      createdAt: now(),
      source: "gap/sales-scoring-missing",
      draft: {
        filename: "skills/lead-scorer/SKILL.md",
        language: "markdown",
        content: leadScorerDraft(),
      },
    });
  }

  return out;
}

/* --------------------------------------------------------------- */
/*  Rule 2 — STRATEGY scan: themes without agent/skill coverage    */
/* --------------------------------------------------------------- */

function scanStrategy(input: ScanInput): Suggestion[] {
  const out: Suggestion[] = [];
  const { workspace, agents, skills } = input;

  // Mission/vision missing
  if (!workspace.mission?.trim()) {
    out.push({
      id: uid("ora-strat"),
      workspaceId: workspace.id,
      kind: "strategy",
      priority: "high",
      title: "Misyon tanımlanmamış",
      rationale:
        "Misyon olmadan Oracle stratejik hiza denetimi yapamaz. En az tek cümlelik bir misyon gerekir.",
      target: "Vision & Strategy sayfasında misyonu doldur",
      createdAt: now(),
      source: "strategy/mission-empty",
    });
  }

  if (!workspace.vision?.trim()) {
    out.push({
      id: uid("ora-strat"),
      workspaceId: workspace.id,
      kind: "strategy",
      priority: "high",
      title: "Vizyon tanımlanmamış",
      rationale:
        "Vizyon olmadan 3-5 yıllık yön belirsiz — ajan önerileri miyop kalır.",
      target: "Vision & Strategy sayfasında vizyonu doldur",
      createdAt: now(),
      source: "strategy/vision-empty",
    });
  }

  // Strategic themes vs agent/skill coverage
  const themes = workspace.strategicThemes;
  if (themes.length === 0) {
    out.push({
      id: uid("ora-strat"),
      workspaceId: workspace.id,
      kind: "strategy",
      priority: "medium",
      title: "Stratejik tema yok",
      rationale:
        "Temalar olmadan Oracle 'şu ajan şu temaya hizmet ediyor' bağını kuramaz. 2-4 tema önerilir.",
      target: "Vision sayfasında en az 2 tema ekle",
      createdAt: now(),
      source: "strategy/no-themes",
    });
    return out;
  }

  const allText = [
    ...agents.map((a) => `${a.displayName} ${a.description}`),
    ...skills.map((s) => `${s.displayName} ${s.description}`),
  ]
    .join(" | ")
    .toLowerCase();

  themes.forEach((t) => {
    // derive 1-2 root words from the theme label
    const words = t.label
      .toLowerCase()
      .split(/[^a-zçğıöşüA-ZÇĞİÖŞÜ]+/)
      .filter((w) => w.length > 4);
    const matched = words.some((w) => allText.includes(w));
    if (!matched) {
      const priority: Priority =
        t.weight >= 80 ? "high" : t.weight >= 60 ? "medium" : "low";
      out.push({
        id: uid("ora-strat"),
        workspaceId: workspace.id,
        kind: "strategy",
        priority,
        title: `"${t.label}" teması hiçbir ajan/skill'de karşılık bulmuyor`,
        rationale: `Bu tema için ağırlık %${t.weight} ve yine de mevcut organizasyonda ona hizmet eden bir rol yok. ${
          t.description ? `(${t.description})` : ""
        }`,
        target: `Tema için yeni bir ajan veya skill öner`,
        createdAt: now(),
        source: "strategy/theme-uncovered",
      });
    }
  });

  // Unlinked goals — a goal with no agent, skill, or theme attached
  // Blueprint-installed OKRs trigger this by design so Matrix nudges you to wire them.
  input.goals.forEach((g) => {
    const empty =
      (g.linkedAgentIds || []).length === 0 &&
      (g.linkedSkillIds || []).length === 0 &&
      (g.linkedThemeIds || []).length === 0;
    if (empty) {
      out.push({
        id: uid("ora-strat"),
        workspaceId: workspace.id,
        kind: "strategy",
        priority: "high",
        title: `"${g.title}" hedefi hiçbir şeye bağlı değil`,
        rationale: `Bu hedef için ne bir ajan, ne bir skill, ne de stratejik tema bağlanmış. Yörüngesi hesaplansa bile "sapma nedeni" açıklanamaz. Blueprint kurulumundan hemen sonra görülmesi normal — şimdi bağlama vakti.`,
        target: "Goals & Orbits'te hedefin bağlantı panelini aç",
        createdAt: now(),
        source: "strategy/goal-unlinked",
      });
    }
  });

  return out;
}

/* --------------------------------------------------------------- */
/*  Rule 3 — OPS scan: paused agents, broken golden tests, etc.    */
/* --------------------------------------------------------------- */

function scanOps(input: ScanInput): Suggestion[] {
  const out: Suggestion[] = [];
  const { workspace, agents, skills, workflows } = input;

  // Paused agents
  agents.forEach((a) => {
    if (a.status === "paused") {
      out.push({
        id: uid("ora-ops"),
        workspaceId: workspace.id,
        kind: "ops",
        priority: "low",
        title: `${a.displayName} duraklatıldı`,
        rationale: `Bu ajan şu an pasif. Geri açılacaksa: sebebi loglanmalı; açılmayacaksa kaldırılmalı — zombie ajanlar yetki/audit karmaşası yaratır.`,
        target: `Karar: yeniden başlat / arşivle`,
        createdAt: now(),
        source: "ops/paused-agent",
      });
    }
  });

  // Golden test failing
  skills.forEach((s) => {
    if (!s.goldenTestPassing) {
      out.push({
        id: uid("ora-ops"),
        workspaceId: workspace.id,
        kind: "ops",
        priority: "high",
        title: `${s.displayName} golden testi kırık`,
        rationale: `Son çıktı referans test'ten %5'in üzerinde sapıyor. Üretim tetiklemelerini duraklat veya skill'i güncelle.`,
        target: `Golden output'u güncelle veya skill'i quarantine'e al`,
        createdAt: now(),
        source: "ops/golden-failing",
      });
    }
  });

  // Workflows failing
  workflows.forEach((w) => {
    if (w.lastStatus === "failed") {
      out.push({
        id: uid("ora-ops"),
        workspaceId: workspace.id,
        kind: "ops",
        priority: "high",
        title: `${w.name} workflow son çalıştırmada başarısız`,
        rationale: "Zincirin bir adımı kırıldı. Logları incele ve kök nedeni tespit et.",
        target: "Workflow Canvas'ta dry-run ile adımı izole et",
        createdAt: now(),
        source: "ops/wf-failed",
      });
    }
  });

  // Retro workflow missing (hint)
  const hasRetro = workflows.some((w) =>
    /retro|retrospective|review/i.test(w.name)
  );
  const hasRoundup = workflows.some((w) => /roundup|status/i.test(w.name));
  if (hasRoundup && !hasRetro) {
    out.push({
      id: uid("ora-ops"),
      workspaceId: workspace.id,
      kind: "ops",
      priority: "medium",
      title: "Sprint roundup var ama retrospektif yok",
      rationale:
        "Durum raporu çekiliyor ama tekrar eden hata desenlerini görecek bir retro ritüeli yok. İyileşme döngüsü kapanmıyor.",
      target: "Yeni workflow: weekly-retro.yaml",
      createdAt: now(),
      source: "ops/retro-missing",
      draft: {
        filename: "workflows/weekly-retro.yaml",
        language: "yaml",
        content: retroWorkflowDraft(),
      },
    });
  }

  return out;
}

/* --------------------------------------------------------------- */
/*  Rule 4 — RISK scan: scopes, success rates, off-track goals     */
/* --------------------------------------------------------------- */

function scanRisks(input: ScanInput): Suggestion[] {
  const out: Suggestion[] = [];
  const { workspace, agents, goals } = input;

  // Low success rate agents
  agents.forEach((a) => {
    if (a.callsToday > 0 && a.successRate < 0.85) {
      out.push({
        id: uid("ora-risk"),
        workspaceId: workspace.id,
        kind: "risk",
        priority: a.successRate < 0.7 ? "high" : "medium",
        title: `${a.displayName} başarı oranı %${Math.round(a.successRate * 100)}`,
        rationale: `Bu ajan için hedef: en az %90. Prompt regresyon veya input kalitesi problemi olabilir. Golden test kontrolü önerilir.`,
        target: "AGENT.md prompt'unu gözden geçir veya skill'lerini iyileştir",
        createdAt: now(),
        source: "risk/low-success",
      });
    }
  });

  // External-send scope reminder
  const externalAgents = agents.filter((a) => a.scopes.includes("external-send"));
  if (externalAgents.length > 0) {
    out.push({
      id: uid("ora-risk"),
      workspaceId: workspace.id,
      kind: "risk",
      priority: "medium",
      title: `${externalAgents.length} ajanda external-send scope'u aktif`,
      rationale: `${externalAgents
        .map((a) => a.displayName)
        .join(
          ", "
        )} dışarıya mesaj/para/emir gönderebilir. Her dönem izin matrisini yeniden onayla; insan onayı adımının hâlâ zorunlu olduğunu doğrula.`,
      target: "Scope audit: Control Room → İzin matrisi",
      createdAt: now(),
      source: "risk/external-send",
    });
  }

  // Brand-new external-send agents (zero runs yet) — extra caution post-install
  const virginExternalAgents = externalAgents.filter((a) => a.callsToday === 0);
  if (virginExternalAgents.length > 0) {
    out.push({
      id: uid("ora-risk"),
      workspaceId: workspace.id,
      kind: "risk",
      priority: "high",
      title: `${virginExternalAgents.length} yeni external-send ajan daha hiç çalışmadı`,
      rationale: `${virginExternalAgents
        .map((a) => a.displayName)
        .join(
          ", "
        )} aktif canlıya alınmadan önce golden test + paper-run yapılmalı. external-send scope'u olan ajanlar için ilk gerçek tetikleme daima insan onayından geçmeli — bunu Control Room'dan denetle.`,
      target: "Paper-mod dry-run: bu ajanları 1 hafta 'silent' modda çalıştır",
      createdAt: now(),
      source: "risk/new-external-untested",
    });
  }

  // Off-track goals
  goals.forEach((g) => {
    if (g.trajectory === "off-track" || g.trajectory === "at-risk") {
      out.push({
        id: uid("ora-risk"),
        workspaceId: workspace.id,
        kind: "risk",
        priority: g.trajectory === "off-track" ? "high" : "medium",
        title: `Hedef yörüngeden ${g.trajectory === "off-track" ? "saptı" : "risk altında"}: "${g.title}"`,
        rationale: `Mevcut: ${g.current}${g.unit === "%" ? "%" : ` ${g.unit}`} · Hedef: ${g.target}${
          g.unit === "%" ? "%" : ` ${g.unit}`
        }. Bu hedefe bağlı ${g.linkedAgentIds.length} ajan + ${g.linkedSkillIds.length} skill etkileniyor.`,
        target: "Hedef kurtarma planı: Goals & Orbits",
        createdAt: now(),
        source: "risk/goal-off",
      });
    }
  });

  return out;
}

/* --------------------------------------------------------------- */
/*  Rule 5 — CONNECTOR health                                      */
/*     (TrainStation-aware: rate-limit, needs-auth, error, stale)   */
/* --------------------------------------------------------------- */

function scanConnectors(input: ScanInput): Suggestion[] {
  const out: Suggestion[] = [];
  const { workspace, connectors } = input;
  if (!connectors || connectors.length === 0) return out;

  // Rate-limited connectors
  connectors.forEach((c) => {
    if (c.status === "rate-limited" || (c.rateLimitUsed && c.rateLimitUsed >= 85)) {
      out.push({
        id: uid("ora-con"),
        workspaceId: workspace.id,
        kind: "ops",
        priority: c.rateLimitUsed && c.rateLimitUsed >= 95 ? "high" : "medium",
        title: `${c.name} rate-limit %${c.rateLimitUsed ?? 95}+`,
        rationale: `Bu connector rate limitine yakın. Bağlı ${
          (c.usedBySkillNames?.length || 0) + (c.usedByWorkflowNames?.length || 0)
        } skill/workflow bu saatte duraksayabilir. Tier yükseltme veya caching ekleme zamanı.`,
        target: `TrainStation → ${c.name} drawer · tier arttır veya cache ekle`,
        createdAt: now(),
        source: "ops/connector-rate-limit",
      });
    }
  });

  // Connectors with error state
  connectors.forEach((c) => {
    if (c.status === "error" || c.errorRate >= 0.1) {
      out.push({
        id: uid("ora-con"),
        workspaceId: workspace.id,
        kind: "risk",
        priority: "high",
        title: `${c.name} hata durumunda${c.errorRate > 0.1 ? ` (error rate %${(c.errorRate * 100).toFixed(1)})` : ""}`,
        rationale: `Connector son kalibrasyondan beri başarısız dönüyor. Bu durum ${
          (c.usedByWorkflowNames?.length || 0)
        } workflow'u ve ${(c.usedBySkillNames?.length || 0)} skill'i etkiliyor — yedek rota veya quarantine gerekli.`,
        target: `TrainStation → ${c.name} · yeniden bağla veya fallback connector'a geç`,
        createdAt: now(),
        source: "risk/connector-error",
      });
    }
  });

  // Connector that a skill/workflow needs but still in needs-auth
  connectors.forEach((c) => {
    if (c.status !== "needs-auth") return;
    const usersCount =
      (c.usedBySkillNames?.length || 0) + (c.usedByWorkflowNames?.length || 0);
    if (usersCount > 0) {
      out.push({
        id: uid("ora-con"),
        workspaceId: workspace.id,
        kind: "gap",
        priority: "high",
        title: `${c.name} yetkilendirilmemiş — ${usersCount} bağlı varlık bloke`,
        rationale: `${
          [
            ...(c.usedBySkillNames || []),
            ...(c.usedByWorkflowNames || []),
          ].slice(0, 3).join(", ")
        }${usersCount > 3 ? ` + ${usersCount - 3} diğer` : ""} bu connector'a bağlı ama OAuth/API key henüz girilmemiş. Dry-run bile çalışmaz.`,
        target: `TrainStation → ${c.name} · yetkilendir`,
        createdAt: now(),
        source: "gap/connector-needs-auth",
      });
    }
  });

  // Orphan connectors — connected but nobody uses them
  connectors.forEach((c) => {
    if (c.status !== "connected") return;
    const usersCount =
      (c.usedBySkillNames?.length || 0) + (c.usedByWorkflowNames?.length || 0);
    if (usersCount === 0 && c.pricing.unit === "per-month" && (c.pricing.amountUsd || 0) > 0) {
      out.push({
        id: uid("ora-con"),
        workspaceId: workspace.id,
        kind: "ops",
        priority: "low",
        title: `${c.name} bağlı ama kullanılmıyor · $${c.pricing.amountUsd}/ay israf`,
        rationale: `Bu connector aylık sabit ücret ödüyor ama hiçbir skill veya workflow onu kullanmıyor. Sıfıra inmesi için ya bir skill'e bağla ya aboneliği düşür.`,
        target: `Connector'u kaldır veya yeni bir skill'e bağla`,
        createdAt: now(),
        source: "ops/orphan-connector",
      });
    }
  });

  return out;
}

/* --------------------------------------------------------------- */
/*  Rule 6 — BUDGET pressure                                       */
/* --------------------------------------------------------------- */

function scanBudgets(input: ScanInput): Suggestion[] {
  const out: Suggestion[] = [];
  const { workspace, budgets } = input;
  if (!budgets || budgets.length === 0) return out;

  budgets.forEach((b) => {
    const pct = b.capUsd > 0 ? (b.spentUsd / b.capUsd) * 100 : 0;
    if (pct >= 100) {
      out.push({
        id: uid("ora-bud"),
        workspaceId: workspace.id,
        kind: "risk",
        priority: "high",
        title: `${b.scopeLabel} bütçesi aştı · %${Math.round(pct)}`,
        rationale: `Bu periyodda tanımlı $${b.capUsd} limit $${b.spentUsd.toFixed(
          2
        )}'e ulaştı. external-send kapsamı bu scope altında onay kuyruğuna düşer. Ya limiti yükselt ya harcamayı duraklat.`,
        target: `The Tribute → "${b.scopeLabel}" bütçe kartından kararı ver`,
        createdAt: now(),
        source: "risk/budget-over",
      });
    } else if (pct >= b.warnThresholdPct) {
      out.push({
        id: uid("ora-bud"),
        workspaceId: workspace.id,
        kind: "ops",
        priority: "medium",
        title: `${b.scopeLabel} bütçesinin %${Math.round(pct)}'i kullanıldı`,
        rationale: `Uyarı eşiği (%${b.warnThresholdPct}) aşıldı. ${b.period} sonuna kadar takipte kal; limit aşılırsa external-send aksiyonları onaya düşer.`,
        target: `Bütçe cap'ini revize et veya connector tier'ını düşür`,
        createdAt: now(),
        source: "ops/budget-warn",
      });
    }
  });

  return out;
}

/* --------------------------------------------------------------- */
/*  Main entry point                                                */
/* --------------------------------------------------------------- */

const kindOrder: OracleKind[] = ["risk", "gap", "strategy", "ops"];
const prioOrder: Priority[] = ["high", "medium", "low"];

export function scanWorkspace(input: ScanInput): Suggestion[] {
  const all = [
    ...scanRisks(input),
    ...scanGaps(input),
    ...scanStrategy(input),
    ...scanOps(input),
    ...scanConnectors(input),
    ...scanBudgets(input),
  ];

  all.sort((a, b) => {
    const p = prioOrder.indexOf(a.priority) - prioOrder.indexOf(b.priority);
    if (p !== 0) return p;
    return kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind);
  });

  return all;
}

export function summarize(suggestions: Suggestion[]) {
  const byKind: Record<OracleKind, number> = { gap: 0, strategy: 0, ops: 0, risk: 0 };
  const byPrio: Record<Priority, number> = { high: 0, medium: 0, low: 0 };
  suggestions.forEach((s) => {
    byKind[s.kind] = (byKind[s.kind] || 0) + 1;
    byPrio[s.priority] = (byPrio[s.priority] || 0) + 1;
  });
  return { total: suggestions.length, byKind, byPrio };
}

/* --------------------------------------------------------------- */
/*  Draft generators (tiny templates)                               */
/* --------------------------------------------------------------- */

function generateSkillDraft(a: Agent): string {
  return [
    "---",
    `id: ${a.name}-primary`,
    `name: "${a.displayName} · Primary"`,
    `owner_agent: ${a.name}`,
    "triggers:",
    `  - "${a.displayName.toLowerCase()} ilk temas"`,
    "inputs: []",
    "outputs: []",
    "---",
    "",
    `# Skill: ${a.displayName} Primary`,
    "",
    "## Amaç",
    `${a.displayName}'in temel prosedürü.`,
    "",
    "## Adımlar",
    "1. …",
    "2. …",
    "",
    "## Çıktı şablonu",
    "…",
    "",
    "## Değerlendirme kriteri",
    "…",
  ].join("\n");
}

function leadScorerDraft(): string {
  return [
    "---",
    "id: lead-scorer",
    'name: "Lead Scorer"',
    "owner_agent: sales-assistant",
    "triggers:",
    '  - "lead skorla"',
    '  - "hangi lead önce"',
    "inputs: [lead_profile, enriched_data]",
    "outputs: [score, reasoning, next_action]",
    "---",
    "",
    "# Skill: Lead Scorer",
    "",
    "## Amaç",
    "Zenginleştirilmiş lead'leri 1-100 aralığında skorlar; hangisine önce dokunulacağını belirtir.",
    "",
    "## Adımlar",
    "1. ICP (Ideal Customer Profile) eşleşmesi hesapla",
    "2. Firma büyüklüğü / sektör / role değerlendir",
    "3. Geçmiş davranış sinyalleri (web ziyaret, download) varsa ekle",
    "4. 1-100 skor + gerekçe üret",
    "",
    "## Çıktı şablonu",
    "- score: number",
    "- reasoning: string (3-4 cümle)",
    "- suggested_next_action: string",
    "",
    "## Değerlendirme kriteri",
    "Manuel skorla korelasyon > 0.75 olmalı.",
  ].join("\n");
}

function retroWorkflowDraft(): string {
  return [
    "id: weekly-retro",
    "trigger:",
    "  type: schedule",
    '  cron: "0 17 * * 5"',
    '  timezone: "Europe/Istanbul"',
    "steps:",
    "  - id: fetch-errors",
    "    action: call_skill",
    "    skill: collect-last-week-errors",
    "  - id: cluster",
    "    action: run_skill",
    "    skill: error-pattern-clustering",
    '    inputs: { errors: "{{ steps.fetch-errors.output }}" }',
    "  - id: deliver",
    "    action: post_slack",
    '    channel: "#ops-retro"',
    '    message: "{{ steps.cluster.output.summary }}"',
  ].join("\n");
}
