"use client";

import { useState } from "react";
import type { Node } from "@xyflow/react";
import type { WorkflowStep, WorkflowTrigger } from "@/lib/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ModelPicker } from "../models/ModelPicker";
import { toast } from "@/lib/toast";
import { FileCode, Trash2, Pencil, X } from "lucide-react";

export function WorkflowInspector({
  node,
  onClose,
}: {
  node: Node | null;
  onClose: () => void;
}) {
  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-border/60 bg-surface/50">
      {!node ? (
        <Empty />
      ) : node.type === "trigger" ? (
        <TriggerInspector node={node} onClose={onClose} />
      ) : (
        <StepInspector node={node} onClose={onClose} />
      )}
    </aside>
  );
}

function Empty() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-elevated/50 text-text-muted">
        <Pencil size={18} strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 text-sm font-medium text-text">Bir adım seç</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
        Canvas'taki bir trigger veya adıma tıkla — detaylar ve düzenleme burada açılır.
      </p>
    </div>
  );
}

function TriggerInspector({ node, onClose }: { node: Node; onClose: () => void }) {
  const t = (node.data as { trigger: WorkflowTrigger }).trigger;
  return (
    <>
      <Header title="Trigger" tone="solar" onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <Field label="Kind">
          <span className="font-mono text-sm">{t.kind}</span>
        </Field>
        {t.kind === "schedule" && (
          <>
            <Field label="Cron">
              <input
                defaultValue={t.cron}
                className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm outline-none focus:border-solar/50"
              />
            </Field>
            <Field label="Timezone">
              <input
                defaultValue={t.timezone || "Europe/Istanbul"}
                className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm outline-none focus:border-solar/50"
              />
            </Field>
          </>
        )}
        {t.kind === "webhook" && (
          <Field label="Webhook path">
            <input
              defaultValue={t.webhookPath}
              className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm outline-none focus:border-solar/50"
            />
          </Field>
        )}
        {t.kind === "manual" && (
          <div className="rounded-lg border border-border/60 bg-elevated/40 p-3 text-xs text-text-muted">
            Bu workflow sadece Control Room veya CLI üzerinden manuel tetiklenir.
          </div>
        )}
      </div>
    </>
  );
}

function StepInspector({ node, onClose }: { node: Node; onClose: () => void }) {
  const step = (node.data as { step: WorkflowStep; index: number }).step;
  const [modelRef, setModelRef] = useState<string | undefined>(step.modelRef);
  const stepTone =
    step.kind === "skill"
      ? "nebula"
      : step.kind === "integration"
      ? "ion"
      : step.kind === "notify"
      ? "quantum"
      : step.kind === "approval"
      ? "crimson"
      : "solar";

  return (
    <>
      <Header title={stepLabel(step.kind)} tone={stepTone} onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <Field label="Adım etiketi">
          <input
            defaultValue={step.label}
            className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-ion/40"
          />
        </Field>

        {step.kind === "skill" && (
          <>
            <Field label="Skill referansı">
              <input
                defaultValue={step.skillRef}
                placeholder="skill-name"
                className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm outline-none focus:border-nebula/40"
              />
            </Field>
            <Field label="Model (LLM routing)">
              <ModelPicker
                value={modelRef}
                onChange={(id) => {
                  setModelRef(id);
                  toast({
                    tone: "nebula",
                    title: "Model pinlendi",
                    description: `${id} bu adımın primary model'i oldu. Oracle gerekli gördüğünde fallback chain'i de önerir.`,
                  });
                }}
              />
              <p className="mt-1 font-mono text-[10px] text-text-faint">
                Boş bırakırsan Oracle cost/capability'e göre otomatik routeler.
              </p>
            </Field>
          </>
        )}

        {step.kind === "integration" && (
          <>
            <Field label="Integration">
              <input
                defaultValue={step.integration}
                placeholder="ccxt / notion / hubspot / linear / …"
                className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm outline-none focus:border-ion/40"
              />
            </Field>
            {step.target && (
              <Field label="Target">
                <input
                  defaultValue={step.target}
                  className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-ion/40"
                />
              </Field>
            )}
          </>
        )}

        {step.kind === "notify" && (
          <>
            <Field label="Kanal">
              <input
                defaultValue={step.channel}
                placeholder="slack / notion / email"
                className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm outline-none focus:border-quantum/40"
              />
            </Field>
            <Field label="Hedef">
              <input
                defaultValue={step.target}
                placeholder="#channel veya e-posta"
                className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-quantum/40"
              />
            </Field>
          </>
        )}

        {step.kind === "approval" && (
          <div className="rounded-lg border border-crimson/40 bg-crimson-soft/20 p-3 text-xs leading-relaxed text-crimson">
            <span className="font-medium">İnsan onayı gerekli.</span> Bu adıma gelen her talep
            Control Room'daki onay kuyruğuna düşer. external-send kapsamındaki aksiyonlar burada
            insan onayı olmadan geçemez.
          </div>
        )}

        {step.note && (
          <Field label="Not">
            <textarea
              defaultValue={step.note}
              rows={2}
              className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-ion/40"
            />
          </Field>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-border/60 p-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-crimson hover:bg-crimson/10"
          onClick={() =>
            toast({
              tone: "crimson",
              title: "Adım silme teyidi",
              description: `"${step.label}" bu iteration'da soft-remove edildi. Kaydet'e basana kadar canvas'ta görünmeye devam eder.`,
            })
          }
        >
          <Trash2 size={12} /> Sil
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast({
                tone: "ion",
                title: "YAML snapshot",
                description: `Bu adımın canonical YAML'ı clipboard'a kopyalandı (mock).`,
              })
            }
          >
            <FileCode size={12} /> YAML
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast({
                tone: "quantum",
                title: "Adım kaydedildi",
                description: modelRef
                  ? `Skill + model pin (${modelRef}) uygulandı.`
                  : "Skill değişiklikleri yazıldı.",
              })
            }
          >
            Kaydet
          </Button>
        </div>
      </div>
    </>
  );
}

function Header({
  title,
  tone,
  onClose,
}: {
  title: string;
  tone: "nebula" | "ion" | "quantum" | "crimson" | "solar" | "neutral";
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
      <div>
        <Badge tone={tone}>{title}</Badge>
      </div>
      <button
        onClick={onClose}
        className="rounded-md p-1.5 text-text-faint transition-colors hover:bg-elevated hover:text-text"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">{label}</div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function stepLabel(k: string) {
  return k === "skill"
    ? "Skill adımı"
    : k === "integration"
    ? "Integration adımı"
    : k === "notify"
    ? "Notify adımı"
    : k === "approval"
    ? "Approval"
    : k === "condition"
    ? "Condition"
    : k;
}
