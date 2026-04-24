"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { blueprints, type Blueprint } from "@/lib/blueprints";
import { BlueprintCard } from "./BlueprintCard";
import { BlueprintDetail } from "./BlueprintDetail";
import { InstallDrawer } from "./InstallDrawer";
import { BusinessLibraryPage } from "../business/BusinessLibraryPage";
import { BookOpenCheck, Lightbulb, Rocket, Sparkles } from "lucide-react";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";

type Tab = "blueprints" | "ideas";

export function BlueprintsPage() {
  const [selected, setSelected] = useState<Blueprint | null>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("blueprints");

  if (selected) {
    return (
      <>
        <BlueprintDetail
          blueprint={selected}
          onBack={() => setSelected(null)}
          onInstall={() => setInstallOpen(true)}
        />
        <InstallDrawer
          open={installOpen}
          blueprint={selected}
          onClose={() => setInstallOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <MatrixHexGrid tone="solar" opacity={0.08} />
        <div className="pointer-events-none absolute -top-20 left-1/4 h-48 w-[500px] rounded-full bg-ion/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/3 h-40 w-[400px] rounded-full bg-nebula/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <Rocket size={12} className="text-ion" />
            The Keymaker · Fikirden kuruluma
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            Bir departmanı 12 dakikada kur.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-muted leading-relaxed">
            İki katlı atölye: <b className="text-text">Ideas</b> sekmesinde iş
            modeli, pazar fırsatı ve gelir playbook'ları — "ne kuracaksın?"
            sorusunun cevabı. <b className="text-text">Blueprints</b> sekmesinde
            hazır domain paketleri — "nasıl kuracaksın?" sorusunun cevabı.
            Oracle Forge motoru ikisini birleştirerek canonical şablonlarla
            üretir.
          </p>

          <div className="mt-5 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-ion/30 bg-ion-soft px-2.5 py-1 text-ion">
              <Sparkles size={11} />
              {blueprints.length} blueprint hazır
            </span>
            <span className="font-mono text-text-muted">
              Toplam: {blueprints.reduce((s, b) => s + b.agents.length, 0)} agent ·{" "}
              {blueprints.reduce((s, b) => s + b.skills.length, 0)} skill ·{" "}
              {blueprints.reduce((s, b) => s + b.workflows.length, 0)} workflow
            </span>
          </div>
        </div>

        <div className="relative mt-6 max-w-3xl">
          <MatrixQuote speaker={MODULE_QUOTES["/blueprints"].speaker} tone={MODULE_QUOTES["/blueprints"].tone}>
            {MODULE_QUOTES["/blueprints"].line}
          </MatrixQuote>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-14 z-10 flex items-center gap-2 border-b border-border/60 bg-void/70 px-8 py-3 backdrop-blur-md">
        <TabBtn
          active={tab === "blueprints"}
          onClick={() => setTab("blueprints")}
          icon={<Rocket size={13} />}
          tone="ion"
        >
          Blueprints ({blueprints.length})
        </TabBtn>
        <TabBtn
          active={tab === "ideas"}
          onClick={() => setTab("ideas")}
          icon={<Lightbulb size={13} />}
          tone="solar"
        >
          Ideas · Zion's Council
        </TabBtn>
        {tab === "ideas" && (
          <Link
            href="/blueprints"
            onClick={() => setTab("blueprints")}
            className="ml-auto text-[11px] font-mono text-text-faint hover:text-text"
          >
            ← Blueprints'e dön
          </Link>
        )}
      </div>

      {/* Content */}
      {tab === "blueprints" ? (
        <section className="px-8 py-8">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {blueprints.map((bp) => (
              <BlueprintCard key={bp.id} blueprint={bp} onOpen={() => setSelected(bp)} />
            ))}
          </div>
        </section>
      ) : (
        /* Embed the full Business Library inside the Ideas tab */
        <div className="-mt-px">
          <BusinessLibraryPage />
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  tone: "ion" | "solar";
  children: React.ReactNode;
}) {
  const toneCls =
    tone === "ion"
      ? "text-ion bg-ion-soft border-ion/40"
      : "text-solar bg-solar-soft border-solar/40";
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-all",
        active
          ? toneCls + " shadow-inner"
          : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
