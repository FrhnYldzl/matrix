"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  categoryLabels,
  connectors,
  scoutDiscoveries,
  type Connector,
  type ScoutDiscovery,
} from "@/lib/connectors";
import {
  capabilityLabels,
  capabilityTone,
  recommendModelsForQuery,
  taskGroupOf,
  taskLabel,
  type ModelRecommendation,
  type TaskGroup,
} from "@/lib/llm-catalog";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  Award,
  Binoculars,
  Box,
  ChevronDown,
  Cpu,
  Globe,
  MapPin,
  MessageSquare,
  Package,
  Radar,
  RefreshCcw,
  Search,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "@/lib/toast";

/**
 * Connector Scout — an agent concept embedded in the Connector Hub page.
 * Two modes:
 *  1. Passive discovery feed — freshly surfaced connectors from the last week.
 *  2. On-demand recommendation — user types what they need, Scout returns
 *     matching connectors from the existing catalog.
 */
export function ConnectorScoutPanel() {
  const [expanded, setExpanded] = useState(true);
  const [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [matches, setMatches] = useState<
    | null
    | {
        query: string;
        results: { connector: Connector; score: number; reason: string }[];
        modelRecs: ModelRecommendation[];
      }
  >(null);

  const run = () => {
    if (!query.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setMatches({
        query: query,
        results: recommendConnectors(query.trim()),
        modelRecs: recommendModelsForQuery(query.trim(), 4),
      });
      setAnalyzing(false);
    }, 700);
  };

  const samples = [
    "Ucuz ve hızlı ticket sınıflandırması",
    "Açık kaynak muhakeme modeli bul",
    "Ses transkripti için en iyi model",
    "500+ tok/s inference motoru",
    "Görsel üretimi için düşük maliyet",
  ];

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
      <div className="pointer-events-none absolute -top-10 right-1/3 h-40 w-[400px] rounded-full bg-nebula/15 blur-3xl" />
      <div className="pointer-events-none absolute -top-5 left-1/4 h-32 w-[320px] rounded-full bg-ion/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 border-b border-border/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-nebula/40 bg-nebula-soft text-nebula shadow-[0_0_24px_rgba(155,123,255,0.3)]">
            <Binoculars size={20} strokeWidth={1.6} className="animate-breathe" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              <Sparkles size={11} className="text-nebula" />
              Connector Scout · entegrasyon keşif ajanı
            </div>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-text">
              İhtiyacını söyle, Scout sana doğru köprüyü bulsun
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Product Hunt · GitHub Trending · Reddit · LinkedIn · Indie Hackers ·{" "}
              <span className="text-crimson">G2</span>'yi sürekli tarar, mevcut kataloğunda
              eşleşme arar, yeni çıkan araçları puan/review verisiyle keşfe düşürür.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="rounded-md border border-border/60 p-2 text-text-muted transition-colors hover:text-text self-start lg:self-auto"
        >
          <ChevronDown
            size={14}
            className={cn("transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>

      {expanded && (
        <div className="relative space-y-5 p-5">
          {/* On-demand search */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] text-text-faint">
              Ne yapmak istiyorsun?
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-border/60 bg-elevated/50 px-3 py-2">
              <Search size={13} className="text-text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && run()}
                placeholder="ör. 'lead triage için modern CRM bul' veya 'düşük maliyetli SMS gönderimi'"
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
              />
              <Button
                size="sm"
                variant="primary"
                className="h-7 gap-1"
                onClick={run}
                disabled={analyzing || !query.trim()}
              >
                {analyzing ? (
                  <>
                    <Radar size={11} className="animate-spin" />
                    Arıyor…
                  </>
                ) : (
                  <>
                    <Send size={11} />
                    Scout'a sor
                  </>
                )}
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[10px] text-text-faint">Örnek:</span>
              {samples.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="rounded-md border border-border/50 bg-elevated/40 px-2 py-0.5 text-[11px] text-text-muted hover:border-border-strong hover:text-text"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Match results */}
          {matches && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nebula">
                  Scout önerisi · "{matches.query}"
                </div>
                <button
                  onClick={() => setMatches(null)}
                  className="text-[11px] text-text-muted hover:text-text"
                >
                  Temizle
                </button>
              </div>

              {/* Connector matches */}
              {matches.results.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
                    <Radar size={10} className="text-ion" />
                    Önerilen Connector'lar
                  </div>
                  <div className="space-y-2">
                    {matches.results.map((m) => (
                      <MatchRow key={m.connector.id} match={m} />
                    ))}
                  </div>
                </div>
              )}

              {/* Model recommendations */}
              {matches.modelRecs.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
                    <Box size={10} className="text-nebula" />
                    Yetenek eşleşmesi · önerilen modeller
                  </div>
                  <div className="space-y-2">
                    {matches.modelRecs.map((r) => (
                      <ModelRecRow key={r.model.id} rec={r} />
                    ))}
                  </div>
                </div>
              )}

              {matches.results.length === 0 && matches.modelRecs.length === 0 && (
                <div className="rounded-md border border-dashed border-border/60 bg-elevated/30 p-4 text-sm text-text-muted">
                  Doğrudan eşleşme bulunamadı. Scout aşağıdaki yeni keşifleri değerlendirmeni
                  öneriyor ya da bir connector talebini oluştur.
                </div>
              )}
            </div>
          )}

          {/* Recent discoveries */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                <Radar size={11} className="text-nebula animate-breathe" />
                Son keşifler · {scoutDiscoveries.length} yeni connector
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-[11px]"
                onClick={() =>
                  toast({
                    tone: "nebula",
                    title: "Scout tekrar taraması başladı",
                    description: `${scoutDiscoveries.length} mevcut keşif yanında 6 yeni sinyal kaynağı (Product Hunt · GitHub · Reddit · LinkedIn · Indie Hackers · G2) tarandı. Yeni bulgu yok.`,
                  })
                }
              >
                <RefreshCcw size={10} />
                Yeniden tara
              </Button>
            </div>
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {scoutDiscoveries.map((d) => (
                <DiscoveryCard key={d.id} discovery={d} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

function MatchRow({
  match,
}: {
  match: { connector: Connector; score: number; reason: string };
}) {
  const c = match.connector;
  const isPhysical = c.category === "physical-world";
  const isEngine = c.category === "engines";
  const isProgram = c.category === "free-programs";
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        isPhysical
          ? "border-solar/30 bg-solar-soft/20"
          : isEngine
          ? "border-ion/30 bg-ion-soft/20"
          : isProgram
          ? "border-quantum/30 bg-quantum-soft/20"
          : "border-border/60 bg-elevated/40"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] font-semibold",
          isPhysical
            ? "border-solar/40 bg-solar-soft text-solar"
            : isEngine
            ? "border-ion/40 bg-ion-soft text-ion"
            : isProgram
            ? "border-quantum/40 bg-quantum-soft text-quantum"
            : "border-border/60 bg-elevated text-text"
        )}
      >
        {c.shortCode}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium text-text">{c.name}</span>
          <span className="rounded border border-border/50 bg-elevated/50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
            {categoryLabels[c.category]}
          </span>
          {isPhysical && (
            <span className="inline-flex items-center gap-0.5 rounded border border-solar/30 bg-solar-soft px-1 py-px font-mono text-[9px] uppercase tracking-wider text-solar">
              <MapPin size={8} /> fiziksel
            </span>
          )}
          {isEngine && (
            <span className="inline-flex items-center gap-0.5 rounded border border-ion/40 bg-ion-soft px-1 py-px font-mono text-[9px] uppercase tracking-wider text-ion">
              <Cpu size={8} /> engine
            </span>
          )}
          {isProgram && (
            <span className="inline-flex items-center gap-0.5 rounded border border-quantum/40 bg-quantum-soft px-1 py-px font-mono text-[9px] uppercase tracking-wider text-quantum">
              <Package size={8} /> program
            </span>
          )}
          <span className="ml-auto font-mono text-[10px] text-text-faint">
            eşleşme %{match.score}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-text-muted">{c.tagline}</div>
        <div className="mt-2 rounded-md border border-nebula/20 bg-nebula-soft/30 px-2.5 py-1.5 text-[11px] leading-relaxed text-text">
          <span className="font-mono text-[9px] uppercase tracking-wider text-nebula">
            Scout:
          </span>{" "}
          {match.reason}
        </div>
      </div>
    </div>
  );
}

function ModelRecRow({ rec }: { rec: ModelRecommendation }) {
  const m = rec.model;
  const connector = connectors.find((c) => c.id === m.connectorId);
  return (
    <div className="flex items-start gap-3 rounded-lg border border-nebula/25 bg-nebula-soft/20 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-nebula/40 bg-nebula-soft text-nebula font-mono text-[10px] font-semibold">
        <Box size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium text-text">{m.name}</span>
          {connector && (
            <span className="rounded border border-border/50 bg-elevated/50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
              {connector.name}
            </span>
          )}
          <span className="ml-auto font-mono text-[10px] text-text-faint">
            eşleşme skoru {rec.score}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-text-muted line-clamp-1">{m.tagline}</div>

        {/* Capability chips (Matrix semantic layer) */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {rec.matchedCapabilities.map((c) => {
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
          {m.outputCostPerMTok != null && (
            <span className="ml-auto font-mono text-[10px] text-text-muted">
              ${m.outputCostPerMTok}/M out
            </span>
          )}
        </div>

        {/* HF-style task chips */}
        {rec.matchedTasks && rec.matchedTasks.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
              task
            </span>
            {rec.matchedTasks.slice(0, 4).map((t) => {
              const group = taskGroupOf[t];
              const cls = taskGroupClassRec[group];
              return (
                <span
                  key={t}
                  className={cn(
                    "rounded border px-1.5 py-0.5 font-mono text-[9px]",
                    cls
                  )}
                  title={group}
                >
                  {taskLabel[t]}
                </span>
              );
            })}
          </div>
        )}

        {/* Quick metadata line */}
        {(m.parameters != null || m.license || (m.hostedOn && m.hostedOn.length > 1)) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[9px] text-text-faint">
            {m.parameters != null && m.parameters > 0 && (
              <span>
                <b className="text-text">{m.parameters}B</b> params
              </span>
            )}
            {m.license && <span>· {m.license}</span>}
            {m.hostedOn && m.hostedOn.length > 1 && (
              <span className="text-ion">
                · {m.hostedOn.length} engine
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const taskGroupClassRec: Record<TaskGroup, string> = {
  multimodal: "text-ion border-ion/30 bg-ion-soft/60",
  vision: "text-nebula border-nebula/30 bg-nebula-soft/60",
  nlp: "text-quantum border-quantum/30 bg-quantum-soft/60",
  audio: "text-solar border-solar/30 bg-solar-soft/60",
  tabular: "text-text-muted border-border/60 bg-elevated/60",
  "rl-other": "text-crimson border-crimson/30 bg-crimson-soft/60",
};

const sourceLabel: Record<ScoutDiscovery["signalSource"], string> = {
  producthunt: "Product Hunt",
  "github-trending": "GitHub Trending",
  reddit: "Reddit",
  "indie-hackers": "Indie Hackers",
  linkedin: "LinkedIn",
  g2: "G2",
};

function DiscoveryCard({ discovery: d }: { discovery: ScoutDiscovery }) {
  const strengthTone =
    d.signalStrength === "strong"
      ? "quantum"
      : d.signalStrength === "emerging"
      ? "ion"
      : "solar";

  const diffSec = Math.max(
    0,
    (Date.now() - new Date(d.capturedAt).getTime()) / 1000
  );
  const ago =
    diffSec < 3600
      ? `${Math.floor(diffSec / 60)} dk`
      : diffSec < 86400
      ? `${Math.floor(diffSec / 3600)} sa`
      : `${Math.floor(diffSec / 86400)} gün`;

  return (
    <li className="group flex items-start gap-3 rounded-lg border border-border/60 bg-elevated/30 p-3 transition-colors hover:border-border-strong">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-semibold",
          d.accent === "ion"
            ? "border-ion/40 bg-ion-soft text-ion"
            : d.accent === "nebula"
            ? "border-nebula/40 bg-nebula-soft text-nebula"
            : d.accent === "quantum"
            ? "border-quantum/40 bg-quantum-soft text-quantum"
            : "border-solar/40 bg-solar-soft text-solar"
        )}
      >
        {d.shortCode}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
          {d.signalSource === "g2" ? (
            <span className="inline-flex items-center gap-1 rounded border border-crimson/40 bg-crimson-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold text-crimson">
              G2
            </span>
          ) : (
            <>
              <Globe size={9} />
              {sourceLabel[d.signalSource]}
            </>
          )}
          <span className="ml-auto">{ago} önce</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium text-text">{d.name}</span>
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
              strengthTone === "quantum" && "text-quantum border-quantum/40 bg-quantum-soft",
              strengthTone === "ion" && "text-ion border-ion/40 bg-ion-soft",
              strengthTone === "solar" && "text-solar border-solar/40 bg-solar-soft"
            )}
          >
            {d.signalStrength}
          </span>
        </div>

        {/* G2 social-proof strip */}
        {d.signalSource === "g2" && d.g2Rating != null && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-md border border-crimson/25 bg-crimson-soft/20 px-2 py-1 font-mono text-[10px]">
            <span className="inline-flex items-center gap-1 text-solar">
              <Star size={9} fill="currentColor" strokeWidth={0} />
              <b className="text-text">{d.g2Rating.toFixed(1)}</b>
              <span className="text-text-faint">/5</span>
            </span>
            {d.g2ReviewCount != null && (
              <span className="inline-flex items-center gap-1 text-text-muted">
                <MessageSquare size={9} />
                {d.g2ReviewCount.toLocaleString("tr-TR")} review
              </span>
            )}
            {d.g2Segment && (
              <span className="inline-flex items-center gap-1 text-crimson">
                <Award size={9} />
                {d.g2Segment}
              </span>
            )}
          </div>
        )}

        <p className="mt-1.5 text-xs text-text-muted line-clamp-2">{d.tagline}</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-text">
          <span className="font-mono text-nebula">Neden:</span> {d.whyMatters}
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-2 font-mono text-[10px] text-text-faint">
          <span>
            <span className="text-text-muted">İyi:</span>{" "}
            <span className="text-text">{d.recommendedFor}</span>
          </span>
          <span className="text-text">{d.ballparkPrice}</span>
        </div>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Recommendation engine
// ---------------------------------------------------------------------------

const categoryKeywords: Record<string, string[]> = {
  messaging: ["sms", "email", "mesaj", "mail", "slack", "iletişim", "whatsapp", "newsletter"],
  crm: ["crm", "lead", "müşteri", "pipeline", "deal", "sales", "satış"],
  marketing: ["ad", "reklam", "campaign", "kampanya", "newsletter", "pazarlama", "audience"],
  commerce: ["shopify", "sipariş", "order", "ürün", "commerce", "satış", "mağaza", "amazon"],
  devops: ["github", "linear", "issue", "sprint", "doküman", "notion"],
  ai: ["ai", "llm", "gpt", "claude", "model", "yapay zeka", "muhakeme", "reasoning"],
  engines: [
    "inference", "tok/s", "hızlı", "fast", "düşük gecikme", "latency",
    "groq", "cerebras", "together", "fireworks", "fal", "sambanova",
    "hyperbolic", "novita", "lpu", "wafer", "serverless",
  ],
  "free-programs": [
    "local", "lokal", "offline", "self-host", "self hosted", "kendi",
    "ollama", "vllm", "llama.cpp", "mlx", "jan", "lm studio", "sglang",
    "unsloth", "gguf", "quantize", "4-bit", "fine-tune", "ücretsiz",
    "apple silicon", "m1", "m2", "m3", "kendi makinem", "privacy",
  ],
  orchestration: ["workflow", "automation", "otomasyon", "zapier", "n8n", "orchestr"],
  data: ["db", "database", "postgres", "supabase", "warehouse", "veri"],
  analytics: ["analytics", "analitik", "mixpanel", "posthog", "funnel", "event"],
  "physical-world": [
    "kargo", "shipping", "tedarik", "ödeme", "payment", "pos", "fiziksel",
    "transfer", "ssv", "depo", "printful", "sms", "twilio", "wise",
  ],
};

function recommendConnectors(query: string) {
  const q = query.toLowerCase();
  const results: { connector: Connector; score: number; reason: string }[] = [];

  connectors.forEach((c) => {
    let score = 0;
    const reasons: string[] = [];

    // Direct name/vendor match
    if (c.name.toLowerCase().includes(q) || c.vendor.toLowerCase().includes(q)) {
      score += 40;
      reasons.push(`isim/vendor direkt eşleşti`);
    }

    // Tagline partial match
    const qWords = q.split(/\s+/).filter((w) => w.length > 2);
    const tagline = c.tagline.toLowerCase();
    qWords.forEach((w) => {
      if (tagline.includes(w)) {
        score += 8;
      }
    });

    // Category keywords
    const kws = categoryKeywords[c.category] || [];
    const kwHits = kws.filter((k) => q.includes(k)).length;
    if (kwHits > 0) {
      score += kwHits * 10;
      reasons.push(`"${c.category}" kategorisi sorguna uyuyor`);
    }

    // Boost physical-world if user mentions physical words
    if (
      c.category === "physical-world" &&
      /(kargo|ödeme|fiziksel|tedarik|transfer|pos|depo)/.test(q)
    ) {
      score += 15;
      reasons.push("fiziksel dünya köprüsü");
    }

    // Boost engines when query implies speed/hosting/inference
    if (
      c.category === "engines" &&
      /(hızl|fast|tok\/s|latency|gecikme|inference|serverless|lpu)/.test(q)
    ) {
      score += 15;
      reasons.push("yüksek hızlı inference motoru");
    }

    // Boost free programs when query implies local/offline/self-host
    if (
      c.category === "free-programs" &&
      /(local|lokal|offline|self.?host|ücretsiz|kendi makine|privacy|gguf|apple silicon|quantize)/.test(q)
    ) {
      score += 15;
      reasons.push("lokal free-program runtime");
    }

    // Connected connectors slight bonus (ready to use)
    if (c.status === "connected") score += 4;

    if (score > 0) {
      results.push({
        connector: c,
        score,
        reason:
          reasons[0] ||
          (c.category === "physical-world"
            ? "fiziksel dünya köprüsü, sorguna uyuyor"
            : "yakın kategori"),
      });
    }
  });

  results.sort((a, b) => b.score - a.score);
  // Normalize scores to 0-100 for UI display
  const max = results[0]?.score || 1;
  return results
    .slice(0, 5)
    .map((r) => ({ ...r, score: Math.round((r.score / max) * 100) }));
}
