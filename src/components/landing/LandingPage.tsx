"use client";

/**
 * Public landing page — Matrix lore tonu.
 *
 * "Take the red pill. Run your portfolio at the speed of thought."
 *
 * Hedefi: Auth gerekmeyen ilk izlenim. Marketing/onboarding entry point.
 * 3 ana section:
 *   1. Hero — Matrix code rain + iddia + 3 CTA
 *   2. Three pillars — AI ajanlar / Tek ekran portföy / EOS+AI hibrit
 *   3. Footer — Codex linki + GitHub
 */

import Link from "next/link";
import { MatrixCodeRain } from "../brand/MatrixCodeRain";
import { ArrowRight, BookOpen, Sparkles, Terminal } from "lucide-react";

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-void text-text">
      {/* Matrix digital rain — atmosfer */}
      <MatrixCodeRain tone="quantum" opacity={0.18} columns={28} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/40 via-void/10 to-void/80" />
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-[800px] rounded-full bg-quantum/8 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 right-1/4 h-80 w-[600px] rounded-full bg-nebula/8 blur-3xl" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-border/40 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-quantum/40 bg-quantum-soft text-quantum">
            <Terminal size={16} />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              Matrix · OS
            </div>
            <div className="text-sm font-medium text-text">Holdco Operating System</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/codex"
            className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-elevated/50 hover:text-text md:inline-flex"
          >
            <BookOpen size={12} />
            Codex
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-md border border-quantum/40 bg-quantum-soft/50 px-4 py-1.5 text-xs font-medium text-quantum transition-all hover:bg-quantum/20"
          >
            <Sparkles size={12} />
            Giriş yap
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-8 pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-crimson/30 bg-crimson-soft/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-crimson">
            <span className="h-1.5 w-1.5 rounded-full bg-crimson animate-pulse" />
            kırmızı hap · operatörler için
          </div>

          <h1 className="mt-6 font-sans text-5xl font-semibold tracking-tight text-text md:text-7xl">
            Take the{" "}
            <span className="bg-gradient-to-r from-crimson via-quantum to-nebula bg-clip-text text-transparent">
              red pill.
            </span>
            <br />
            Run your portfolio
            <br />
            at the speed of thought.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-muted md:text-lg">
            Matrix OS — AI ajanlarıyla dijital varlık portföyünü tek ekrandan
            kuran, koşturan ve büyüten <b className="text-text">holdco
            operating system</b>. SaaS, newsletter, e-commerce, affiliate &mdash;
            hepsini tek zihinden yönet.
          </p>

          {/* 3 ana CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-quantum to-quantum/80 px-6 py-3 text-sm font-medium text-void shadow-[0_0_30px_rgba(61,224,168,0.3)] transition-all hover:shadow-[0_0_50px_rgba(61,224,168,0.5)] hover:scale-105"
            >
              <Sparkles size={14} />
              Giriş yap
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/codex"
              className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-elevated/30 px-6 py-3 text-sm font-medium text-text-muted transition-all hover:border-border-strong hover:bg-elevated/60 hover:text-text"
            >
              <BookOpen size={14} />
              Codex&apos;i oku
            </Link>
          </div>

          <p className="mt-6 font-mono text-[11px] text-text-faint">
            &ldquo;Welcome to the real world.&rdquo; — Morpheus
          </p>
        </div>
      </section>

      {/* 3 pillar */}
      <section className="relative z-10 border-t border-border/30 bg-surface/40 px-8 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-quantum">
              · Üç temel iddia ·
            </div>
            <h2 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-text md:text-4xl">
              Tek bir kullanıcı.
              <br />
              Bir portföy. Tüm Matrix.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Pillar
              tone="ion"
              order="01"
              title="AI ajanlarla şirket yönet"
              body="Her workspace bir dijital asset. Oracle interview ile 30+ entity (departman, agent, skill, workflow, OKR, ritüel, bütçe) 5 dakikada kurulur. Sen kabul edersin, Matrix yapar."
              speaker="Tank"
              quote="I hope you're ready, because if you're not, we're all gonna die."
            />
            <Pillar
              tone="quantum"
              order="02"
              title="Tek ekrandan portföy"
              body="5+ dijital asset paralel yönet. Portfolio Rollup tüm asset'lerin gelir, harcama, ROI, agent durumunu tek tabloda gösterir. Hangi asset bu hafta para kaybediyor — anında gör."
              speaker="Morpheus"
              quote="Free your mind."
            />
            <Pillar
              tone="nebula"
              order="03"
              title="EOS + AI hibrit"
              body="Gino Wickman'ın Traction sistemini AI ajanlara taşıdık. 90-day Rocks, Weekly Scorecard, L10 Meeting, IDS — hepsi Matrix'in günlük ritmi. Disiplin + hız."
              speaker="The Oracle"
              quote="Temet nosce — know thyself."
            />
          </div>
        </div>
      </section>

      {/* Why now */}
      <section className="relative z-10 px-8 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
            · Niçin şimdi ·
          </div>
          <h2 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-text">
            Bir &ldquo;şirket kurmak&rdquo; artık eski tanımıyla pahalı.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-text-muted">
            10 saatlik haftalık iş yükünü AI ajanlarla 50 saatlik çıktıya
            çevirebiliyorsan, neden tek bir asset'le sınırlı kalasın?{" "}
            <span className="text-text">5+ digital asset paralel yönetilebilen</span>{" "}
            holdco modeline geçiş, sadece operating system'in olduğunda anlamlı.
            Matrix bu OS.
          </p>
          <div className="mt-10 inline-flex items-center gap-2 rounded-lg border border-quantum/30 bg-quantum-soft/15 px-4 py-2 font-mono text-xs text-quantum">
            <Sparkles size={12} />
            Ferhan Yıldızlı tarafından tek kullanıcılı portföy için tasarlandı
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 border-t border-border/40 px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-text">
            Hazır mısın?
          </h2>
          <p className="mt-3 text-text-muted">
            Allowlist&apos;teysen magic-link ile 1 dakikada içeridesin.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-crimson via-quantum to-nebula px-8 py-3 text-sm font-semibold text-void shadow-[0_0_40px_rgba(61,224,168,0.3)] transition-all hover:scale-105"
            >
              <Sparkles size={14} />
              Matrix&apos;e Giriş
              <ArrowRight size={14} />
            </Link>
          </div>
          <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
            · Knock knock, Neo. ·
          </p>
        </div>
      </section>

      {/* Tiny footer */}
      <footer className="relative z-10 border-t border-border/30 px-8 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 font-mono text-[10px] text-text-faint sm:flex-row">
          <span>Matrix OS · v0.7 · Ferhan Yıldızlı</span>
          <div className="flex items-center gap-4">
            <Link href="/codex" className="hover:text-text-muted">
              Codex
            </Link>
            <Link href="/login" className="hover:text-text-muted">
              Login
            </Link>
            <span className="text-text-faint/60">© 2026 — Private holdco</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Pillar({
  tone,
  order,
  title,
  body,
  speaker,
  quote,
}: {
  tone: "ion" | "quantum" | "nebula";
  order: string;
  title: string;
  body: string;
  speaker: string;
  quote: string;
}) {
  const toneCls =
    tone === "ion"
      ? "border-ion/30 bg-ion-soft/10 text-ion"
      : tone === "quantum"
      ? "border-quantum/30 bg-quantum-soft/10 text-quantum"
      : "border-nebula/30 bg-nebula-soft/10 text-nebula";
  const accentText =
    tone === "ion" ? "text-ion" : tone === "quantum" ? "text-quantum" : "text-nebula";
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${toneCls} p-6`}>
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
          tone === "ion" ? "via-ion" : tone === "quantum" ? "via-quantum" : "via-nebula"
        } to-transparent`}
      />
      <div className="flex items-center gap-2">
        <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${accentText}`}>
          {order} ·
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
          {speaker}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{body}</p>
      <p className={`mt-4 border-t border-border/40 pt-3 font-mono text-[11px] italic ${accentText}`}>
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}
