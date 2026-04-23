/**
 * Matrix Catalog — curated, ready-to-install library items.
 *
 * Think of it as the "official" store — each item has a name, description,
 * category, source (matrix-official / community / github-mirror), and a ready
 * payload you can import into your workspace with one click.
 */

import type { AgentIntent, SkillIntent, WorkflowIntent } from "./forge";

export type CatalogKind = "skill" | "agent" | "workflow";
export type CatalogSource = "matrix-official" | "community" | "github" | "n8n-mirror";

export interface CatalogEntry {
  id: string;
  kind: CatalogKind;
  source: CatalogSource;
  name: string;
  displayName: string;
  summary: string;
  tags: string[];
  author: string;
  stars?: number;
  installs?: number;
  skill?: Partial<SkillIntent>;
  agent?: Partial<AgentIntent>;
  workflow?: Partial<WorkflowIntent>;
}

export const catalog: CatalogEntry[] = [
  // ---- Skills ----
  {
    id: "cat-skill-web-research",
    kind: "skill",
    source: "matrix-official",
    name: "web-research-synthesizer",
    displayName: "Web Research Synthesizer",
    summary: "Bir konuyu web'de araştırıp 5-8 kaynaklı ekleme brief üretir.",
    tags: ["research", "content", "brief"],
    author: "matrix-official",
    stars: 412,
    installs: 1840,
    skill: {
      name: "web-research-synthesizer",
      displayName: "Web Research Synthesizer",
      purpose: "Kullanıcının verdiği konu için çoklu-kaynaklı brief üretir.",
      triggers: ["araştır", "brief üret", "research synth"],
      inputs: ["topic", "depth"],
      outputs: ["brief_markdown", "sources", "confidence"],
      category: "research",
    },
  },
  {
    id: "cat-skill-pdf-summary",
    kind: "skill",
    source: "community",
    name: "pdf-summary",
    displayName: "PDF Summary",
    summary: "Uzun PDF'i başlık altı başlık özetleyip aksiyon listesi çıkarır.",
    tags: ["synthesis", "document"],
    author: "openclaw-community",
    stars: 128,
    installs: 612,
    skill: {
      name: "pdf-summary",
      displayName: "PDF Summary",
      purpose: "PDF'i başlık bazında özetler, aksiyon listesi çıkarır.",
      triggers: ["pdf özetle", "doküman özeti"],
      inputs: ["pdf_path"],
      outputs: ["summary_by_section", "action_items"],
      category: "synthesis",
    },
  },
  {
    id: "cat-skill-crm-enrich",
    kind: "skill",
    source: "github",
    name: "crm-enrich-hubspot",
    displayName: "HubSpot Lead Enrichment",
    summary: "HubSpot CRM'deki lead'i halka açık veriyle zenginleştirir.",
    tags: ["sales", "crm", "hubspot"],
    author: "github.com/claude-library/crm-enrich",
    stars: 87,
    installs: 340,
    skill: {
      name: "crm-enrich-hubspot",
      displayName: "HubSpot Lead Enrichment",
      purpose: "HubSpot CRM'deki lead'in profilini halka açık veriyle zenginleştirir.",
      triggers: ["yeni lead", "crm zenginleştir", "hubspot sync"],
      inputs: ["lead_email"],
      outputs: ["company_profile", "role_confidence", "recent_signals"],
      category: "action",
    },
  },
  // ---- Agents ----
  {
    id: "cat-agent-market-watcher",
    kind: "agent",
    source: "matrix-official",
    name: "market-watcher",
    displayName: "Market Watcher",
    summary: "Piyasa haberlerini 5 dakikada bir tarar, anomali tespit eder.",
    tags: ["finance", "monitoring"],
    author: "matrix-official",
    stars: 521,
    installs: 980,
    agent: {
      name: "market-watcher",
      displayName: "Market Watcher",
      purpose: "Piyasa haberlerini sürekli izler ve anomali tespit eder.",
      model: "sonnet",
      scopes: ["read", "write"],
      mcpTools: ["mcp__slack__send_message"],
    },
  },
  {
    id: "cat-agent-customer-success",
    kind: "agent",
    source: "community",
    name: "customer-success-rep",
    displayName: "Customer Success Rep",
    summary: "Müşteri ticketlarını triage eder, SLA kontrolü yapar, eskalasyon işaretler.",
    tags: ["ops", "support", "sla"],
    author: "openclaw-community",
    stars: 203,
    installs: 511,
    agent: {
      name: "customer-success-rep",
      displayName: "Customer Success Rep",
      purpose: "Müşteri destek ticketlarını triage eder ve eskalasyon işaretler.",
      model: "sonnet",
      scopes: ["read", "write", "external-send"],
      mcpTools: ["mcp__slack__send_message", "mcp__intercom__reply"],
    },
  },
  // ---- Workflows ----
  {
    id: "cat-wf-daily-market",
    kind: "workflow",
    source: "matrix-official",
    name: "daily-market-briefing",
    displayName: "Daily Market Briefing",
    summary: "Her sabah 08:30'da piyasa nabzı Slack'e düşer.",
    tags: ["finance", "daily", "slack"],
    author: "matrix-official",
    stars: 642,
    installs: 2100,
    workflow: {
      name: "daily-market-briefing",
      purpose: "Hafta içi sabah piyasa özeti.",
      triggerKind: "schedule",
      cron: "30 8 * * 1-5",
      skillCalls: ["market-pulse-report"],
      notify: { channel: "slack", target: "#trading-daily" },
    },
  },
  {
    id: "cat-wf-lead-triage",
    kind: "workflow",
    source: "community",
    name: "inbound-lead-triage",
    displayName: "Inbound Lead Triage",
    summary: "Webhook'tan gelen yeni lead'i zenginleştir + skorla + CRM'ye yaz.",
    tags: ["sales", "webhook"],
    author: "openclaw-community",
    stars: 341,
    installs: 1240,
    workflow: {
      name: "inbound-lead-triage",
      purpose: "Yeni lead'i otomatik zenginleştirir ve CRM'ye yazar.",
      triggerKind: "webhook",
      webhookPath: "/hooks/lead-form",
      skillCalls: ["crm-enrich-hubspot", "lead-scorer"],
      notify: { channel: "slack", target: "#sales-inbound" },
    },
  },
  {
    id: "cat-wf-n8n-github-pr",
    kind: "workflow",
    source: "n8n-mirror",
    name: "n8n-github-pr-digest",
    displayName: "n8n · GitHub PR Digest",
    summary:
      "n8n export'undan dönüştürülmüş. Her gün öğlen bekleyen PR'ları Slack'te özetler.",
    tags: ["devops", "github", "n8n-import"],
    author: "n8n.community/workflows/8421",
    stars: 76,
    installs: 210,
    workflow: {
      name: "github-pr-digest",
      purpose: "Bekleyen PR'ları günlük olarak Slack'te özetler.",
      triggerKind: "schedule",
      cron: "0 12 * * 1-5",
      skillCalls: ["github-pr-fetch", "pr-summary-synth"],
      notify: { channel: "slack", target: "#engineering" },
    },
  },
];

export function searchCatalog(
  query: string,
  kind?: CatalogKind
): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  return catalog.filter((c) => {
    if (kind && c.kind !== kind) return false;
    if (!q) return true;
    return (
      c.name.includes(q) ||
      c.displayName.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.tags.some((t) => t.includes(q)) ||
      c.author.toLowerCase().includes(q)
    );
  });
}
