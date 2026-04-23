"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Subtle digital rain — a nod to the Matrix title sequence.
 * Characters fall in thin vertical streams, most are dim, the "head" of
 * each stream glows a little brighter.
 *
 * Designed as a decorative backdrop: low opacity, absolute-positioned, must
 * be placed inside a relatively-positioned container. Kept CPU-cheap by
 * animating only via CSS transforms (no per-frame JS).
 */
const GLYPHS =
  "アァカサタナハマヤャラワガザダバパイィキシチニヒミリギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン01234567890123".split(
    ""
  );

function pickGlyph(seed: number): string {
  return GLYPHS[seed % GLYPHS.length];
}

interface Column {
  left: number; // percentage
  delay: number; // seconds
  duration: number; // seconds
  length: number; // chars per stream
  seed: number;
}

export function MatrixCodeRain({
  columns = 14,
  className,
  tone = "quantum",
  opacity = 0.2,
}: {
  columns?: number;
  className?: string;
  tone?: "quantum" | "ion" | "nebula" | "solar";
  opacity?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const pool = useRef<Column[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cols = useMemo<Column[]>(() => {
    if (pool.current.length > 0) return pool.current;
    const arr: Column[] = [];
    for (let i = 0; i < columns; i++) {
      arr.push({
        left: (100 / columns) * i + (((i * 37) % 7) - 3) * 0.6,
        delay: ((i * 11) % 100) / 10,
        duration: 6 + ((i * 17) % 8),
        length: 9 + ((i * 23) % 6),
        seed: i * 97 + 13,
      });
    }
    pool.current = arr;
    return arr;
  }, [columns]);

  const color =
    tone === "ion"
      ? "#4db8ff"
      : tone === "nebula"
      ? "#9b7bff"
      : tone === "solar"
      ? "#ffb547"
      : "#3de0a8";

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      style={{ opacity }}
      aria-hidden
    >
      {cols.map((col, i) => (
        <div
          key={i}
          className="absolute top-0 font-mono"
          style={{
            left: `${col.left}%`,
            animation: `mx-fall ${col.duration}s linear ${col.delay}s infinite`,
          }}
        >
          {Array.from({ length: col.length }).map((_, j) => {
            const glyph = pickGlyph(col.seed + j * 3);
            const isHead = j === col.length - 1;
            const dim = Math.max(0.15, 1 - j / col.length);
            return (
              <div
                key={j}
                className="select-none text-[12px] leading-[1.15]"
                style={{
                  color,
                  textShadow: isHead ? `0 0 8px ${color}` : "none",
                  opacity: isHead ? 1 : dim * 0.6,
                }}
              >
                {glyph}
              </div>
            );
          })}
        </div>
      ))}

      {/* Keyframes — scoped */}
      <style>{`
        @keyframes mx-fall {
          0% { transform: translateY(-120%); }
          100% { transform: translateY(120vh); }
        }
      `}</style>
    </div>
  );
}
