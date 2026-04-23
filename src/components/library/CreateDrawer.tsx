"use client";

import { cn } from "@/lib/cn";
import {
  agents as seedAgents,
  departments as seedDepartments,
  goals as seedGoals,
  skills as seedSkills,
  workflows as seedWorkflows,
} from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/store";
import { scanWorkspace, type Suggestion } from "@/lib/oracle";
import {
  forgeAgent,
  forgeSkill,
  forgeWorkflow,
  inferForgeTarget,
  type AgentIntent,
  type SkillIntent,
  type WorkflowIntent,
} from "@/lib/forge";
import { catalog, searchCatalog, type CatalogEntry } from "@/lib/catalog";
import { Button } from "../ui/Button";
import { CatalogItemRow } from "./LibraryItemCard";
import {
  ArrowRight,
  Check,
  FileCode,
  Code2 as Github,
  Globe,
  Pencil,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../ui/Badge";

type Mode = "oracle" | "catalog" | "import" | "manual";
type Kind = "skill" | "agent" | "workflow";

export function CreateDrawer({
  open,
  kind,
  onClose,
}: {
  open: boolean;
  kind: Kind;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("oracle");
  useEffect(() => {
    if (open) setMode("oracle");
  }, [open, kind]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <button
        aria-label="Kapat"
        onClick={onClose}
        className="flex-1 bg-void/70 backdrop-blur-sm"
      />
      {/* Drawer */}
      <aside className="flex h-full w-full max-w-3xl flex-col border-l border-border/70 bg-surface/95 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              Yeni {kindLabel[kind]}
            </div>
            <h3 className="mt-1 text-lg font-semibold text-text">{modeTitle(mode, kind)}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-text-muted hover:bg-elevated hover:text-text"
          >
            <X size={16} />
          </button>
        </header>

        {/* Mode tabs */}
        <div className="flex gap-1 border-b border-border/60 px-4 py-3">
          <ModeTab active={mode === "oracle"} onClick={() => setMode("oracle")} icon={Sparkles} tone="nebula">
            Oracle ile oluştur
          </ModeTab>
          <ModeTab active={mode === "catalog"} onClick={() => setMode("catalog")} icon={Globe} tone="ion">
            Matrix Catalog
          </ModeTab>
          <ModeTab active={mode === "import"} onClick={() => setMode("import")} icon={Upload} tone="solar">
            İçeri aktar
          </ModeTab>
          <ModeTab active={mode === "manual"} onClick={() => setMode("manual")} icon={Pencil} tone="neutral">
            Manuel
          </ModeTab>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {mode === "oracle" && <OraclePanel kind={kind} onDone={onClose} />}
          {mode === "catalog" && <CatalogPanel kind={kind} onDone={onClose} />}
          {mode === "import" && <ImportPanel kind={kind} onDone={onClose} />}
          {mode === "manual" && <ManualPanel kind={kind} onDone={onClose} />}
        </div>
      </aside>
    </div>
  );
}

const kindLabel: Record<Kind, string> = {
  skill: "Skill",
  agent: "Agent",
  workflow: "Workflow",
};

function modeTitle(mode: Mode, kind: Kind) {
  switch (mode) {
    case "oracle":
      return `Oracle'dan ${kindLabel[kind]} taslağı`;
    case "catalog":
      return `Matrix Catalog · ${kindLabel[kind]}`;
    case "import":
      return `${kindLabel[kind]} içeri aktar`;
    case "manual":
      return `Manuel ${kindLabel[kind]}`;
  }
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Sparkles;
  tone: "nebula" | "ion" | "solar" | "neutral";
  children: React.ReactNode;
}) {
  const toneCls =
    tone === "nebula"
      ? "text-nebula bg-nebula-soft border-nebula/40"
      : tone === "ion"
      ? "text-ion bg-ion-soft border-ion/40"
      : tone === "solar"
      ? "text-solar bg-solar-soft border-solar/40"
      : "text-text bg-elevated border-border-strong";

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? toneCls + " shadow-inner"
          : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
      )}
    >
      <Icon size={12} />
      {children}
    </button>
  );
}

// =============================================================================
// Mode: Oracle
// =============================================================================

