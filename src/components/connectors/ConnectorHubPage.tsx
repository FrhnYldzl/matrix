"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  categoryLabels,
  categoryOrder,
  connectors,
  type Connector,
  type ConnectorCategory,
} from "@/lib/connectors";
import { ConnectorCard } from "./ConnectorCard";
import { ConnectorDrawer } from "./ConnectorDrawer";
import { ConnectorScoutPanel } from "./ConnectorScoutPanel";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  MapPin,
  Plug,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";
import { toast } from "@/lib/toast";

type Tab = "all" | ConnectorCategory;

export function ConnectorHubPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Connector | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return connectors.filter((c) => {
      if (tab !== "all" && c.category !== tab) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        c.name.toLowerCase().includes(s) ||
        c.vendor.toLowerCase().includes(s) ||
        c.tagline.toLowerCase().includes(s)
      );
    });
  }, [tab, q]);

  const stats = useMemo(() => {
    return {
      total: connectors.length,
      connected: connectors.filter((c) => c.status === "connected").length,
      needsAuth: connectors.filter((c) => c.status === "needs-auth").length,
      error: connectors.filter((c) => c.status === "error" || c.status === "rate-limited").length,
      physical: connectors.filter((c) => c.category === "physical-world").length,
      callsToday: connectors.reduce((s, c) => s + c.callsToday, 0),
    };
  }, []);

  const openConnector = (c: Connector) => {
    setSelected(c);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <MatrixHexGrid tone="ion" opacity={0.08} />
        <div className="pointer-events-none absolute -top-20 left-1/3 h-48 w-[500px] rounded-full bg-ion/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-40 w-[400px] rounded-full bg-solar/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
              <Plug size={12} className="text-ion" />
              TrainStation · canlı entegrasyon katmanı
            </div>
            <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
              Matrix'in dış dünyaya açılan kapıları.
            </h1>
            <p className="mt-3 text-base text-text-muted leading-relaxed">
              Her skill ve workflow'un bir veya daha fazla gerçek platforma bağlandığı yer.
              Dijital araçlar, AI API'ları, orkestra platformları ve fiziksel dünyayı (ödeme, kargo,
              POS) dijitalleştiren <span className="text-solar">fiziksel köprüler</span> tek katalogda.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Pill count={stats.connected} label="Bağlı" tone="quantum" icon={CheckCircle2} />
              <Pill count={stats.needsAuth} label="Yetki gerek" tone="solar" icon={ShieldAlert} />
              <Pill count={stats.error} label="Sorun" tone="crimson" icon={AlertTriangle} />
              <Pill count={stats.physical} label="Fiziksel köprü" tone="solar" icon={MapPin} />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-surface/70 p-4 backdrop-blur-sm lg:min-w-[280px]">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-faint">
              <Coins size={10} className="text-solar" />
              Bugün maliyet nabzı
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-text">
              {stats.callsToday.toLocaleString("tr-TR")}
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-text-muted">
              toplam API çağrısı · tüm connector'lar
            </div>
            <div className="mt-3 border-t border-border/50 pt-3 text-[11px] leading-relaxed text-text-muted">
              <span className="text-solar">Spend & Budget</span> modülü yakında — her çağrının $
              maliyeti, bütçe limitleri, ROI kartı.
            </div>
          </div>
        </div>

        <div className="relative mt-6 max-w-3xl">
          <MatrixQuote speaker={MODULE_QUOTES["/connectors"].speaker} tone={MODULE_QUOTES["/connectors"].tone}>
            {MODULE_QUOTES["/connectors"].line}
          </MatrixQuote>
        </div>
      </section>

      {/* Tabs + search */}
      <div className="sticky top-14 z-10 flex flex-wrap items-center gap-3 border-b border-border/60 bg-void/70 px-8 py-3 backdrop-blur-md">
        <div className="flex flex-wrap gap-1">
          <TabBtn active={tab === "all"} onClick={() => setTab("all")} tone="ion">
            Tümü ({connectors.length})
          </TabBtn>
          {categoryOrder.map((c) => {
            const count = connectors.filter((x) => x.category === c).length;
            if (count === 0) return null;
            return (
              <TabBtn
                key={c}
                active={tab === c}
                onClick={() => setTab(c)}
                tone={
                  c === "physical-world"
                    ? "solar"
                    : c === "ai"
                    ? "nebula"
                    : c === "free-programs"
                    ? "quantum"
                    : "ion"
                }
              >
                {categoryLabels[c]} ({count})
              </TabBtn>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-md border border-border/60 bg-elevated/40 px-3 py-1.5 text-sm md:w-80">
          <Search size={13} className="text-text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="connector ara…"
            className="w-full bg-transparent outline-none placeholder:text-text-faint"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast({
              tone: "ion",
              title: "Yeni connector ekle",
              description: "Scout'a sor veya MCP registry'den seç. Private API key'i .env'de tanımlayıp vercel secret olarak yükleyebilirsin.",
              action: { label: "Scout'a git", href: "/connectors#scout" },
            })
          }
        >
          <Plus size={12} />
          Yeni connector
        </Button>
      </div>

      {/* Scout + Grid */}
      <section className="space-y-6 px-8 py-8">
        <ConnectorScoutPanel />
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <ConnectorCard
                key={c.id}
                connector={c}
                onOpen={() => openConnector(c)}
              />
            ))}
          </div>
        )}
      </section>

      <ConnectorDrawer
        connector={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone: "ion" | "solar" | "nebula" | "quantum";
  children: React.ReactNode;
}) {
  const toneCls =
    tone === "ion"
      ? "text-ion bg-ion-soft border-ion/40"
      : tone === "solar"
      ? "text-solar bg-solar-soft border-solar/40"
      : tone === "quantum"
      ? "text-quantum bg-quantum-soft border-quantum/40"
      : "text-nebula bg-nebula-soft border-nebula/40";
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
        active
          ? toneCls + " shadow-inner"
          : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

function Pill({
  count,
  label,
  tone,
  icon: Icon,
}: {
  count: number;
  label: string;
  tone: "quantum" | "ion" | "solar" | "crimson";
  icon: typeof CheckCircle2;
}) {
  const cls =
    tone === "quantum"
      ? "text-quantum bg-quantum-soft border-quantum/30"
      : tone === "ion"
      ? "text-ion bg-ion-soft border-ion/30"
      : tone === "solar"
      ? "text-solar bg-solar-soft border-solar/30"
      : "text-crimson bg-crimson-soft border-crimson/30";
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", cls)}>
      <Icon size={11} />
      <span className="font-mono text-sm font-semibold tabular-nums">{count}</span>
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <Plug size={24} className="text-text-muted" />
        <h3 className="mt-4 text-sm font-medium text-text">Bu filtrelere uyan connector yok</h3>
        <p className="mt-1.5 text-xs text-text-muted">Başka bir kategori seç veya arama terimini değiştir.</p>
      </div>
    </Card>
  );
}
