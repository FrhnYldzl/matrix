"use client";

import { cn } from "@/lib/cn";
import {
  priceLabel,
  statusLabels,
  statusTone,
  type Connector,
} from "@/lib/connectors";
import {
  capabilityLabels,
  capabilityTone,
  modelsForConnector,
  taskGroupOf,
  taskLabel,
  type Capability,
  type LLMModel,
  type TaskGroup,
  type TaskType,
} from "@/lib/llm-catalog";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useWorkspaceStore } from "@/lib/store";
import {
  Activity,
  Bot,
  Box,
  Coins,
  Cpu,
  KeyRound,
  Leaf,
  Library,
  MapPin,
  Package,
  Plug,
  Scale,
  ShieldAlert,
  Trash2,
  Waypoints,
  X,
  Zap,
} from "lucide-react";
import { toast } from "@/lib/toast";

const toneTextClass: Record<string, string> = {
  quantum: "text-quantum",
  ion: "text-ion",
  solar: "text-solar",
  crimson: "text-crimson",
  neutral: "text-text-muted",
};

export function ConnectorDrawer({
  connector,
  open,
  onClose,
}: {
  connector: Connector | null;
  open: boolean;
  onClose: () => void;
}) {
  const attachConnector = useWorkspaceStore((s) => s.attachConnector);
  const detachConnector = useWorkspaceStore((s) => s.detachConnector);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const attachedConnectors = useWorkspaceStore((s) => s.attachedConnectors);

  if (!open || !connector) return null;
  const tone = statusTone(connector.status);
  const isPhysical = connector.category === "physical-world" || connector.physical;
  const isEngine = connector.category === "engines";
  const isProgram = connector.category === "free-programs";

  // Bu connector mevcut workspace'e bağlı mı?
  const isAttachedToWs =
    !!currentWorkspaceId &&
    (attachedConnectors[currentWorkspaceId] ?? []).includes(connector.id);

  const action = isAttachedToWs
    ? { label: "Bağlantıyı kaldır", variant: "secondary" as const }
    : connector.status === "needs-auth"
    ? { label: "Yetkilendir & Bağla", variant: "primary" as const }
    : connector.status === "disconnected"
    ? { label: "Workspace'e bağla", variant: "primary" as const }
    : connector.status === "connected"
    ? { label: "Workspace'e bağla", variant: "primary" as const }
    : { label: "Tekrar dene", variant: "secondary" as const };

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        onClick={onClose}
        aria-label="Kapat"
        className="flex-1 bg-void/70 backdrop-blur-sm"
      />
      <aside className="flex h-full w-full max-w-xl flex-col border-l border-border/70 bg-surface/95 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        <header className="flex items-start justify-between gap-3 border-b border-border/60 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border font-mono text-sm font-semibold",
                isPhysical
                  ? "border-solar/40 bg-solar-soft text-solar"
                  : isEngine
                  ? "border-ion/40 bg-ion-soft text-ion"
                  : isProgram
                  ? "border-quantum/40 bg-quantum-soft text-quantum"
                  : "border-border/60 bg-elevated text-text"
              )}
            >
              {connector.shortCode}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-text">{connector.name}</h3>
                {isPhysical && <Badge tone="solar"><MapPin size={9} className="mr-1" />Fiziksel</Badge>}
                {isEngine && <Badge tone="ion"><Cpu size={9} className="mr-1" />Engine</Badge>}
                {isProgram && <Badge tone="quantum"><Package size={9} className="mr-1" />Free Program</Badge>}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-text-faint truncate">
                {connector.vendor}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-text-muted hover:bg-elevated hover:text-text"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status panel */}
          <div
            className={cn(
              "rounded-lg border p-4",
              tone === "quantum" && "border-quantum/30 bg-quantum-soft/20",
              tone === "solar" && "border-solar/30 bg-solar-soft/20",
              tone === "crimson" && "border-crimson/30 bg-crimson-soft/20",
              tone === "neutral" && "border-border/60 bg-elevated/40"
            )}
          >
            <div className="flex items-center gap-2">
              <Activity size={13} className={toneTextClass[tone]} />
              <span className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", toneTextClass[tone])}>
                {statusLabels[connector.status]}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-text leading-relaxed">{connector.tagline}</p>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
              <Stat label="Bugünkü çağrı" value={connector.callsToday.toLocaleString("tr-TR")} mono />
              <Stat
                label="Hata oranı"
                value={`%${(connector.errorRate * 100).toFixed(2)}`}
                mono
                highlight={connector.errorRate > 0.05 ? "crimson" : undefined}
              />
              {connector.rateLimitUsed != null && (
                <Stat
                  label="Rate-limit"
                  value={`%${connector.rateLimitUsed}`}
                  mono
                  highlight={connector.rateLimitUsed > 80 ? "solar" : undefined}
                />
              )}
              <Stat
                label="Auth"
                value={connector.authType}
                mono
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg border border-border/60 bg-elevated/30 p-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
              <Coins size={11} className="text-solar" />
              Fiyatlandırma
            </div>
            <div className="mt-2 text-sm text-text">{priceLabel(connector.pricing)}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
              Matrix bu connector'ın her çalıştırmasını maliyet kaydına işler. Workflow/skill
              maliyet kartlarında ve Insights ROI hesabında görünür.
            </p>
          </div>

          {/* Scope badges */}
          {connector.scopes && connector.scopes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                <ShieldAlert size={11} className="text-nebula" />
                Yetki scope'ları
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {connector.scopes.map((s) => (
                  <Badge
                    key={s}
                    tone={
                      s === "external-send"
                        ? "crimson"
                        : s === "write"
                        ? "ion"
                        : "neutral"
                    }
                  >
                    {s}
                  </Badge>
                ))}
              </div>
              {connector.scopes.includes("external-send") && (
                <p className="mt-2 text-[11px] leading-relaxed text-crimson">
                  ⚠ external-send aktif: bu connector dışarıya mesaj/para/emir gönderir; her
                  tetikleme insan onayı kuyruğundan geçer.
                </p>
              )}
            </div>
          )}

          {/* Models & Capabilities (AI foundries + Engines) */}
          {(connector.category === "ai" || connector.category === "engines") && (
            <ModelsSection connector={connector} />
          )}

          {/* Linked skills/workflows */}
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
              <Plug size={11} />
              Bağlı Varlıklar
            </div>
            <div className="mt-2 space-y-3">
              {connector.usedBySkillNames && connector.usedBySkillNames.length > 0 && (
                <div>
                  <div className="mb-1 flex items-center gap-1 text-[11px] text-text-muted">
                    <Bot size={11} /> Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {connector.usedBySkillNames.map((n) => (
                      <span
                        key={n}
                        className="rounded border border-nebula/30 bg-nebula-soft/40 px-2 py-0.5 font-mono text-[11px] text-nebula"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {connector.usedByWorkflowNames && connector.usedByWorkflowNames.length > 0 && (
                <div>
                  <div className="mb-1 flex items-center gap-1 text-[11px] text-text-muted">
                    <Waypoints size={11} /> Workflows
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {connector.usedByWorkflowNames.map((n) => (
                      <span
                        key={n}
                        className="rounded border border-quantum/30 bg-quantum-soft/40 px-2 py-0.5 font-mono text-[11px] text-quantum"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(!connector.usedBySkillNames || connector.usedBySkillNames.length === 0) &&
                (!connector.usedByWorkflowNames || connector.usedByWorkflowNames.length === 0) && (
                  <div className="rounded-md border border-dashed border-border/60 bg-elevated/30 p-3 text-xs text-text-muted">
                    Henüz hiçbir skill veya workflow bu connector'ı kullanmıyor.
                    İlk bağlantıyı kurmak için Library → Skill Inspector'dan seç.
                  </div>
                )}
            </div>
          </div>
        </div>

        <footer className="flex items-center gap-2 border-t border-border/60 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-crimson hover:bg-crimson/10"
            onClick={() =>
              toast({
                tone: "crimson",
                title: `${connector.name} bağlantısı kaldırılacak`,
                description: "Bu aksiyon ilgili workspace'lerdeki skill/workflow'ları etkiler. Gerçek silme backend'de onay gerektirecek.",
              })
            }
          >
            <Trash2 size={12} />
            Bağlantıyı kaldır
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              className="gap-1.5"
              onClick={() =>
                toast({
                  tone: connector.status === "connected" ? "quantum" : "solar",
                  title: "Test çağrısı",
                  description:
                    connector.status === "connected"
                      ? `${connector.name} — 200 OK, 142ms. Rate-limit kullanımı %${connector.rateLimitUsed ?? 12}.`
                      : `${connector.name} bağlı değil — önce yetkilendirme tamamlanmalı.`,
                })
              }
            >
              <Zap size={13} />
              Test çağrısı
            </Button>
            <Button
              variant={action.variant}
              size="md"
              className="gap-1.5"
              onClick={() => {
                if (!currentWorkspaceId) {
                  toast({
                    tone: "solar",
                    title: "Önce workspace seç",
                    description: "Connector bir workspace'e bağlanır — sol üstten bir asset seç.",
                  });
                  return;
                }
                if (isAttachedToWs) {
                  detachConnector(connector.id, currentWorkspaceId);
                  toast({
                    tone: "nebula",
                    title: `${connector.name} bağlantısı kaldırıldı`,
                    description: "Bu workspace'in agent'ları artık bu connector'ı kullanamaz.",
                  });
                } else {
                  attachConnector(connector.id, currentWorkspaceId);
                  // Bağlantı başarılı toast'u dopamine engine veriyor (+40 XP)
                  // Ayrıca açıklayıcı toast — OAuth flow stub mesajı
                  if (connector.status === "needs-auth" || connector.status === "disconnected") {
                    toast({
                      tone: "solar",
                      title: "OAuth/API key gerekli",
                      description: `${connector.name} bağlandı ama gerçek auth flow prod'da açılır. Şimdilik mock mode aktif.`,
                      ttlMs: 6000,
                    });
                  }
                }
              }}
            >
              <KeyRound size={13} />
              {action.label}
            </Button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

function ModelsSection({ connector }: { connector: Connector }) {
  const models = modelsForConnector(connector.id);
  if (models.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          <Box size={11} className="text-nebula" />
          Models & Capabilities
        </div>
        <div className="mt-2 rounded-md border border-dashed border-border/60 bg-elevated/30 p-3 text-xs text-text-muted">
          Bu connector için model kataloğu tanımlanmadı.
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          <Box size={11} className="text-nebula" />
          Models & Capabilities
        </div>
        <span className="font-mono text-[10px] text-text-faint">{models.length} model</span>
      </div>
      <ul className="mt-2 space-y-2">
        {models.map((m) => (
          <ModelRow key={m.id} model={m} />
        ))}
      </ul>
    </div>
  );
}

function ModelRow({ model }: { model: LLMModel }) {
  return (
    <li className="rounded-lg border border-border/60 bg-elevated/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-text">{model.name}</span>
            {model.status !== "ga" && (
              <span className="rounded border border-solar/30 bg-solar-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-solar">
                {model.status}
              </span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-text-faint truncate">
            {model.vendor} · {model.contextWindow > 0 ? `${(model.contextWindow / 1000).toFixed(0)}K ctx` : "—"}
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-text-muted line-clamp-2">
            {model.tagline}
          </p>
        </div>
        {model.outputCostPerMTok != null && (
          <div className="shrink-0 text-right font-mono text-[10px] text-text-muted">
            <div className="text-text">${model.outputCostPerMTok}/M out</div>
            {model.inputCostPerMTok != null && (
              <div className="text-text-faint">${model.inputCostPerMTok}/M in</div>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {model.capabilities.map((c) => (
          <CapabilityChip key={c} cap={c} />
        ))}
      </div>

      {/* HF-style task tags */}
      {model.taskTypes && model.taskTypes.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {model.taskTypes.slice(0, 6).map((t) => (
            <TaskChip key={t} task={t} />
          ))}
          {model.taskTypes.length > 6 && (
            <span className="rounded border border-border/60 bg-elevated/50 px-1.5 py-0.5 font-mono text-[9px] text-text-faint">
              +{model.taskTypes.length - 6}
            </span>
          )}
        </div>
      )}

      {/* HF-grade metadata strip */}
      {(model.parameters != null ||
        model.license ||
        model.architecture ||
        (model.precision && model.precision.length > 0) ||
        model.carbonGCO2PerMTok != null) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-text-muted">
          {model.parameters != null && model.parameters > 0 && (
            <span className="inline-flex items-center gap-1">
              <Cpu size={9} className="text-ion" />
              <b className="text-text">{model.parameters}B</b> params
            </span>
          )}
          {model.architecture && (
            <span className="inline-flex items-center gap-1">
              <Box size={9} className="text-nebula" />
              {model.architecture}
            </span>
          )}
          {model.precision && model.precision.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="text-text-faint">precision</span>
              <span className="text-text">{model.precision.join(", ")}</span>
            </span>
          )}
          {model.license && (
            <span className="inline-flex items-center gap-1">
              <Scale size={9} className="text-solar" />
              <span className="text-text">{model.license}</span>
            </span>
          )}
          {model.carbonGCO2PerMTok != null && (
            <span className="inline-flex items-center gap-1 text-quantum">
              <Leaf size={9} />
              {model.carbonGCO2PerMTok} gCO₂/M
            </span>
          )}
        </div>
      )}

      {/* Libraries */}
      {model.libraries && model.libraries.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <Library size={9} className="text-text-faint" />
          {model.libraries.slice(0, 6).map((lib) => (
            <span
              key={lib}
              className="rounded border border-border/60 bg-elevated/60 px-1.5 py-0.5 font-mono text-[9px] text-text-muted"
            >
              {lib}
            </span>
          ))}
          {model.libraries.length > 6 && (
            <span className="font-mono text-[9px] text-text-faint">
              +{model.libraries.length - 6}
            </span>
          )}
        </div>
      )}

      {/* Hosted on Engines */}
      {model.hostedOn && model.hostedOn.length > 1 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
            engines
          </span>
          {model.hostedOn.slice(0, 5).map((h) => (
            <span
              key={h}
              className="inline-flex items-center gap-0.5 rounded border border-ion/30 bg-ion-soft/40 px-1.5 py-0.5 font-mono text-[9px] text-ion"
            >
              <Cpu size={8} />
              {h.replace(/^c-/, "")}
            </span>
          ))}
          {model.hostedOn.length > 5 && (
            <span className="font-mono text-[9px] text-text-faint">
              +{model.hostedOn.length - 5}
            </span>
          )}
        </div>
      )}
    </li>
  );
}

const taskGroupClass: Record<TaskGroup, string> = {
  multimodal: "text-ion border-ion/30 bg-ion-soft/60",
  vision: "text-nebula border-nebula/30 bg-nebula-soft/60",
  nlp: "text-quantum border-quantum/30 bg-quantum-soft/60",
  audio: "text-solar border-solar/30 bg-solar-soft/60",
  tabular: "text-text-muted border-border/60 bg-elevated/60",
  "rl-other": "text-crimson border-crimson/30 bg-crimson-soft/60",
};

function TaskChip({ task }: { task: TaskType }) {
  const group = taskGroupOf[task];
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 font-mono text-[9px]",
        taskGroupClass[group]
      )}
      title={group}
    >
      {taskLabel[task]}
    </span>
  );
}

function CapabilityChip({ cap }: { cap: Capability }) {
  const tone = capabilityTone[cap];
  const label = capabilityLabels[cap];
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
    <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider", cls)}>
      {label}
    </span>
  );
}

function Stat({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
  highlight?: "crimson" | "solar";
}) {
  const cls = highlight === "crimson" ? "text-crimson" : highlight === "solar" ? "text-solar" : "text-text";
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-text-faint">{label}</div>
      <div className={cn("mt-0.5 text-sm", mono ? "font-mono" : "", cls)}>{value}</div>
    </div>
  );
}
