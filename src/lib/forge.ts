/**
 * Oracle Forge — Matrix's in-house formulation engine.
 *
 * Knows the canonical structure of Claude Agent SDK Skills, Agents and Workflows.
 * Takes a minimal "intent" (what + who + why) and produces a production-grade
 * file (SKILL.md / AGENT.md / .yaml) that drops straight into the Library.
 *
 * Template-first; Claude API swap-in possible later.
 */

import type { Agent, Skill, Workflow } from "./types";

// -----------------------------------------------------------------------------
// Skill forge
// -----------------------------------------------------------------------------

export interface SkillIntent {
  name: string; // "lead-scorer"
  displayName: string; // "Lead Scorer"
  ownerAgentId: string;
  ownerAgentName: string;
  purpose: string; // one-sentence purpose
  triggers: string[];
  inputs?: string[];
  outputs?: string[];
  category?: "research" | "synthesis" | "action" | "analysis" | "notification";
}

export interface ForgedSkill {
  skill: Skill;
  markdown: string;
  relativePath: string;
}

export function forgeSkill(intent: SkillIntent, workspaceId: string): ForgedSkill {
  const id = `skill-${intent.name}-${Math.random().toString(36).slice(2, 7)}`;
  const skill: Skill = {
    id,
    workspaceId,
    ownerAgentId: intent.ownerAgentId,
    name: intent.name,
    displayName: intent.displayName,
    triggers: intent.triggers.length
      ? intent.triggers
      : [intent.displayName.toLowerCase(), `${intent.name} çalıştır`],
    description: intent.purpose,
    runsThisWeek: 0,
    goldenTestPassing: true,
  };

  const md = [
    "---",
    `id: ${intent.name}`,
    `name: "${intent.displayName}"`,
    `owner_agent: ${intent.ownerAgentName}`,
    "triggers:",
    ...skill.triggers.map((t) => `  - "${t}"`),
    `inputs: [${(intent.inputs || []).join(", ")}]`,
    `outputs: [${(intent.outputs || []).join(", ")}]`,
    `category: ${intent.category || "action"}`,
    "---",
    "",
    `# Skill: ${intent.displayName}`,
    "",
    "## Amaç",
    intent.purpose,
    "",
    "## Girdi",
    ...(intent.inputs && intent.inputs.length
      ? intent.inputs.map((i) => `- \`${i}\` — açıklama girilmedi`)
      : ["- (girdi tanımlı değil — eklenmeli)"]),
    "",
    "## Adımlar",
    "1. Girdileri doğrula ve eksik alan varsa kullanıcıdan iste",
    "2. İlgili MCP connector'ları çağır (Slack, Notion, vs.)",
    "3. Sonucu yapılandırılmış şekilde döndür",
    "4. Audit log'a trace ID ile yaz",
    "",
    "## Çıktı şablonu",
    "```",
    ...(intent.outputs && intent.outputs.length
      ? intent.outputs.map((o) => `${o}: <değer>`)
      : ["result: <değer>", "reasoning: <3-4 cümle>", "confidence: 0-1"]),
    "```",
    "",
    "## Hata senaryoları",
    "- Girdi eksik veya geçersiz → kullanıcıdan iste, başarısız sonuç döndür",
    "- Harici API hatası → 1 kez yeniden dene, sonra kullanıcıya bildir",
    "- Scope ihlali (external-send) → insan onay kuyruğuna düşür",
    "",
    "## Değerlendirme kriteri",
    "- Manuel insan sonucu ile ≥ %85 korelasyon",
    "- Ortalama yanıt süresi < 10s",
    "- 30 günde golden test kırılma sayısı ≤ 1",
  ].join("\n");

  return {
    skill,
    markdown: md,
    relativePath: `skills/${intent.name}/SKILL.md`,
  };
}

// -----------------------------------------------------------------------------
// Agent forge
// -----------------------------------------------------------------------------

export interface AgentIntent {
  name: string;
  displayName: string;
  departmentId: string;
  purpose: string;
  model?: "opus" | "sonnet" | "haiku";
  scopes?: Array<"read" | "write" | "external-send">;
  mcpTools?: string[];
}

export interface ForgedAgent {
  agent: Agent;
  markdown: string;
  relativePath: string;
}

