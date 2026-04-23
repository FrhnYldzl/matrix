"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { MatrixCodeRain } from "./MatrixCodeRain";
import { MatrixQuote } from "./MatrixQuote";
import { Button } from "../ui/Button";

/**
 * Shared chrome for the Matrix-flavoured easter-egg pages:
 *   404 / 500 / rate-limit / approval-pending / deploy-preview.
 *
 * Each page just provides content; this wraps it in the ship's aesthetic.
 */
export function MatrixErrorFrame({
  code,
  title,
  description,
  speaker,
  quote,
  tone = "nebula",
  primaryAction,
  secondaryAction,
  children,
}: {
  code: string; // "404", "500", "429", "PENDING", "DEPLOY"
  title: string;
  description: string;
  speaker: string;
  quote: string;
  tone?: "ion" | "nebula" | "quantum" | "solar" | "crimson";
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  children?: React.ReactNode;
}) {
  const toneText =
    tone === "ion"
      ? "text-ion"
      : tone === "quantum"
      ? "text-quantum"
      : tone === "solar"
      ? "text-solar"
      : tone === "crimson"
      ? "text-crimson"
      : "text-nebula";

  const toneBorder =
    tone === "ion"
      ? "border-ion/30"
      : tone === "quantum"
      ? "border-quantum/30"
      : tone === "solar"
      ? "border-solar/30"
      : tone === "crimson"
      ? "border-crimson/30"
      : "border-nebula/30";

  const toneRain =
    tone === "ion" || tone === "crimson" || tone === "solar" ? tone : "quantum";

  return (
    <main className="relative flex min-h-[100vh] items-center justify-center overflow-hidden bg-void px-6 py-12">
      {/* Background code rain */}
      <MatrixCodeRain tone={toneRain as "quantum" | "ion" | "nebula" | "solar"} opacity={0.22} columns={24} />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/50 via-void/30 to-void/60" />

      <div className="relative z-10 w-full max-w-2xl">
        <div
          className={cn(
            "overflow-hidden rounded-2xl border bg-surface/90 p-8 shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-xl",
            toneBorder
          )}
        >
          {/* Glyph + code */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border font-mono text-base font-bold",
                toneBorder,
                toneText,
                "bg-elevated/40"
              )}
            >
              {code}
            </div>
            <div>
              <div className={cn("font-mono text-[10px] uppercase tracking-[0.22em]", toneText)}>
                system · {speaker.toLowerCase()}
              </div>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-text md:text-3xl">
                {title}
              </h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-text-muted">{description}</p>

          {children && <div className="mt-5">{children}</div>}

          {/* Quote */}
          <div className="mt-6">
            <MatrixQuote speaker={speaker} tone={tone}>
              {quote}
            </MatrixQuote>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {primaryAction && (
              <Link href={primaryAction.href}>
                <Button variant="primary" size="md">
                  {primaryAction.label}
                </Button>
              </Link>
            )}
            {secondaryAction && (
              <Link href={secondaryAction.href}>
                <Button variant="secondary" size="md">
                  {secondaryAction.label}
                </Button>
              </Link>
            )}
            <Link
              href="/"
              className="ml-auto font-mono text-[10px] uppercase tracking-wider text-text-faint hover:text-text"
            >
              ← The Construct
            </Link>
          </div>
        </div>

        {/* Footer watermark */}
        <div className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
          MATRIX · Agent Organization OS
        </div>
      </div>
    </main>
  );
}
