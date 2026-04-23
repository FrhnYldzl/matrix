"use client";

/**
 * "The Source" — Matrix'in merkezi model kütüphanesi.
 *
 * Neo'nun filmde ulaştığı The Source gibi, burası her yapay zihnin (LLM)
 * kökenini tuttuğumuz yer. HuggingFace'in /models sayfasına paralel bir
 * deneyim: sol filtre paneli + sağ arama/grid.
 *
 * Filtreler (AND logic):
 *   Task (grouped)    — text-generation, ASR, image-to-text ...
 *   Library           — transformers, pytorch, gguf, vllm, mlx ...
 *   License           — apache-2.0, mit, llama-4, proprietary-*, ...
 *   Parameters        — <1B, 1–10B, 10–70B, 70B+, proprietary
 *   Architecture      — dense, moe, hybrid
 *   Precision         — fp16, bf16, int8, int4, ...
 *   Capability        — Matrix'in semantic layer (akıl yürütme, kod, ses...)
 *   Engine available  — hosted on at least one Engine connector
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  capabilityLabels,
  capabilityTone,
  llmModels,
  taskGroupOf,
  taskLabel,
  type Capability,
  type LLMModel,
  type TaskGroup,
  type TaskType,
} from "@/lib/llm-catalog";
import { connectors } from "@/lib/connectors";
import { MatrixHexGrid } from "@/components/brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "@/components/brand/MatrixQuote";
import { ModelDetailDrawer } from "./ModelDetailDrawer";
import {
  Binary,
  Box,
  ChevronDown,
  Cpu,
  Database,
  Filter,
  GitBranch,
  Leaf,
  Library as LibraryIcon,
  Package,
  Scale,
  Search,
  Sparkles,
  Tag,
  X,
  Zap,
} from "lucide-react";

type ParamBucket = "<1B" | "1-10B" | "10-70B" | "70B+" | "proprietary";

const paramBucketOf = (n?: number): ParamBucket => {
  if (n == null || n === 0) return "proprietary";
  if (n < 1) return "<1B";
  if (n < 10) return "1-10B";
  if (n < 70) return "10-70B";
  return "70B+";
};

const taskGroupLabel: Record<TaskGroup, string> = {
  multimodal: "Multimodal",
  vision: "Computer Vision",
  nlp: "Natural Language",
  audio: "Audio",
  tabular: "Tabular",
  "rl-other": "RL · Other",
};

const taskGroupAccent: Record<TaskGroup, string> = {
  multimodal: "text-ion",
  vision: "text-nebula",
  nlp: "text-quantum",
  audio: "text-solar",
  tabular: "text-text-muted",
  "rl-other": "text-crimson",
};

const taskGroupOrder: TaskGroup[] = [
  "multimodal",
  "vision",
  "nlp",
  "audio",
  "tabular",
  "rl-other",
];

// ---------------------------------------------------------------------------
// Facet helpers — compute (value → count) maps over the full catalog
// ---------------------------------------------------------------------------

function countBy<T extends string | number>(
  items: LLMModel[],
  key: (m: LLMModel) => T[]
): Map<T, number> {
  const counts = new Map<T, number>();
  items.forEach((m) => {
    const vals = key(m);
    const seen = new Set<T>();
    vals.forEach((v) => {
      if (seen.has(v)) return;
      seen.add(v);
      counts.set(v, (counts.get(v) || 0) + 1);
    });
  });
  return counts;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function TheSourcePage() {
  const [query, setQuery] = useState("");
  const [detailModel, setDetailModel] = useState<LLMModel | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<TaskType>>(new Set());
  const [selectedLibs, setSelectedLibs] = useState<Set<string>>(new Set());
  const [selectedLicenses, setSelectedLicenses] = useState<Set<string>>(new Set());
  const [selectedParams, setSelectedParams] = useState<Set<ParamBucket>>(new Set());
  const [selectedArch, setSelectedArch] = useState<Set<string>>(new Set());
  const [selectedPrecision, setSelectedPrecision] = useState<Set<string>>(new Set());
  const [selectedCaps, setSelectedCaps] = useState<Set<Capability>>(new Set());
  const [engineOnly, setEngineOnly] = useState(false);
  const [sort, setSort] = useState<"default" | "params-desc" | "context-desc" | "cost-asc">(
    "default"
  );

  // Pre-compute facet counts off the full catalog
  const facets = useMemo(() => {
    const tasks = countBy(llmModels, (m) => m.taskTypes || []);
    const libs = countBy(llmModels, (m) => m.libraries || []);
    const licenses = countBy(llmModels, (m) =>
      m.license ? [m.license] : []
    );
    const params = countBy(llmModels, (m) => [paramBucketOf(m.parameters)]);
    const arch = countBy<string>(llmModels, (m) =>
      m.architecture ? [m.architecture] : []
    );
    const precision = countBy<string>(llmModels, (m) => m.precision || []);
    const caps = countBy(llmModels, (m) => m.capabilities);
    return { tasks, libs, licenses, params, arch, precision, caps };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = llmModels.filter((m) => {
      if (
        q &&
        !m.name.toLowerCase().includes(q) &&
        !m.tagline.toLowerCase().includes(q) &&
        !m.vendor.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (
        selectedTasks.size > 0 &&
        !(m.taskTypes || []).some((t) => selectedTasks.has(t))
      ) {
        return false;
      }
      if (
        selectedLibs.size > 0 &&
        !(m.libraries || []).some((l) => selectedLibs.has(l))
      ) {
        return false;
      }
      if (selectedLicenses.size > 0 && !selectedLicenses.has(m.license || "")) {
        return false;
      }
      if (
        selectedParams.size > 0 &&
        !selectedParams.has(paramBucketOf(m.parameters))
      ) {
        return false;
      }
      if (
        selectedArch.size > 0 &&
        !selectedArch.has(m.architecture || "")
      ) {
        return false;
      }
      if (
        selectedPrecision.size > 0 &&
        !(m.precision || []).some((p) => selectedPrecision.has(p))
      ) {
        return false;
      }
      if (
        selectedCaps.size > 0 &&
        !m.capabilities.some((c) => selectedCaps.has(c))
      ) {
        return false;
      }
      if (engineOnly) {
        const hosts = m.hostedOn || [];
        const hasEngine = hosts.some((h) => {
          const c = connectors.find((x) => x.id === h);
          return c?.category === "engines";
        });
        if (!hasEngine) return false;
      }
      return true;
    });

    if (sort === "params-desc") {
      out = [...out].sort(
        (a, b) => (b.parameters ?? -1) - (a.parameters ?? -1)
      );
    } else if (sort === "context-desc") {
      out = [...out].sort((a, b) => b.contextWindow - a.contextWindow);
    } else if (sort === "cost-asc") {
      out = [...out].sort((a, b) => {
        const pa = a.outputCostPerMTok ?? Infinity;
        const pb = b.outputCostPerMTok ?? Infinity;
        return pa - pb;
      });
    }

    return out;
  }, [
    query,
    selectedTasks,
    selectedLibs,
    selectedLicenses,
    selectedParams,
    selectedArch,
    selectedPrecision,
    selectedCaps,
    engineOnly,
    sort,
  ]);

  const totalSelected =
    selectedTasks.size +
    selectedLibs.size +
    selectedLicenses.size +
    selectedParams.size +
    selectedArch.size +
    selectedPrecision.size +
    selectedCaps.size +
    (engineOnly ? 1 : 0);

  const clearAll = () => {
    setSelectedTasks(new Set());
    setSelectedLibs(new Set());
    setSelectedLicenses(new Set());
    setSelectedParams(new Set());
    setSelectedArch(new Set());
    setSelectedPrecision(new Set());
    setSelectedCaps(new Set());
    setEngineOnly(false);
  };

  const toggleSetItem = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, v: T) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-surface/60 p-6 backdrop-blur-md">
        <MatrixHexGrid tone="nebula" opacity={0.08} />
        <div className="pointer-events-none absolute -top-10 right-10 h-40 w-[420px] rounded-full bg-nebula/15 blur-3xl" />
        <div className="pointer-events-none absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              <Database size={11} className="text-nebula" />
              The Source · Matrix'in zihin kütüphanesi
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text">
              Her yapay zihin bir kapıdır.
              <span className="ml-2 text-nebula">Doğru olanı seç.</span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              HuggingFace paradigmasında tasarlanmış model kataloğu — Task,
              Library, Lisans, Parametre ve Inference availability filtreleriyle{" "}
              <span className="text-text">{llmModels.length} model</span> tek kapıdan
              aranıyor. Her model hem connector rotalarını hem de lokal runtime
              ("Free Programs") uyumluluğunu taşır.
            </p>
          </div>
          <div className="hidden shrink-0 rounded-lg border border-nebula/30 bg-nebula-soft/30 p-4 text-center md:block">
            <div className="font-mono text-[10px] uppercase tracking-wider text-nebula">
              Katalog
            </div>
            <div className="mt-1 font-mono text-3xl font-semibold text-text">
              {llmModels.length}
            </div>
            <div className="mt-1 font-mono text-[10px] text-text-faint">model · aktif</div>
          </div>
        </div>
        <div className="relative mt-5">
          <MatrixQuote speaker={MODULE_QUOTES["/models"].speaker} tone={MODULE_QUOTES["/models"].tone}>
            {MODULE_QUOTES["/models"].line}
          </MatrixQuote>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
        {/* ──── LEFT: Filter panel ──── */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-surface/70 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                <Filter size={11} className="text-nebula" />
                Filtreler
                {totalSelected > 0 && (
                  <span className="ml-1 rounded-md bg-nebula-soft px-1.5 py-0.5 font-mono text-[9px] text-nebula">
                    {totalSelected}
                  </span>
                )}
              </div>
              {totalSelected > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 font-mono text-[10px] text-text-muted hover:text-text"
                >
                  <X size={10} />
                  temizle
                </button>
              )}
            </div>

            {/* Engine availability toggle */}
            <div className="border-b border-border/40 px-4 py-3">
              <label className="flex cursor-pointer items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-text">
                  <Zap size={11} className="text-ion" />
                  Inference available
                </span>
                <button
                  onClick={() => setEngineOnly((v) => !v)}
                  className={cn(
                    "relative h-4 w-7 rounded-full border transition-colors",
                    engineOnly
                      ? "border-ion/60 bg-ion/40"
                      : "border-border/60 bg-elevated/60"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-3 w-3 rounded-full bg-text transition-all",
                      engineOnly ? "left-3.5" : "left-0.5"
                    )}
                  />
                </button>
              </label>
              <p className="mt-1 font-mono text-[9px] text-text-faint">
                en az bir Engine connector tarafından host ediliyor
              </p>
            </div>

            {/* Tasks — grouped by TaskGroup */}
            <FacetSection
              title="Tasks"
              icon={<Sparkles size={11} className="text-nebula" />}
              defaultOpen
            >
              {taskGroupOrder.map((g) => {
                const tasksInGroup = Object.keys(taskGroupOf).filter(
                  (t) => taskGroupOf[t as TaskType] === g
                ) as TaskType[];
                const groupCount = tasksInGroup.reduce(
                  (sum, t) => sum + (facets.tasks.get(t) || 0),
                  0
                );
                if (groupCount === 0) return null;
                return (
                  <div key={g} className="mb-3 last:mb-0">
                    <div
                      className={cn(
                        "mb-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider",
                        taskGroupAccent[g]
                      )}
                    >
                      <span>{taskGroupLabel[g]}</span>
                      <span className="text-text-faint">{groupCount}</span>
                    </div>
                    <div className="space-y-0.5">
                      {tasksInGroup
                        .filter((t) => (facets.tasks.get(t) || 0) > 0)
                        .map((t) => (
                          <FacetRow
                            key={t}
                            label={taskLabel[t]}
                            count={facets.tasks.get(t) || 0}
                            active={selectedTasks.has(t)}
                            onClick={() => toggleSetItem(setSelectedTasks, t)}
                          />
                        ))}
                    </div>
                  </div>
                );
              })}
            </FacetSection>

            {/* Libraries */}
            <FacetSection
              title="Libraries"
              icon={<LibraryIcon size={11} className="text-ion" />}
            >
              {[...facets.libs.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([lib, count]) => (
                  <FacetRow
                    key={lib}
                    label={lib}
                    count={count}
                    active={selectedLibs.has(lib)}
                    onClick={() => toggleSetItem(setSelectedLibs, lib)}
                  />
                ))}
            </FacetSection>

            {/* Licenses */}
            <FacetSection
              title="Licenses"
              icon={<Scale size={11} className="text-solar" />}
            >
              {[...facets.licenses.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([lic, count]) => (
                  <FacetRow
                    key={lic}
                    label={lic}
                    count={count}
                    active={selectedLicenses.has(lic)}
                    onClick={() => toggleSetItem(setSelectedLicenses, lic)}
                  />
                ))}
            </FacetSection>

            {/* Parameters */}
            <FacetSection
              title="Parameters"
              icon={<Cpu size={11} className="text-quantum" />}
            >
              {(["<1B", "1-10B", "10-70B", "70B+", "proprietary"] as ParamBucket[])
                .filter((b) => (facets.params.get(b) || 0) > 0)
                .map((b) => (
                  <FacetRow
                    key={b}
                    label={b}
                    count={facets.params.get(b) || 0}
                    active={selectedParams.has(b)}
                    onClick={() => toggleSetItem(setSelectedParams, b)}
                  />
                ))}
            </FacetSection>

            {/* Architecture */}
            <FacetSection
              title="Architecture"
              icon={<GitBranch size={11} className="text-nebula" />}
            >
              {[...facets.arch.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([a, count]) => (
                  <FacetRow
                    key={a}
                    label={a}
                    count={count}
                    active={selectedArch.has(a)}
                    onClick={() => toggleSetItem(setSelectedArch, a)}
                  />
                ))}
            </FacetSection>

            {/* Precision */}
            <FacetSection
              title="Precision"
              icon={<Binary size={11} className="text-ion" />}
            >
              {["fp32", "fp16", "bf16", "int8", "int4", "int2"]
                .filter((p) => (facets.precision.get(p) || 0) > 0)
                .map((p) => (
                  <FacetRow
                    key={p}
                    label={p}
                    count={facets.precision.get(p) || 0}
                    active={selectedPrecision.has(p)}
                    onClick={() => toggleSetItem(setSelectedPrecision, p)}
                  />
                ))}
            </FacetSection>

            {/* Capability (Matrix semantic layer) */}
            <FacetSection
              title="Capability · Matrix layer"
              icon={<Tag size={11} className="text-nebula" />}
            >
              {[...facets.caps.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([cap, count]) => (
                  <FacetRow
                    key={cap}
                    label={capabilityLabels[cap]}
                    count={count}
                    active={selectedCaps.has(cap)}
                    onClick={() => toggleSetItem(setSelectedCaps, cap)}
                    tone={capabilityTone[cap]}
                  />
                ))}
            </FacetSection>
          </div>
        </aside>

        {/* ──── RIGHT: Model grid ──── */}
        <section className="space-y-4">
          {/* Search + sort */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/60 bg-surface/70 px-3 py-2 backdrop-blur-md">
              <Search size={13} className="text-text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Model ara (ör. 'whisper', 'llama', 'gpt-4')"
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                sırala
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-md border border-border/60 bg-surface/70 px-2 py-1.5 text-xs text-text focus:border-ion/60 focus:outline-none"
              >
                <option value="default">Varsayılan</option>
                <option value="params-desc">Parametre ↓</option>
                <option value="context-desc">Bağlam ↓</option>
                <option value="cost-asc">Çıktı maliyeti ↑</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
              {filtered.length} / {llmModels.length} model
            </div>
            {totalSelected > 0 && (
              <div className="font-mono text-[10px] text-nebula">
                {totalSelected} aktif filtre
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {filtered.map((m) => (
              <ModelCard key={m.id} model={m} onOpen={() => setDetailModel(m)} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-border/60 bg-surface/50 p-10 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-elevated text-text-faint">
                  <Database size={16} />
                </div>
                <div className="text-sm text-text">
                  Bu filtre kombinasyonuyla eşleşen model yok.
                </div>
                <button
                  onClick={clearAll}
                  className="mt-3 text-xs text-nebula hover:text-text"
                >
                  Filtreleri temizle →
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <ModelDetailDrawer
        model={detailModel}
        open={detailModel != null}
        onClose={() => setDetailModel(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Facet section — collapsible group of filter rows
// ---------------------------------------------------------------------------

function FacetSection({
  title,
  icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-border/40 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-elevated/40"
      >
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          {icon}
          {title}
        </span>
        <ChevronDown
          size={12}
          className={cn(
            "text-text-faint transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual filter row — label · count · check
// ---------------------------------------------------------------------------

function FacetRow({
  label,
  count,
  active,
  onClick,
  tone,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "ion" | "nebula" | "quantum" | "solar" | "crimson";
}) {
  const activeTone =
    tone === "ion"
      ? "text-ion"
      : tone === "quantum"
      ? "text-quantum"
      : tone === "solar"
      ? "text-solar"
      : tone === "crimson"
      ? "text-crimson"
      : "text-nebula";
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded px-1.5 py-1 text-left text-[11px] transition-colors",
        active
          ? "bg-elevated/60 " + activeTone
          : "text-text-muted hover:bg-elevated/30 hover:text-text"
      )}
    >
      <span className="flex items-center gap-1.5 min-w-0 truncate">
        <span
          className={cn(
            "h-2.5 w-2.5 shrink-0 rounded-sm border",
            active
              ? "border-current bg-current"
              : "border-border/60 bg-transparent"
          )}
        />
        <span className="truncate">{label}</span>
      </span>
      <span className="font-mono text-[9px] text-text-faint">{count}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Model card — HF-style compact summary
// ---------------------------------------------------------------------------

function ModelCard({ model: m, onOpen }: { model: LLMModel; onOpen?: () => void }) {
  const homeConnector = connectors.find((c) => c.id === m.connectorId);
  const engineHosts = (m.hostedOn || []).filter((h) => {
    const c = connectors.find((x) => x.id === h);
    return c?.category === "engines";
  });

  return (
    <button
      onClick={onOpen}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-surface/70 p-4 text-left backdrop-blur-sm transition-all hover:border-border-strong"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-nebula/40 bg-nebula-soft/60 text-nebula">
            <Box size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-text">
                {m.name}
              </span>
              {m.status !== "ga" && (
                <span className="rounded border border-solar/30 bg-solar-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-solar">
                  {m.status}
                </span>
              )}
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-text-faint truncate">
              {m.vendor} · {m.contextWindow > 0 ? `${(m.contextWindow / 1000).toFixed(0)}K ctx` : "—"}
            </div>
          </div>
        </div>

        {/* Right: cost */}
        <div className="shrink-0 text-right font-mono text-[10px]">
          {m.outputCostPerMTok != null ? (
            <>
              <div className="text-text">${m.outputCostPerMTok}/M</div>
              <div className="text-text-faint">out</div>
            </>
          ) : (
            <div className="text-quantum">free</div>
          )}
        </div>
      </div>

      {/* Tagline */}
      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-text-muted">
        {m.tagline}
      </p>

      {/* Metadata strip */}
      {(m.parameters != null ||
        m.license ||
        m.architecture ||
        (m.precision && m.precision.length > 0) ||
        m.carbonGCO2PerMTok != null) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-text-muted">
          {m.parameters != null && m.parameters > 0 && (
            <span className="inline-flex items-center gap-1">
              <Cpu size={9} className="text-quantum" />
              <b className="text-text">{m.parameters}B</b>
            </span>
          )}
          {m.architecture && (
            <span className="inline-flex items-center gap-1">
              <GitBranch size={9} className="text-nebula" />
              {m.architecture}
            </span>
          )}
          {m.license && (
            <span className="inline-flex items-center gap-1">
              <Scale size={9} className="text-solar" />
              {m.license}
            </span>
          )}
          {m.precision && m.precision.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Binary size={9} className="text-ion" />
              {m.precision.join(",")}
            </span>
          )}
          {m.carbonGCO2PerMTok != null && (
            <span className="inline-flex items-center gap-1 text-quantum">
              <Leaf size={9} />
              {m.carbonGCO2PerMTok} gCO₂/M
            </span>
          )}
        </div>
      )}

      {/* Task chips */}
      {m.taskTypes && m.taskTypes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {m.taskTypes.slice(0, 5).map((t) => {
            const g = taskGroupOf[t];
            const cls = taskGroupChipClass[g];
            return (
              <span
                key={t}
                className={cn("rounded border px-1.5 py-0.5 font-mono text-[9px]", cls)}
                title={g}
              >
                {taskLabel[t]}
              </span>
            );
          })}
        </div>
      )}

      {/* Libraries */}
      {m.libraries && m.libraries.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <LibraryIcon size={9} className="text-text-faint" />
          {m.libraries.slice(0, 5).map((lib) => (
            <span
              key={lib}
              className="rounded border border-border/60 bg-elevated/60 px-1.5 py-0.5 font-mono text-[9px] text-text-muted"
            >
              {lib}
            </span>
          ))}
          {m.libraries.length > 5 && (
            <span className="font-mono text-[9px] text-text-faint">
              +{m.libraries.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Hosts */}
      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
        <div className="flex items-center gap-1.5">
          {homeConnector && (
            <span
              className="inline-flex items-center gap-1 rounded border border-border/60 bg-elevated/50 px-1.5 py-0.5 font-mono text-[9px] text-text-muted"
              title={`Ana host: ${homeConnector.name}`}
            >
              <Package size={8} />
              {homeConnector.shortCode}
            </span>
          )}
          {engineHosts.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded border border-ion/30 bg-ion-soft/40 px-1.5 py-0.5 font-mono text-[9px] text-ion">
              <Zap size={8} />
              {engineHosts.length} engine
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {m.capabilities.slice(0, 3).map((c) => {
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
                  "rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                  cls
                )}
              >
                {capabilityLabels[c]}
              </span>
            );
          })}
          {m.capabilities.length > 3 && (
            <span className="font-mono text-[9px] text-text-faint">
              +{m.capabilities.length - 3}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

const taskGroupChipClass: Record<TaskGroup, string> = {
  multimodal: "text-ion border-ion/30 bg-ion-soft/60",
  vision: "text-nebula border-nebula/30 bg-nebula-soft/60",
  nlp: "text-quantum border-quantum/30 bg-quantum-soft/60",
  audio: "text-solar border-solar/30 bg-solar-soft/60",
  tabular: "text-text-muted border-border/60 bg-elevated/60",
  "rl-other": "text-crimson border-crimson/30 bg-crimson-soft/60",
};
