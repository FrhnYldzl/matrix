"use client";

/**
 * Model Detail Drawer — opens from a ModelCard in The Source.
 * HF-inspired tabs: Overview · Tasks & Capabilities · Inference · Deploy.
 */

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  capabilityLabels,
  capabilityTone,
  taskGroupOf,
  taskLabel,
  type LLMModel,
  type TaskGroup,
} from "@/lib/llm-catalog";
import { connectors } from "@/lib/connectors";
import {
  Binary,
  Box,
  Coins,
  Copy,
  Cpu,
  ExternalLink,
  FileCode,
  GitBranch,
  Leaf,
  Library as LibraryIcon,
  Package,
  Scale,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";

type Tab = "overview" | "tasks" | "inference" | "deploy";

const tabMeta: Record<Tab, { label: string; icon: typeof Box }> = {
  overview: { label: "Genel Bakış", icon: Sparkles },
  tasks: { label: "Task & Capability", icon: Box },
  inference: { label: "Inference", icon: Zap },
  deploy: { label: "Deploy", icon: Terminal },
};

const taskGroupClass: Record<TaskGroup, string> = {
  multimodal: "text-ion border-ion/30 bg-ion-soft/60",
  vision: "text-nebula border-nebula/30 bg-nebula-soft/60",
  nlp: "text-quantum border-quantum/30 bg-quantum-soft/60",
  audio: "text-solar border-solar/30 bg-solar-soft/60",
  tabular: "text-text-muted border-border/60 bg-elevated/60",
  "rl-other": "text-crimson border-crimson/30 bg-crimson-soft/60",
};

export function ModelDetailDrawer({
  model,
  open,
  onClose,
}: {
  model: LLMModel | null;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  if (!open || !model) return null;

  const homeConnector = connectors.find((c) => c.id === model.connectorId);
  const hostConnectors = (model.hostedOn || [])
    .map((h) => connectors.find((c) => c.id === h))
    .filter((c): c is NonNullable<typeof c> => c != null);
  const engineHosts = hostConnectors.filter((c) => c.category === "engines");
  const programHosts = hostConnectors.filter((c) => c.category === "free-programs");

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        onClick={onClose}
        aria-label="Kapat"
        className="flex-1 bg-void/70 backdrop-blur-sm"
      />
      <aside className="flex h-full w-full max-w-2xl flex-col border-l border-border/70 bg-surface/95 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <header className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
          <div className="pointer-events-none absolute -top-10 right-10 h-24 w-[260px] rounded-full bg-nebula/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3 px-6 py-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-nebula/40 bg-nebula-soft text-nebula">
                <Box size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-xl font-semibold text-text">{model.name}</h3>
                  {model.status !== "ga" && (
                    <span className="rounded border border-solar/30 bg-solar-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-solar">
                      {model.status}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-text-faint">
                  <span className="truncate">{model.vendor}</span>
                  {model.contextWindow > 0 && (
                    <>
                      <span>·</span>
                      <span>{(model.contextWindow / 1000).toFixed(0)}K ctx</span>
                    </>
                  )}
                  {homeConnector && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-ion">
                        <Package size={9} />
                        {homeConnector.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-text-muted hover:bg-elevated hover:text-text"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-border/50 px-6">
          <div className="flex gap-1">
            {(Object.keys(tabMeta) as Tab[]).map((t) => {
              const Icon = tabMeta[t].icon;
              const active = t === tab;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs transition-colors",
                    active
                      ? "border-nebula text-nebula"
                      : "border-transparent text-text-muted hover:text-text"
                  )}
                >
                  <Icon size={12} />
                  {tabMeta[t].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "overview" && (
            <OverviewTab model={model} engineHostCount={engineHosts.length} />
          )}
          {tab === "tasks" && <TasksTab model={model} />}
          {tab === "inference" && (
            <InferenceTab
              engines={engineHosts}
              programs={programHosts}
              homeConnector={homeConnector}
            />
          )}
          {tab === "deploy" && <DeployTab model={model} />}
        </div>
      </aside>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Overview
// ═══════════════════════════════════════════════════════════════════════════

function OverviewTab({
  model: m,
  engineHostCount,
}: {
  model: LLMModel;
  engineHostCount: number;
}) {
  return (
    <div className="space-y-5">
      {/* Tagline */}
      <p className="text-sm leading-relaxed text-text">{m.tagline}</p>

      {/* Key metadata grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <MetaCard
          icon={<Cpu size={12} className="text-quantum" />}
          label="Parameters"
          value={
            m.parameters != null && m.parameters > 0
              ? `${m.parameters}B`
              : "proprietary"
          }
        />
        <MetaCard
          icon={<GitBranch size={12} className="text-nebula" />}
          label="Architecture"
          value={m.architecture || "—"}
        />
        <MetaCard
          icon={<Scale size={12} className="text-solar" />}
          label="License"
          value={m.license || "—"}
        />
        <MetaCard
          icon={<Binary size={12} className="text-ion" />}
          label="Precision"
          value={m.precision?.join(", ") || "—"}
        />
        <MetaCard
          icon={<Leaf size={12} className="text-quantum" />}
          label="Carbon"
          value={
            m.carbonGCO2PerMTok != null
              ? `${m.carbonGCO2PerMTok} gCO₂/M tok`
              : "—"
          }
        />
        <MetaCard
          icon={<Zap size={12} className="text-ion" />}
          label="Engines"
          value={engineHostCount > 0 ? `${engineHostCount} provider` : "host-only"}
        />
      </div>

      {/* Pricing */}
      {(m.inputCostPerMTok != null || m.outputCostPerMTok != null) && (
        <div className="rounded-lg border border-border/60 bg-elevated/40 p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            <Coins size={11} className="text-solar" />
            Pricing · per million tokens
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            {m.inputCostPerMTok != null && (
              <div>
                <div className="font-mono text-[10px] text-text-faint">Input</div>
                <div className="mt-0.5 text-text">${m.inputCostPerMTok}/M</div>
              </div>
            )}
            {m.outputCostPerMTok != null && (
              <div>
                <div className="font-mono text-[10px] text-text-faint">Output</div>
                <div className="mt-0.5 text-lg font-semibold text-text">
                  ${m.outputCostPerMTok}/M
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommended for */}
      {m.recommendedFor.length > 0 && (
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            <Sparkles size={11} className="text-nebula" />
            Ne için iyi
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {m.recommendedFor.map((r) => (
              <span
                key={r}
                className="rounded-md border border-nebula/30 bg-nebula-soft/40 px-2 py-0.5 font-mono text-[11px] text-nebula"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Libraries */}
      {m.libraries && m.libraries.length > 0 && (
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            <LibraryIcon size={11} className="text-ion" />
            Libraries · {m.libraries.length}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {m.libraries.map((lib) => (
              <span
                key={lib}
                className="rounded-md border border-border/60 bg-elevated/60 px-2 py-0.5 font-mono text-[11px] text-text-muted"
              >
                {lib}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-elevated/30 p-3">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-faint">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-mono text-sm font-medium text-text">{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tasks & Capabilities
// ═══════════════════════════════════════════════════════════════════════════

function TasksTab({ model: m }: { model: LLMModel }) {
  const tasksByGroup: Partial<Record<TaskGroup, string[]>> = {};
  (m.taskTypes || []).forEach((t) => {
    const g = taskGroupOf[t];
    tasksByGroup[g] = tasksByGroup[g] || [];
    tasksByGroup[g]!.push(t);
  });

  const groupLabel: Record<TaskGroup, string> = {
    multimodal: "Multimodal",
    vision: "Computer Vision",
    nlp: "Natural Language",
    audio: "Audio",
    tabular: "Tabular",
    "rl-other": "RL · Other",
  };

  return (
    <div className="space-y-5">
      {/* HF-style tasks */}
      <div>
        <h4 className="text-sm font-semibold text-text">HuggingFace Tasks</h4>
        <p className="mt-0.5 text-xs text-text-muted">
          Bu model hangi standart task tipleri için desteklenir?
        </p>
        <div className="mt-3 space-y-3">
          {Object.entries(tasksByGroup).map(([g, tasks]) => {
            const group = g as TaskGroup;
            return (
              <div key={g}>
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  {groupLabel[group]}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tasks!.map((t) => (
                    <span
                      key={t}
                      className={cn(
                        "rounded border px-2 py-0.5 font-mono text-[11px]",
                        taskGroupClass[group]
                      )}
                    >
                      {taskLabel[t as keyof typeof taskLabel]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {(m.taskTypes || []).length === 0 && (
            <div className="rounded-md border border-dashed border-border/60 bg-elevated/30 p-3 text-xs text-text-muted">
              Task taksonomisi tanımlanmamış.
            </div>
          )}
        </div>
      </div>

      {/* Matrix capability layer */}
      <div>
        <h4 className="text-sm font-semibold text-text">Matrix Capability Layer</h4>
        <p className="mt-0.5 text-xs text-text-muted">
          Matrix'in semantic katmanı — Oracle bu kapasitelere göre model seçer.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.capabilities.map((c) => {
            const tone = capabilityTone[c];
            const cls =
              tone === "ion"
                ? "text-ion border-ion/30 bg-ion-soft"
                : tone === "nebula"
                ? "text-nebula border-nebula/30 bg-nebula-soft"
                : tone === "quantum"
                ? "text-quantum border-quantum/30 bg-quantum-soft"
                : tone === "solar"
                ? "text-solar border-solar/30 bg-solar-soft"
                : "text-crimson border-crimson/30 bg-crimson-soft";
            return (
              <span
                key={c}
                className={cn(
                  "rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider",
                  cls
                )}
              >
                {capabilityLabels[c]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Inference (hosts)
// ═══════════════════════════════════════════════════════════════════════════

function InferenceTab({
  engines,
  programs,
  homeConnector,
}: {
  engines: ReturnType<typeof connectors.filter>;
  programs: ReturnType<typeof connectors.filter>;
  homeConnector?: (typeof connectors)[number];
}) {
  return (
    <div className="space-y-5">
      {homeConnector && homeConnector.category !== "engines" && (
        <HostSection
          title="Ana Host"
          icon={<Package size={11} className="text-ion" />}
          hosts={[homeConnector]}
          note="Modelin kanonik host'u — foundry'nin kendi API'si."
        />
      )}
      {engines.length > 0 && (
        <HostSection
          title={`Engines · ${engines.length} inference provider`}
          icon={<Zap size={11} className="text-ion" />}
          hosts={engines}
          note="Bu engine'lardan herhangi biri üzerinden serve edilebilir. Her biri farklı token/saniye, farklı fiyat, farklı rate-limit sunar."
        />
      )}
      {programs.length > 0 && (
        <HostSection
          title={`Free Programs · ${programs.length} lokal runtime`}
          icon={<Package size={11} className="text-quantum" />}
          hosts={programs}
          note="Ücretsiz, senin donanımında çalışan runtime'lar. GGUF/MLX quantize edilmiş varyantları destekler."
        />
      )}
      {engines.length === 0 && programs.length === 0 && !homeConnector && (
        <div className="rounded-lg border border-dashed border-border/60 bg-elevated/30 p-4 text-center text-sm text-text-muted">
          Bu model için inference host bilgisi tanımlanmamış.
        </div>
      )}
    </div>
  );
}

function HostSection({
  title,
  icon,
  hosts,
  note,
}: {
  title: string;
  icon: React.ReactNode;
  hosts: typeof connectors;
  note: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
        {icon}
        {title}
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-text-muted">{note}</p>
      <div className="mt-3 space-y-2">
        {hosts.map((c) => {
          const isEngine = c.category === "engines";
          const isProgram = c.category === "free-programs";
          return (
            <Link
              key={c.id}
              href="/connectors"
              className={cn(
                "group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:border-border-strong",
                isEngine
                  ? "border-ion/30 bg-ion-soft/20"
                  : isProgram
                  ? "border-quantum/30 bg-quantum-soft/20"
                  : "border-border/60 bg-elevated/40"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] font-semibold",
                  isEngine
                    ? "border-ion/40 bg-ion-soft text-ion"
                    : isProgram
                    ? "border-quantum/40 bg-quantum-soft text-quantum"
                    : "border-border/60 bg-elevated text-text"
                )}
              >
                {c.shortCode}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-text">{c.name}</span>
                  {isEngine && (
                    <span className="inline-flex items-center gap-0.5 rounded border border-ion/40 bg-ion-soft px-1 py-px font-mono text-[8px] uppercase tracking-wider text-ion">
                      <Zap size={7} />
                      engine
                    </span>
                  )}
                  {isProgram && (
                    <span className="inline-flex items-center gap-0.5 rounded border border-quantum/40 bg-quantum-soft px-1 py-px font-mono text-[8px] uppercase tracking-wider text-quantum">
                      <Package size={7} />
                      program
                    </span>
                  )}
                  <ExternalLink
                    size={10}
                    className="ml-auto text-text-faint opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted line-clamp-1">
                  {c.tagline}
                </p>
                <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-2 font-mono text-[10px]">
                  <span className="text-text-faint">
                    {c.callsToday.toLocaleString("tr-TR")} çağrı bugün
                  </span>
                  <span className="text-text">
                    {c.pricing.label ||
                      (c.pricing.amountUsd != null
                        ? `$${c.pricing.amountUsd}/call`
                        : "—")}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Deploy (code snippets)
// ═══════════════════════════════════════════════════════════════════════════

function DeployTab({ model: m }: { model: LLMModel }) {
  const mainConnector = connectors.find((c) => c.id === m.connectorId);
  const snippets: { label: string; lang: string; code: string }[] = [];

  // Claude
  if (m.connectorId === "c-claude") {
    snippets.push({
      label: "Anthropic SDK · Python",
      lang: "python",
      code: `from anthropic import Anthropic\n\nclient = Anthropic()\nresp = client.messages.create(\n    model="${m.id.replace("m-", "")}",\n    max_tokens=1024,\n    messages=[{"role": "user", "content": "Hello!"}],\n)\nprint(resp.content[0].text)`,
    });
  }

  // OpenAI
  if (m.connectorId === "c-openai") {
    snippets.push({
      label: "OpenAI SDK · Python",
      lang: "python",
      code: `from openai import OpenAI\n\nclient = OpenAI()\nresp = client.chat.completions.create(\n    model="${m.id.replace("m-", "")}",\n    messages=[{"role": "user", "content": "Hello!"}],\n)\nprint(resp.choices[0].message.content)`,
    });
  }

  // HuggingFace Transformers
  if ((m.libraries || []).includes("transformers")) {
    snippets.push({
      label: "HuggingFace · transformers",
      lang: "python",
      code: `from transformers import pipeline\n\npipe = pipeline(\n    "${m.taskTypes?.[0] || "text-generation"}",\n    model="${m.vendor}/${m.name.toLowerCase().replace(/\s+/g, "-")}",\n)\nresult = pipe("Hello, how are you?")\nprint(result)`,
    });
  }

  // Ollama
  if ((m.libraries || []).includes("gguf")) {
    const ollamaName = m.name.toLowerCase().replace(/\s+/g, "-");
    snippets.push({
      label: "Ollama · local",
      lang: "bash",
      code: `# Pull & run\nollama pull ${ollamaName}\nollama run ${ollamaName} "Hello!"\n\n# Or via HTTP API\ncurl -X POST http://localhost:11434/api/generate \\\n  -d '{"model": "${ollamaName}", "prompt": "Hello!"}'`,
    });
  }

  // MLX (if supported)
  if ((m.libraries || []).includes("mlx")) {
    snippets.push({
      label: "MLX LM · Apple Silicon",
      lang: "bash",
      code: `pip install mlx-lm\n\npython -m mlx_lm.generate \\\n  --model ${m.vendor}/${m.name.toLowerCase().replace(/\s+/g, "-")}-MLX \\\n  --prompt "Hello!" \\\n  --max-tokens 256`,
    });
  }

  // vLLM
  if ((m.libraries || []).includes("vllm")) {
    snippets.push({
      label: "vLLM · production serving",
      lang: "python",
      code: `from vllm import LLM, SamplingParams\n\nllm = LLM(model="${m.vendor}/${m.name.toLowerCase().replace(/\s+/g, "-")}")\nparams = SamplingParams(temperature=0.7, max_tokens=512)\noutput = llm.generate(["Hello, Matrix!"], params)\nprint(output[0].outputs[0].text)`,
    });
  }

  // Fallback: Matrix skill snippet
  snippets.push({
    label: "Matrix Skill · this.model = (auto-routed)",
    lang: "yaml",
    code: `# SKILL.md frontmatter\n---\nname: ${m.name.toLowerCase().replace(/\s+/g, "-")}-task\nmodel: ${m.id}\ninputs: [prompt]\noutputs: [response]\nroute:\n  prefer: [${(m.hostedOn || [m.connectorId]).slice(0, 2).join(", ")}]\n  fallback: ${m.connectorId}\n---`,
  });

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-text">Deploy snippet'leri</h4>
        <p className="mt-0.5 text-xs text-text-muted">
          Modeli koda bağla.{" "}
          {mainConnector
            ? `Öntanımlı host: ${mainConnector.name}.`
            : "Host connector'ını önce TrainStation'da kur."}
        </p>
      </div>

      {snippets.map((s, idx) => (
        <CodeBlock key={idx} label={s.label} lang={s.lang} code={s.code} />
      ))}

      <div className="rounded-lg border border-nebula/25 bg-nebula-soft/20 p-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-nebula">
          <FileCode size={10} />
          İpucu
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-text">
          Bu snippet'leri tek tıkla Skill'e dönüştürmek için bir sonraki iteration'da{" "}
          <span className="font-mono text-nebula">"Model → Skill Forge"</span> akışı gelecek.
          O zamana kadar SKILL.md frontmatter'ı manuel kullanabilirsin.
        </p>
      </div>
    </div>
  );
}

function CodeBlock({
  label,
  lang,
  code,
}: {
  label: string;
  lang: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-void/60">
      <div className="flex items-center justify-between border-b border-border/40 bg-elevated/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal size={11} className="text-ion" />
          <span className="font-mono text-[11px] text-text">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
            {lang}
          </span>
          <button
            onClick={copy}
            className={cn(
              "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] transition-colors",
              copied
                ? "border-quantum/40 bg-quantum-soft text-quantum"
                : "border-border/60 bg-elevated text-text-muted hover:text-text"
            )}
          >
            <Copy size={9} />
            {copied ? "kopyalandı" : "kopyala"}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto px-3 py-3 font-mono text-[11px] leading-relaxed text-text-muted">
        <code>{code}</code>
      </pre>
    </div>
  );
}