export function forgeAgent(intent: AgentIntent, workspaceId: string): ForgedAgent {
  const id = `agent-${intent.name}-${Math.random().toString(36).slice(2, 7)}`;
  const agent: Agent = {
    id,
    workspaceId,
    departmentId: intent.departmentId,
    name: intent.name,
    displayName: intent.displayName,
    description: intent.purpose,
    model: intent.model || "sonnet",
    status: "idle",
    scopes: intent.scopes || ["read", "write"],
    skillIds: [],
    callsToday: 0,
    successRate: 1,
  };

  const tools = [
    "Read",
    "Bash",
    "WebSearch",
    "WebFetch",
    ...(intent.mcpTools || ["mcp__slack__send_message", "mcp__notion__create_page"]),
  ];

  const md = [
    "---",
    `name: ${intent.name}`,
    `description: ${intent.purpose}`,
    `model: ${agent.model}`,
    `tools: ${tools.join(", ")}`,
    `scopes: [${agent.scopes.join(", ")}]`,
    "---",
    "",
    `# ${intent.displayName}`,
    "",
    "## Rol",
    intent.purpose,
    "",
    "## Delegasyon Kuralları",
    "- Ana agent (`orchestrator`) tarafından Task aracıyla tetiklenir.",
    "- Görevi al → plan oluştur → skill'leri sırayla çağır → sonuç döndür.",
    "- Diğer domain ajanlarına doğrudan delege ETMEZ; orchestrator'a geri dönüş yapar.",
    "",
    "## Skill'ler",
    "(Bu ajan için skill'ler Library'de tanımlanacak)",
    "",
    "## Scope Politikası",
    ...agent.scopes.map((s) =>
      s === "external-send"
        ? "- `external-send`: her zaman insan onay kuyruğuna düşer"
        : s === "write"
        ? "- `write`: dahili sistem yazma (Notion, Linear, Dosya) — otomatik"
        : "- `read`: tüm bağlı MCP'lerden okuma — otomatik"
    ),
    "",
    "## Hafıza",
    "Son 30 günün karar log'u `memory/` klasöründe (repoya commit edilmez).",
    "Haftada bir `consolidate-memory` skill'i log'u özete indirger.",
    "",
    "## Başarı Kriteri",
    "- Başarı oranı ≥ %90",
    "- Her çağrı audit log'una trace ID ile düşmeli",
    "- external-send kapsamındaki hiçbir aksiyon insan onayından önce gönderilmez",
  ].join("\n");

  return {
    agent,
    markdown: md,
    relativePath: `agents/${intent.name}/AGENT.md`,
  };
}

// -----------------------------------------------------------------------------
// Workflow forge
// -----------------------------------------------------------------------------

export type WorkflowTriggerKind = "schedule" | "webhook" | "manual";

export interface WorkflowIntent {
  name: string; // "weekly-retro"
  departmentId: string;
  purpose: string;
  triggerKind: WorkflowTriggerKind;
  cron?: string; // e.g. "0 17 * * 5"
  timezone?: string;
  webhookPath?: string;
  skillCalls?: string[]; // e.g. ["collect-last-week-errors", "error-pattern-clustering"]
  notify?: { channel: "slack" | "notion" | "email"; target: string } | null;
}

export interface ForgedWorkflow {
  workflow: Workflow;
  yaml: string;
  relativePath: string;
}

export function forgeWorkflow(
  intent: WorkflowIntent,
  workspaceId: string
): ForgedWorkflow {
  const id = `wf-${intent.name}-${Math.random().toString(36).slice(2, 7)}`;
  const steps = intent.skillCalls || ["collect-inputs", "synthesize", "deliver"];

  const workflow: Workflow = {
    id,
    workspaceId,
    departmentId: intent.departmentId,
    name: intent.name,
    cadence:
      intent.triggerKind === "schedule"
        ? cronHuman(intent.cron || "0 9 * * 1-5")
        : intent.triggerKind === "webhook"
        ? "Webhook tetikli"
        : "Manuel",
    nextRun:
      intent.triggerKind === "schedule"
        ? "Bir sonraki cron"
        : intent.triggerKind === "webhook"
        ? "Anlık"
        : "Tetiklendiğinde",
    lastStatus: "success",
    steps: steps.length + (intent.notify ? 1 : 0),
  };

  const yamlLines: string[] = [
    `id: ${intent.name}`,
    `description: ${intent.purpose}`,
    "trigger:",
  ];

  if (intent.triggerKind === "schedule") {
    yamlLines.push(
      "  type: schedule",
      `  cron: "${intent.cron || "0 9 * * 1-5"}"`,
      `  timezone: "${intent.timezone || "Europe/Istanbul"}"`
    );
  } else if (intent.triggerKind === "webhook") {
    yamlLines.push(
      "  type: webhook",
      `  path: ${intent.webhookPath || `/hooks/${intent.name}`}`
    );
  } else {
    yamlLines.push("  type: manual");
  }

  yamlLines.push("steps:");
  steps.forEach((s, i) => {
    yamlLines.push(
      `  - id: step-${i + 1}`,
      `    action: run_skill`,
      `    skill: ${s}`,
      `    inputs: {}`
    );
  });

  if (intent.notify) {
    yamlLines.push(
      `  - id: deliver`,
      `    action: post_${intent.notify.channel}`,
      `    target: "${intent.notify.target}"`,
      `    message: "{{ steps.step-${steps.length}.output.summary }}"`
    );
  }

  return {
    workflow,
    yaml: yamlLines.join("\n"),
    relativePath: `workflows/${intent.name}.yaml`,
  };
}

