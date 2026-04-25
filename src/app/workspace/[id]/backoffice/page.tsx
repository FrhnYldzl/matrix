"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { Settings, Compass, Network, Library, Plug, Database as DatabaseIcon, Rocket } from "lucide-react";

/**
 * /workspace/[id]/backoffice — The Backstage
 *
 * Yapılandırma & büyütme:
 *   • The Prophecy (Vision/Strategy DNA)
 *   • The Architect (Org Studio)
 *   • The Archive (Library — bu workspace'in skill/agent/workflow editörü)
 *   • Attached Connectors (TrainStation köprüsü)
 *   • Pinned Models (Source köprüsü)
 *   • Installed Blueprints (Keymaker köprüsü)
 *   • Workspace Settings (domain · plan · ekip · danger zone)
 *   • Asset-spesifik (Newsletter send schedule, FBA inventory, vb. — Sprint F)
 */
export default function BackofficeTab() {
  const params = useParams<{ id: string }>();
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const attachedConnectors = useWorkspaceStore((s) => s.attachedConnectors);

  const ws = workspaces.find((w) => w.id === params.id);
  if (!ws) return null;

  const wsConnectors = attachedConnectors[ws.id] ?? [];

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
            <Settings size={12} className="text-solar" />
            The Backstage · yapılandırma & büyütme
          </div>
          <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-text">
            {ws.name} · backoffice
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            DNA · org yapısı · skill kütüphanesi · entegrasyonlar · ayarlar.
          </p>
        </header>

        {/* Strateji & yapı */}
        <section>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            Strateji &amp; yapı
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <BackofficeCard
              href="/vision"
              icon={Compass}
              title="The Prophecy"
              subtitle="Vision &amp; Strategy"
              description="Mission · vision · stratejik temalar · değer çıpaları"
              tone="nebula"
            />
            <BackofficeCard
              href="/org"
              icon={Network}
              title="The Architect"
              subtitle="Org Studio"
              description="Visual org graph · departman+agent+skill ilişkileri"
              tone="ion"
            />
            <BackofficeCard
              href="/library"
              icon={Library}
              title="The Archive"
              subtitle="Library"
              description="Skill · agent · workflow editörü &amp; CRUD"
              tone="nebula"
            />
          </div>
        </section>

        {/* Bridges — app-genel modüllere */}
        <section>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            Entegrasyonlar &amp; kaynaklar
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <BackofficeCard
              href="/connectors"
              icon={Plug}
              title="Attached Connectors"
              subtitle="TrainStation"
              description={`${wsConnectors.length} bağlı · 62 katalogda`}
              tone="ion"
            />
            <BackofficeCard
              href="/models"
              icon={DatabaseIcon}
              title="Pinned Models"
              subtitle="The Source"
              description="Agent'ların LLM seçimi · cost optimization"
              tone="nebula"
            />
            <BackofficeCard
              href="/blueprints"
              icon={Rocket}
              title="Installed Blueprints"
              subtitle="The Keymaker"
              description="60+ hazır paket · workspace'e install"
              tone="solar"
            />
          </div>
        </section>

        {/* Workspace Settings */}
        <section>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            Workspace ayarları
          </div>
          <div className="rounded-xl border border-border/60 bg-elevated/20 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SettingsRow label="Asset adı" value={ws.name} />
              <SettingsRow label="Sektör" value={ws.industry} />
              <SettingsRow label="Kısa kod" value={ws.shortName} />
              <SettingsRow label="Accent" value={ws.accent} />
              <SettingsRow
                label="Mission"
                value={ws.mission?.slice(0, 60) + "..." || "—"}
              />
              <SettingsRow
                label="Yaratıldı"
                value={new Date(ws.createdAt).toLocaleDateString("tr-TR")}
              />
            </div>
            <div className="mt-4 border-t border-border/40 pt-4">
              <p className="text-xs text-text-muted">
                Domain · plan · ekip · danger zone Sprint C&apos;de
                tamamlanacak.
              </p>
            </div>
          </div>
        </section>

        <div className="rounded-lg border border-dashed border-border/60 bg-elevated/20 p-4 text-center">
          <p className="text-xs text-text-muted">
            Sprint F&apos;de asset türüne göre ek bölümler gelecek (Newsletter
            → send schedule, FBA → inventory, Course → cohort planning).
          </p>
        </div>
      </div>
    </div>
  );
}

function BackofficeCard({
  href,
  icon: Icon,
  title,
  subtitle,
  description,
  tone,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  tone: "ion" | "nebula" | "quantum" | "solar";
}) {
  const toneCls: Record<typeof tone, string> = {
    ion: "border-ion/30 bg-ion-soft/15 hover:bg-ion-soft/25",
    nebula: "border-nebula/30 bg-nebula-soft/15 hover:bg-nebula-soft/25",
    quantum: "border-quantum/30 bg-quantum-soft/15 hover:bg-quantum-soft/25",
    solar: "border-solar/30 bg-solar-soft/15 hover:bg-solar-soft/25",
  };
  const textCls: Record<typeof tone, string> = {
    ion: "text-ion",
    nebula: "text-nebula",
    quantum: "text-quantum",
    solar: "text-solar",
  };
  return (
    <Link
      href={href}
      className={`block rounded-xl border p-4 transition-all hover:scale-[1.01] ${toneCls[tone]}`}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className={textCls[tone]} />
        <div className={`font-mono text-[9px] uppercase tracking-[0.18em] ${textCls[tone]}`}>
          {subtitle}
        </div>
      </div>
      <div className="mt-2 text-base font-semibold text-text">{title}</div>
      <div className="mt-1 text-xs text-text-muted">{description}</div>
    </Link>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-faint">
        {label}
      </div>
      <div className="mt-1 text-sm text-text">{value}</div>
    </div>
  );
}