function OraclePanel({ kind, onDone }: { kind: Kind; onDone: () => void }) {
  const { currentWorkspaceId, workspaces, createSkill, createAgent, createWorkflow } =
    useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  const suggestions = useMemo(() => {
    return scanWorkspace({
      workspace: ws,
      departments: seedDepartments.filter((d) => d.workspaceId === ws.id),
      agents: seedAgents.filter((a) => a.workspaceId === ws.id),
      skills: seedSkills.filter((s) => s.workspaceId === ws.id),
      workflows: seedWorkflows.filter((w) => w.workspaceId === ws.id),
      goals: seedGoals.filter((g) => g.workspaceId === ws.id),
    }).filter((s) => {
      const t = inferForgeTarget(s, {
        workspaceId: ws.id,
        agents: seedAgents.filter((a) => a.workspaceId === ws.id).map((a) => ({
          id: a.id,
          name: a.name,
          displayName: a.displayName,
          departmentId: a.departmentId,
        })),
        departments: seedDepartments
          .filter((d) => d.workspaceId === ws.id)
          .map((d) => ({ id: d.id, name: d.name })),
      });
      return t && t.kind === kind;
    });
  }, [ws, kind]);

  const [selected, setSelected] = useState<Suggestion | null>(suggestions[0] || null);

  useEffect(() => {
    setSelected(suggestions[0] || null);
  }, [suggestions]);

  const preview = useMemo(() => {
    if (!selected) return null;
    const target = inferForgeTarget(selected, {
      workspaceId: ws.id,
      agents: seedAgents.filter((a) => a.workspaceId === ws.id).map((a) => ({
        id: a.id,
        name: a.name,
        displayName: a.displayName,
        departmentId: a.departmentId,
      })),
      departments: seedDepartments
        .filter((d) => d.workspaceId === ws.id)
        .map((d) => ({ id: d.id, name: d.name })),
    });
    if (!target) return null;
    if (target.kind === "skill") {
      const f = forgeSkill(target.intent as SkillIntent, ws.id);
      return { kind: "skill" as const, forged: f, source: selected.source };
    }
    if (target.kind === "agent") {
      const f = forgeAgent(target.intent as AgentIntent, ws.id);
      return { kind: "agent" as const, forged: f, source: selected.source };
    }
    const f = forgeWorkflow(target.intent as WorkflowIntent, ws.id);
    return { kind: "workflow" as const, forged: f, source: selected.source };
  }, [selected, ws.id]);

  const commit = () => {
    if (!preview) return;
    const createdAt = new Date().toISOString();
    if (preview.kind === "skill") {
      createSkill(
        {
          entity: preview.forged.skill,
          origin: "oracle",
          createdAt,
          file: {
            path: preview.forged.relativePath,
            language: "markdown",
            content: preview.forged.markdown,
          },
        },
        preview.source
      );
    } else if (preview.kind === "agent") {
      createAgent(
        {
          entity: preview.forged.agent,
          origin: "oracle",
          createdAt,
          file: {
            path: preview.forged.relativePath,
            language: "markdown",
            content: preview.forged.markdown,
          },
        },
        preview.source
      );
    } else {
      createWorkflow(
        {
          entity: preview.forged.workflow,
          origin: "oracle",
          createdAt,
          file: {
            path: preview.forged.relativePath,
            language: "yaml",
            content: preview.forged.yaml,
          },
        },
        preview.source
      );
    }
    onDone();
  };

  return (
    <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-[280px_1fr]">
      {/* Suggestion list */}
      <div className="border-b border-border/60 lg:border-b-0 lg:border-r">
        <div className="px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">
            Oracle'ın {kindLabel[kind]} önerileri
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Boşluk tespit edildi → hazır formülasyon. Seçip kaydet.
          </p>
        </div>
        <ul className="space-y-1 px-2 pb-3">
          {suggestions.length === 0 && (
            <li className="mx-2 rounded-lg border border-dashed border-border/60 bg-elevated/30 p-4 text-center text-xs text-text-muted">
              Bu tür için açık boşluk yok.
              <br />
              Manuel mod veya Catalog dene.
            </li>
          )}
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setSelected(s)}
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-left transition-colors",
                  selected?.id === s.id
                    ? "border-nebula/40 bg-nebula-soft/30"
                    : "border-transparent hover:bg-elevated/50"
                )}
              >
                <div className="text-xs font-medium text-text line-clamp-2">{s.title}</div>
                <div className="mt-0.5 font-mono text-[10px] text-text-faint">{s.source}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Preview */}
      <div className="flex flex-col">
        {preview ? (
          <>
            <div className="flex-1 overflow-auto px-6 py-5">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-nebula" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-nebula">
                  Oracle Forge önizleme
                </span>
              </div>
              <h4 className="mt-2 text-lg font-semibold text-text">{selected?.title}</h4>
              <p className="mt-1 text-sm text-text-muted">{selected?.rationale}</p>

              <div className="mt-4 overflow-hidden rounded-lg border border-border/60 bg-void/70">
                <div className="flex items-center justify-between border-b border-border/60 bg-elevated/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileCode size={12} className="text-text-muted" />
                    <span className="font-mono text-[11px] text-text">
                      {preview.kind === "skill"
                        ? preview.forged.relativePath
                        : preview.kind === "agent"
                        ? preview.forged.relativePath
                        : preview.forged.relativePath}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
                    {preview.kind === "workflow" ? "yaml" : "markdown"}
                  </span>
                </div>
                <pre className="max-h-[45vh] overflow-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-text-muted">
                  {preview.kind === "workflow" ? preview.forged.yaml : preview.forged.markdown}
                </pre>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 px-6 py-3">
              <span className="text-xs text-text-muted">
                Kaydedince AGENT.md/SKILL.md/YAML dosyası Library'ye düşer ve Org Studio'da görünür.
              </span>
              <Button variant="primary" size="md" className="gap-1.5" onClick={commit}>
                <Check size={14} />
                Kaydet ve envantere ekle
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
            <Sparkles size={24} className="text-nebula/60" />
            <p className="mt-3 text-sm text-text-muted">
              {kind === "skill"
                ? "Oracle şu an bu workspace için skill önerisi üretmiyor."
                : kind === "agent"
                ? "Oracle şu an bu workspace için yeni agent önerisi üretmiyor."
                : "Oracle şu an bu workspace için yeni workflow önerisi üretmiyor."}
            </p>
            <p className="mt-1 text-xs text-text-faint">Catalog veya İçeri Aktar sekmesini dene.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Mode: Catalog
// =============================================================================

function CatalogPanel({ kind, onDone }: { kind: Kind; onDone: () => void }) {
  const { currentWorkspaceId, createSkill, createAgent, createWorkflow } = useWorkspaceStore();
  const [q, setQ] = useState("");
  const items = useMemo(() => searchCatalog(q, kind), [q, kind]);

  const install = (entry: CatalogEntry) => {
    const createdAt = new Date().toISOString();
    if (entry.kind === "skill" && entry.skill) {
      const intent: SkillIntent = {
        name: entry.skill.name!,
        displayName: entry.skill.displayName!,
        ownerAgentId: "", // user can reassign in Org Studio
        ownerAgentName: "unassigned",
        purpose: entry.skill.purpose!,
        triggers: entry.skill.triggers || [],
        inputs: entry.skill.inputs,
        outputs: entry.skill.outputs,
        category: entry.skill.category,
      };
      const f = forgeSkill(intent, currentWorkspaceId);
      createSkill({
        entity: f.skill,
        origin: "catalog",
        createdAt,
        file: { path: f.relativePath, language: "markdown", content: f.markdown },
      });
    } else if (entry.kind === "agent" && entry.agent) {
      const intent: AgentIntent = {
        name: entry.agent.name!,
        displayName: entry.agent.displayName!,
        departmentId: "",
        purpose: entry.agent.purpose!,
        model: entry.agent.model,
        scopes: entry.agent.scopes,
        mcpTools: entry.agent.mcpTools,
      };
      const f = forgeAgent(intent, currentWorkspaceId);
      createAgent({
        entity: f.agent,
        origin: "catalog",
        createdAt,
        file: { path: f.relativePath, language: "markdown", content: f.markdown },
      });
    } else if (entry.kind === "workflow" && entry.workflow) {
      const intent: WorkflowIntent = {
        name: entry.workflow.name!,
        departmentId: "",
        purpose: entry.workflow.purpose!,
        triggerKind: entry.workflow.triggerKind!,
        cron: entry.workflow.cron,
        webhookPath: entry.workflow.webhookPath,
        skillCalls: entry.workflow.skillCalls,
        notify: entry.workflow.notify,
      };
      const f = forgeWorkflow(intent, currentWorkspaceId);
      createWorkflow({
        entity: f.workflow,
        origin: "catalog",
        createdAt,
        file: { path: f.relativePath, language: "yaml", content: f.yaml },
      });
    }
    onDone();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/60 bg-surface/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm text-text-muted">
          <Search size={14} className="text-text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="catalog'da ara — konuya, etikete, yazara göre…"
            className="w-full bg-transparent outline-none placeholder:text-text-faint"
          />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-6 py-4">
        <p className="text-xs text-text-muted">
          Matrix Catalog · {items.length} sonuç · Resmi, topluluk, GitHub ve n8n ayna kayıtları
        </p>
        {items.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-border/60 bg-elevated/30 p-6 text-center text-sm text-text-muted">
            Arama sonucunda bir şey yok. Başka bir anahtar kelime dene veya İçeri Aktar sekmesini
            kullan.
          </div>
        )}
        {items.map((entry) => (
          <CatalogItemRow
            key={entry.id}
            kind={entry.kind}
            name={entry.name}
            displayName={entry.displayName}
            summary={entry.summary}
            tags={entry.tags}
            source={entry.source}
            stars={entry.stars}
            installs={entry.installs}
            onInstall={() => install(entry)}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Mode: Import
// =============================================================================

type ImportChannel = "github" | "n8n" | "file" | "paste";

function ImportPanel({ kind, onDone }: { kind: Kind; onDone: () => void }) {
  const [channel, setChannel] = useState<ImportChannel>("github");
  const [url, setUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [log, setLog] = useState<string | null>(null);

  const { currentWorkspaceId, createSkill, createAgent, createWorkflow } = useWorkspaceStore();

  const doImport = () => {
    // In this mock, we simulate a successful import by forging a placeholder from the URL/paste.
    const createdAt = new Date().toISOString();
    const handleName = deriveName(url || pasted || "imported");
    if (kind === "skill") {
      const f = forgeSkill(
        {
          name: handleName,
          displayName: toTitle(handleName),
          ownerAgentId: "",
          ownerAgentName: "unassigned",
          purpose: `İçeri aktarıldı (${channel}).`,
          triggers: [],
          category: "action",
        },
        currentWorkspaceId
      );
      createSkill({
        entity: f.skill,
        origin: "import",
        createdAt,
        file: { path: f.relativePath, language: "markdown", content: f.markdown },
      });
    } else if (kind === "agent") {
      const f = forgeAgent(
        {
          name: handleName,
          displayName: toTitle(handleName),
          departmentId: "",
          purpose: `İçeri aktarıldı (${channel}).`,
        },
        currentWorkspaceId
      );
      createAgent({
        entity: f.agent,
        origin: "import",
        createdAt,
        file: { path: f.relativePath, language: "markdown", content: f.markdown },
      });
    } else {
      const f = forgeWorkflow(
        {
          name: handleName,
          departmentId: "",
          purpose: `İçeri aktarıldı (${channel}).`,
          triggerKind: channel === "n8n" ? "webhook" : "manual",
          webhookPath: channel === "n8n" ? "/hooks/" + handleName : undefined,
        },
        currentWorkspaceId
      );
      createWorkflow({
        entity: f.workflow,
        origin: "import",
        createdAt,
        file: { path: f.relativePath, language: "yaml", content: f.yaml },
      });
    }
    setLog(`✓ ${handleName} envantere eklendi.`);
    setTimeout(onDone, 600);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Channel tabs */}
      <div className="flex gap-1 border-b border-border/60 px-6 py-3">
        <Chip active={channel === "github"} onClick={() => setChannel("github")} icon={Github}>
          GitHub URL
        </Chip>
        <Chip active={channel === "n8n"} onClick={() => setChannel("n8n")} icon={Upload}>
          n8n JSON
        </Chip>
        <Chip active={channel === "file"} onClick={() => setChannel("file")} icon={FileCode}>
          Dosya
        </Chip>
        <Chip active={channel === "paste"} onClick={() => setChannel("paste")} icon={Pencil}>
          Yapıştır
        </Chip>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {channel === "github" && (
          <div>
            <label className="block text-xs font-medium text-text-muted">
              GitHub repo veya raw URL
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-border/60 bg-elevated/50 px-3 py-2">
              <Github size={14} className="text-text-faint" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="github.com/claude-library/pdf-summary"
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-text-faint">
              Matrix URL'yi çözümler, SKILL.md / AGENT.md / workflow.yaml dosyalarını tespit eder ve
              envantere uygun şekilde ekler. Canlı sürümde GitHub API'ya bağlanacak; şu an mock
              simülasyon.
            </p>

            <SuggestedSearches kind={kind} onPick={setUrl} />
          </div>
        )}

        {channel === "n8n" && (
          <div>
            <label className="block text-xs font-medium text-text-muted">
              n8n workflow JSON
            </label>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={10}
              placeholder={`{\n  "name": "My n8n Workflow",\n  "nodes": [...],\n  "connections": {...}\n}`}
              className="mt-2 w-full rounded-md border border-border/60 bg-void/60 p-3 font-mono text-[11px] leading-relaxed text-text outline-none focus:border-solar/50"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-text-faint">
              n8n export JSON'ını yapıştır. Matrix node'ları skill çağrılarına, trigger'ı cron/webhook'a,
              connection'ları step zincirine dönüştürür. Uyumsuz node'lar için uyarı verir.
            </p>
          </div>
        )}

        {channel === "file" && (
          <div>
            <label className="block text-xs font-medium text-text-muted">
              Dosya yükle (.md, .yaml, .json)
            </label>
            <div className="mt-2 flex items-center justify-center gap-3 rounded-md border-2 border-dashed border-border/60 bg-elevated/30 px-6 py-10 text-center">
              <Upload size={24} className="text-text-muted" />
              <div>
                <div className="text-sm text-text">Bir dosya seç veya buraya sürükle</div>
                <div className="mt-1 text-xs text-text-muted">SKILL.md, AGENT.md, workflow.yaml, n8n.json</div>
              </div>
            </div>
          </div>
        )}

        {channel === "paste" && (
          <div>
            <label className="block text-xs font-medium text-text-muted">
              İçeriği buraya yapıştır (Markdown veya YAML)
            </label>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={12}
              placeholder={kind === "workflow" ? "id: my-workflow\ntrigger: ..." : "---\nname: my-item\n...\n---\n\n# Başlık"}
              className="mt-2 w-full rounded-md border border-border/60 bg-void/60 p-3 font-mono text-[11px] leading-relaxed text-text outline-none focus:border-solar/50"
            />
          </div>
        )}

        {log && (
          <div className="rounded-lg border border-quantum/40 bg-quantum-soft/20 px-4 py-3 font-mono text-xs text-quantum">
            {log}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-6 py-3">
        <span className="text-xs text-text-muted">
          {channel === "n8n"
            ? "Uyumsuz node tespit edilirse uyarı göstereceğim."
            : "İçe aktarılan item'ı sonra Inspector'dan düzenleyebilirsin."}
        </span>
        <Button variant="primary" size="md" className="gap-1.5" onClick={doImport}>
          <ArrowRight size={14} />
          Envantere ekle
        </Button>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Github;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-all",
        active
          ? "border-solar/40 bg-solar-soft text-solar"
          : "border-border/60 text-text-muted hover:border-border-strong hover:text-text"
      )}
    >
      <Icon size={11} />
      {children}
    </button>
  );
}

function SuggestedSearches({
  kind,
  onPick,
}: {
  kind: Kind;
  onPick: (u: string) => void;
}) {
  const picks =
    kind === "skill"
      ? [
          "github.com/claude-library/pdf-summary",
          "github.com/awesome-claude/market-pulse",
          "github.com/anthropic-templates/email-triager",
        ]
      : kind === "agent"
      ? [
          "github.com/claude-library/customer-success-rep",
          "github.com/agent-zoo/market-watcher",
          "github.com/matrix-community/sales-qualifier",
        ]
      : [
          "github.com/claude-library/weekly-digest",
          "n8n.community/workflows/8421",
          "github.com/matrix-community/okr-tracker",
        ];

  return (
    <div className="mt-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">
        Öneri: popüler kaynaklar
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {picks.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-elevated/40 px-2 py-1 font-mono text-[10px] text-text-muted transition-colors hover:border-border-strong hover:text-text"
          >
            <Github size={10} />
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Mode: Manual
// =============================================================================

function ManualPanel({ kind, onDone }: { kind: Kind; onDone: () => void }) {
  const { currentWorkspaceId, createSkill, createAgent, createWorkflow } = useWorkspaceStore();
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [triggers, setTriggers] = useState("");

  const canSave = name.trim() && displayName.trim() && purpose.trim();

  const submit = () => {
    if (!canSave) return;
    const createdAt = new Date().toISOString();
    if (kind === "skill") {
      const f = forgeSkill(
        {
          name,
          displayName,
          ownerAgentId: "",
          ownerAgentName: "unassigned",
          purpose,
          triggers: triggers.split(",").map((t) => t.trim()).filter(Boolean),
          category: "action",
        },
        currentWorkspaceId
      );
      createSkill({
        entity: f.skill,
        origin: "manual",
        createdAt,
        file: { path: f.relativePath, language: "markdown", content: f.markdown },
      });
    } else if (kind === "agent") {
      const f = forgeAgent(
        {
          name,
          displayName,
          departmentId: "",
          purpose,
        },
        currentWorkspaceId
      );
      createAgent({
        entity: f.agent,
        origin: "manual",
        createdAt,
        file: { path: f.relativePath, language: "markdown", content: f.markdown },
      });
    } else {
      const f = forgeWorkflow(
        {
          name,
          departmentId: "",
          purpose,
          triggerKind: "manual",
        },
        currentWorkspaceId
      );
      createWorkflow({
        entity: f.workflow,
        origin: "manual",
        createdAt,
        file: { path: f.relativePath, language: "yaml", content: f.yaml },
      });
    }
    onDone();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <Field label="Kimlik (kebab-case)">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={kind === "skill" ? "lead-scorer" : kind === "agent" ? "sales-assistant" : "weekly-retro"}
            className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm text-text outline-none focus:border-ion/40"
          />
        </Field>
        <Field label="Görünen ad">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={kind === "skill" ? "Lead Scorer" : "İnsan okunur ad"}
            className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm text-text outline-none focus:border-ion/40"
          />
        </Field>
        <Field label="Amaç (tek cümle)">
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={2}
            placeholder="Bu item ne yapıyor ve neden var?"
            className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm text-text outline-none focus:border-ion/40"
          />
        </Field>
        {kind === "skill" && (
          <Field label="Tetikleyiciler (virgül ile ayır)">
            <input
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              placeholder="lead skorla, hangi lead önce, priorite ver"
              className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm text-text outline-none focus:border-ion/40"
            />
          </Field>
        )}

        <div className="rounded-lg border border-border/60 bg-elevated/30 p-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
            <Sparkles size={10} className="text-nebula" />
            Matrix şablonu uygulanıyor
          </div>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            Kaydet tuşuna bastığında Matrix girdin etrafında standart {kindLabel[kind]} dosyasını
            üretir (başlıklar, hata senaryoları, değerlendirme kriteri). Sonra Library'den
            düzenleyebilirsin.
          </p>
          <Badge tone="nebula" className="mt-2">
            Oracle Forge
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-6 py-3">
        <span className="text-xs text-text-muted">
          Zorunlu alanlar: kimlik, görünen ad, amaç.
        </span>
        <Button variant="primary" size="md" className="gap-1.5" onClick={submit} disabled={!canSave}>
          <Check size={14} />
          Kaydet
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-text-faint">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function deriveName(src: string) {
  const tail = src
    .replace(/^https?:\/\//, "")
    .replace(/[\/?:#].*$/, "")
    .split(/[\/_\-\.]+/)
    .filter(Boolean)
    .slice(-2)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, "");
  return tail || `imported-${Math.random().toString(36).slice(2, 6)}`;
}

function toTitle(s: string) {
  return s
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