function cronHuman(cron: string): string {
  // Very small human-readable mapping for common cases
  const map: Record<string, string> = {
    "30 8 * * 1-5": "Hafta içi · 08:30",
    "0 9 * * 1-5": "Hafta içi · 09:00",
    "0 18 * * 5": "Cuma · 18:00",
    "0 17 * * 5": "Cuma · 17:00",
    "0 16 * * 5": "Cuma · 16:00",
  };
  return map[cron] || `cron · ${cron}`;
}

// -----------------------------------------------------------------------------
// Intent inference — maps an Oracle suggestion to a ready-to-forge intent.
// Used when the user clicks "Kabul et" on a suggestion and we need to derive
// what to forge without asking them to fill a form.
// -----------------------------------------------------------------------------

import type { Suggestion } from "./oracle";

export type ForgeTarget =
  | { kind: "skill"; intent: SkillIntent }
  | { kind: "agent"; intent: AgentIntent }
  | { kind: "workflow"; intent: WorkflowIntent }
  | null;

export function inferForgeTarget(
  s: Suggestion,
  ctx: {
    workspaceId: string;
    agents: { id: string; name: string; departmentId: string; displayName: string }[];
    departments: { id: string; name: string }[];
  }
): ForgeTarget {
  // Rule: gap/sales-scoring-missing → forge skill lead-scorer
  if (s.source === "gap/sales-scoring-missing") {
    const sales = ctx.agents.find((a) => a.name === "sales-assistant");
    if (!sales) return null;
    return {
      kind: "skill",
      intent: {
        name: "lead-scorer",
        displayName: "Lead Scorer",
        ownerAgentId: sales.id,
        ownerAgentName: sales.name,
        purpose: "Zenginleştirilmiş lead'leri 1-100 aralığında skorlar; hangisine önce dokunulacağını belirtir.",
        triggers: ["lead skorla", "hangi lead önce", "priorite ver"],
        inputs: ["lead_profile", "enriched_data"],
        outputs: ["score", "reasoning", "next_action"],
        category: "analysis",
      },
    };
  }

  // gap/agent-no-skills → forge a primary skill for the orphan agent
  if (s.source === "gap/agent-no-skills") {
    const m = s.title.match(/^(.+?) ajanında/);
    const displayName = m?.[1] || "Yeni Ajan";
    const agent = ctx.agents.find(
      (a) => a.displayName.toLowerCase() === displayName.toLowerCase()
    );
    if (!agent) return null;
    return {
      kind: "skill",
      intent: {
        name: `${agent.name}-primary`,
        displayName: `${agent.displayName} · Primary`,
        ownerAgentId: agent.id,
        ownerAgentName: agent.name,
        purpose: `${agent.displayName}'in temel prosedürü.`,
        triggers: [`${agent.displayName.toLowerCase()} ilk temas`],
        category: "action",
      },
    };
  }

  // ops/retro-missing → forge workflow
  if (s.source === "ops/retro-missing") {
    const ops = ctx.departments.find((d) => /ops|operation/i.test(d.name));
    if (!ops) return null;
    return {
      kind: "workflow",
      intent: {
        name: "weekly-retro",
        departmentId: ops.id,
        purpose: "Haftalık hata paternlerini toplar ve iyileştirme önerisi üretir.",
        triggerKind: "schedule",
        cron: "0 17 * * 5",
        skillCalls: ["collect-last-week-errors", "error-pattern-clustering"],
        notify: { channel: "slack", target: "#ops-retro" },
      },
    };
  }

  // gap/empty-department → forge agent for the department
  if (s.source === "gap/empty-department") {
    const m = s.title.match(/^(.+?) departmanında/);
    const deptName = m?.[1];
    const dept = deptName
      ? ctx.departments.find((d) => d.name.toLowerCase() === deptName.toLowerCase())
      : null;
    if (!dept) return null;
    const agentName = `${dept.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-lead`;
    return {
      kind: "agent",
      intent: {
        name: agentName,
        displayName: `${dept.name} Lead`,
        departmentId: dept.id,
        purpose: `${dept.name} departmanının tüm sorumluluk alanını yürüten ana ajan.`,
        model: "sonnet",
        scopes: ["read", "write"],
      },
    };
  }

  // gap/dept-no-workflow → forge a starter weekly-review workflow
  if (s.source === "gap/dept-no-workflow") {
    const m = s.title.match(/^(.+?)'de hiç workflow/);
    const deptName = m?.[1];
    const dept = deptName
      ? ctx.departments.find((d) => d.name.toLowerCase() === deptName.toLowerCase())
      : null;
    if (!dept) return null;
    const wfName = `${dept.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")}-weekly-review`;
    return {
      kind: "workflow",
      intent: {
        name: wfName,
        departmentId: dept.id,
        purpose: `${dept.name} departmanının haftalık durum raporu.`,
        triggerKind: "schedule",
        cron: "0 17 * * 5",
        skillCalls: ["collect-weekly-data", "weekly-synthesize"],
        notify: { channel: "slack", target: `#${dept.name.toLowerCase()}-weekly` },
      },
    };
  }

  return null;
}
