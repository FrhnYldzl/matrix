"use client";

/**
 * CreateWorkspaceDialog — "Yeni şirket / proje ekle" wizard.
 *
 * Holdco OS'a yeni bir dijital varlık (asset) eklerken:
 *   1. Asset türünü seç (SaaS / Newsletter / Affiliate / E-commerce / Custom)
 *   2. Temel bilgileri gir (isim, kısa ad, sektör, accent)
 *   3. Kaydet → Zustand store'a eklenir → workspace switch edilir
 *
 * Her asset türü seed DNA (mission/vision template) ile gelir.
 * İlerde: Keymaker blueprint otomatik tetiklenir.
 *
 * IMPORTANT: TopBar'ın `backdrop-blur-xl` filter'ı `position: fixed` için
 * yeni bir containing block yaratıyordu — bu yüzden dialog tam ekran yerine
 * TopBar hizasında görünüyordu. Çözüm: createPortal ile `document.body`'ye
 * direkt render.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import { Button } from "../ui/Button";
import { toast } from "@/lib/toast";
import type { Workspace } from "@/lib/types";
import {
  ArrowRight,
  Check,
  Code2,
  Mail,
  MousePointerClick,
  Package,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

type AssetType = "saas" | "newsletter" | "affiliate" | "ecommerce" | "custom";

interface AssetTemplate {
  type: AssetType;
  label: string;
  tagline: string;
  icon: typeof Code2;
  accent: "ion" | "nebula" | "quantum" | "solar";
  defaultIndustry: string;
  mission: string;
  vision: string;
  themes: { label: string; description: string; weight: number }[];
}

const ASSET_TEMPLATES: AssetTemplate[] = [
  {
    type: "saas",
    label: "SaaS Ürünü",
    tagline: "Aylık abonelik, tekil customer base — MRR + CAC + churn takibi",
    icon: Code2,
    accent: "ion",
    defaultIndustry: "B2B SaaS",
    mission: "[X] kullanıcılarının günlük işini radikal ölçüde kolaylaştırmak.",
    vision:
      "5 yıl içinde [sektör]'de ilk 3 yazılım sağlayıcıdan biri olmak — de-facto işletim sistemi haline gelmek.",
    themes: [
      { label: "Müşteri Başarısı", description: "NRR > 115%", weight: 95 },
      { label: "Ürün Kaldıracı", description: "Her feature'ı workflow'a dönüştür", weight: 80 },
      { label: "Dikey Uzmanlık", description: "Sektör diline hakim olmak", weight: 70 },
    ],
  },
  {
    type: "newsletter",
    label: "Newsletter / Content Brand",
    tagline: "Sub büyümesi + sponsor MRR — Beehiiv/Substack üzerinden",
    icon: Mail,
    accent: "nebula",
    defaultIndustry: "Content / Media",
    mission: "[Kitle] için haftalık [konu] briefing'ini en güvenilir tek kaynağı yapmak.",
    vision:
      "Morning Brew modelinde bir niche content brand: 50K+ sub, 6-rakamlı yıllık sponsor geliri, zamanı kısaltıcı agent'larla öz-sürdürülebilir.",
    themes: [
      { label: "Sub Büyümesi", description: "Haftalık %5+ organik", weight: 90 },
      { label: "Sponsor Ekonomisi", description: "Her edition'da 1 sponsor slot", weight: 75 },
      { label: "Editör Disiplini", description: "AI draft + human polish", weight: 85 },
    ],
  },
  {
    type: "affiliate",
    label: "Affiliate / SEO Sitesi",
    tagline: "Organik trafik + affiliate komisyon — pasif gelir modeli",
    icon: MousePointerClick,
    accent: "solar",
    defaultIndustry: "Affiliate / Content",
    mission:
      "[Niche] alanındaki satın alma kararlarını kolaylaştıran en güvenilir karşılaştırma kaynağı olmak.",
    vision:
      "12 ayda $3K+/ay pasif affiliate geliri. AI destekli içerik üretimi ile ayda 20+ yeni sayfa.",
    themes: [
      { label: "SEO Liderliği", description: "Commercial-intent keyword'lerde top 3", weight: 95 },
      { label: "İçerik Ölçeği", description: "Haftada 5 sayfa", weight: 80 },
      { label: "Otantik Voice", description: "Google Helpful Content uyumu", weight: 85 },
    ],
  },
  {
    type: "ecommerce",
    label: "E-commerce / POD Markası",
    tagline: "Shopify + Printful + Meta Ads — fiziksel ürün, dijital operasyon",
    icon: ShoppingBag,
    accent: "solar",
    defaultIndustry: "D2C / E-commerce",
    mission: "[Niche] için minimal envanter riskiyle kaliteli ürünler sunmak.",
    vision:
      "24 ayda $10K+/ay net kâr. Fiziksel operasyon maliyeti %10 altında. Ad creative + inventory sync + CS tamamen agent-operated.",
    themes: [
      { label: "Dar Niche", description: "Geniş pazar yerine derin dikey", weight: 90 },
      { label: "Creator UGC", description: "Organic content moat", weight: 80 },
      { label: "Agent-Operated Ops", description: "Fiziksel süreç minimum", weight: 85 },
    ],
  },
  {
    type: "custom",
    label: "Custom / Özel",
    tagline: "Yukarıdakilere uymayan özel yapı — sıfırdan tasarla",
    icon: Package,
    accent: "quantum",
    defaultIndustry: "Özel / Kişisel",
    mission: "",
    vision: "",
    themes: [],
  },
];

const ACCENT_OPTIONS: Array<{ value: "ion" | "nebula" | "quantum" | "solar"; label: string }> = [
  { value: "ion", label: "Ion · Mavi" },
  { value: "nebula", label: "Nebula · Mor" },
  { value: "quantum", label: "Quantum · Yeşil" },
  { value: "solar", label: "Solar · Turuncu" },
];

export function CreateWorkspaceDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { createWorkspace, setWorkspace } = useWorkspaceStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [template, setTemplate] = useState<AssetTemplate | null>(null);
  const [mounted, setMounted] = useState(false);

  // Portal mount guard — SSR'da document yok
  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Form state
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [industry, setIndustry] = useState("");
  const [accent, setAccent] = useState<"ion" | "nebula" | "quantum" | "solar">(
    "ion"
  );
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep(1);
    setTemplate(null);
    setName("");
    setShortName("");
    setIndustry("");
    setAccent("ion");
    setSubmitting(false);
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const selectTemplate = (t: AssetTemplate) => {
    setTemplate(t);
    setIndustry(t.defaultIndustry);
    setAccent(t.accent);
    setStep(2);
  };

  const deriveShortName = (full: string): string => {
    const parts = full.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[1][0]).toUpperCase();
    return full.trim().slice(0, 2).toUpperCase();
  };

  const submit = () => {
    if (!template || !name.trim()) return;
    setSubmitting(true);
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const sn = shortName.trim() || deriveShortName(name);

    const workspace: Workspace = {
      id: `ws-${slug}-${Date.now().toString(36)}`,
      name: name.trim(),
      shortName: sn,
      industry: industry.trim() || template.defaultIndustry,
      mission: template.mission,
      vision: template.vision,
      strategicThemes: template.themes.map((t, i) => ({
        id: `st-${slug}-${i}`,
        label: t.label,
        description: t.description,
        weight: t.weight,
      })),
      valueAnchors: [
        {
          id: `va-${slug}-1`,
          label: "İnsan son kararı verir",
          description: "External-send scope'u her zaman onay gerektirir.",
        },
      ],
      accent,
      createdAt: new Date().toISOString(),
    };

    createWorkspace(
      { entity: workspace, origin: "manual", createdAt: workspace.createdAt },
      `create-workspace:${template.type}`
    );
    setWorkspace(workspace.id);

    toast({
      tone: "quantum",
      title: `${workspace.name} eklendi`,
      description: `${template.label} template'i ile kuruldu — ${template.themes.length} stratejik tema + default value anchor. Şimdi Prime Program'dan DNA'sını özelleştir.`,
      action: { label: "Prime Program'a git", href: "/vision" },
    });

    setSubmitting(false);
    closeAndReset();
  };

  if (!open || !mounted) return null;

  const dialog = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        onClick={closeAndReset}
        aria-label="Kapat"
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
      />
      <div className="relative flex max-h-[90vh] w-[min(760px,96vw)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface/95 shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-border/60 p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
                <Sparkles size={11} className="text-nebula" />
                Yeni dijital varlık · holdco portfolio
              </div>
              <h2 className="mt-1 text-xl font-semibold text-text">
                {step === 1
                  ? "Ne tür bir asset kuruyorsun?"
                  : `${template?.label} — detaylar`}
              </h2>
            </div>
            <button
              onClick={closeAndReset}
              className="rounded-md p-1.5 text-text-muted hover:bg-elevated hover:text-text"
            >
              <X size={14} />
            </button>
          </div>

          {/* Step pills */}
          <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
            <StepPill active={step === 1} done={step > 1} label="1 · Template" />
            <span className="text-text-faint">·</span>
            <StepPill active={step === 2} done={false} label="2 · Detaylar" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-text-muted">
                Her template bir başlangıç DNA'sı + stratejik temalarla gelir.{" "}
                <b className="text-text">Custom</b> sıfırdan kurmak için.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {ASSET_TEMPLATES.map((t) => (
                  <TemplateCard
                    key={t.type}
                    template={t}
                    onSelect={() => selectTemplate(t)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && template && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-4"
            >
              <FormField label="İsim" hint="Örn: Juris · SaaS, AI Research Pro">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Workspace'in tam adı"
                  required
                  autoFocus
                  className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-nebula/50"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Kısa kod"
                  hint={`Otomatik: ${deriveShortName(name || "XX")}`}
                >
                  <input
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value.toUpperCase())}
                    maxLength={3}
                    placeholder="Auto"
                    className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-nebula/50"
                  />
                </FormField>

                <FormField label="Accent rengi">
                  <select
                    value={accent}
                    onChange={(e) =>
                      setAccent(
                        e.target.value as "ion" | "nebula" | "quantum" | "solar"
                      )
                    }
                    className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-nebula/50"
                  >
                    {ACCENT_OPTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Sektör / kategori" hint={`Default: ${template.defaultIndustry}`}>
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder={template.defaultIndustry}
                  className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-nebula/50"
                />
              </FormField>

              {/* Preview */}
              <div className="mt-4 rounded-lg border border-nebula/30 bg-nebula-soft/20 p-4">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-nebula">
                  <Sparkles size={11} />
                  Kurulacak olan
                </div>
                <div className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-text">
                  <div>
                    <b className="text-text-muted">Template:</b>{" "}
                    <span className="text-text">{template.label}</span>
                  </div>
                  {template.mission && (
                    <div>
                      <b className="text-text-muted">Mission:</b>{" "}
                      <span className="text-text-muted">{template.mission}</span>
                    </div>
                  )}
                  {template.themes.length > 0 && (
                    <div>
                      <b className="text-text-muted">{template.themes.length} stratejik tema:</b>{" "}
                      <span className="text-text-muted">
                        {template.themes.map((t) => t.label).join(" · ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-mono text-[11px] text-text-muted hover:text-text"
                >
                  ← template değiştir
                </button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="md" onClick={closeAndReset}>
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="gap-1.5"
                    disabled={!name.trim() || submitting}
                  >
                    {submitting ? "Kuruluyor…" : "Workspace'i oluştur"}
                    <ArrowRight size={13} />
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

function StepPill({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        active && "border-nebula/50 bg-nebula-soft text-nebula",
        done && "border-quantum/40 bg-quantum-soft/50 text-quantum",
        !active && !done && "border-border/60 bg-elevated/40 text-text-faint"
      )}
    >
      {done && <Check size={9} />}
      {label}
    </span>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && (
        <p className="mt-1 font-mono text-[10px] text-text-faint">{hint}</p>
      )}
    </div>
  );
}

function TemplateCard({
  template: t,
  onSelect,
}: {
  template: AssetTemplate;
  onSelect: () => void;
}) {
  const Icon = t.icon;
  const accentCls =
    t.accent === "ion"
      ? "border-ion/30 hover:border-ion/60 text-ion bg-ion-soft/40"
      : t.accent === "nebula"
      ? "border-nebula/30 hover:border-nebula/60 text-nebula bg-nebula-soft/40"
      : t.accent === "quantum"
      ? "border-quantum/30 hover:border-quantum/60 text-quantum bg-quantum-soft/40"
      : "border-solar/30 hover:border-solar/60 text-solar bg-solar-soft/40";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
        "border-border/60 bg-elevated/30 hover:border-border-strong hover:bg-elevated/60"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
          accentCls
        )}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-text">{t.label}</div>
        <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
          {t.tagline}
        </p>
        {t.themes.length > 0 && (
          <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-text-faint">
            {t.themes.length} tema · {t.defaultIndustry}
          </p>
        )}
      </div>
      <ArrowRight
        size={14}
        className="mt-1 shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-text"
      />
    </button>
  );
}
