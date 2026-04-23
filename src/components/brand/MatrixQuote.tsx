import { cn } from "@/lib/cn";
import { Quote } from "lucide-react";

/**
 * MatrixQuote — each Matrix-named module carries a canon quote from the
 * trilogy. Placed subtly at the bottom of hero sections to anchor the brand.
 *
 * Usage:
 *   <MatrixQuote speaker="The Oracle" tone="nebula">
 *     Being The One is just like being in love.
 *   </MatrixQuote>
 */
export function MatrixQuote({
  speaker,
  tone = "nebula",
  className,
  children,
}: {
  speaker: string;
  tone?: "ion" | "nebula" | "quantum" | "solar" | "crimson";
  className?: string;
  children: React.ReactNode;
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

  return (
    <div
      className={cn(
        "flex items-start gap-2 border-l-2 pl-3 font-mono text-[11px] italic leading-relaxed text-text-muted",
        toneBorder,
        className
      )}
    >
      <Quote size={11} strokeWidth={1.5} className={cn("mt-0.5 shrink-0", toneText)} />
      <span>
        {children}
        <span className={cn("ml-2 not-italic text-[10px] uppercase tracking-wider", toneText)}>
          — {speaker}
        </span>
      </span>
    </div>
  );
}

/**
 * Canon Matrix quotes mapped to each module, keyed by route path.
 * Use `MODULE_QUOTES[pathname]` to get the default quote for a page.
 */
export const MODULE_QUOTES: Record<
  string,
  {
    line: string;
    speaker: string;
    tone: "ion" | "nebula" | "quantum" | "solar" | "crimson";
  }
> = {
  "/": {
    line: "Welcome to the desert of the real.",
    speaker: "Morpheus",
    tone: "ion",
  },
  "/business": {
    line: "Hope. It is the quintessential human delusion — and the source of our greatest strength.",
    speaker: "The Architect",
    tone: "solar",
  },
  "/blueprints": {
    line: "Every key is a door.",
    speaker: "The Keymaker",
    tone: "solar",
  },
  "/vision": {
    line: "The body cannot live without the mind.",
    speaker: "Morpheus",
    tone: "nebula",
  },
  "/org": {
    line: "Ergo, concordantly, vis-à-vis — the matrix is a perfectly balanced system.",
    speaker: "The Architect",
    tone: "ion",
  },
  "/library": {
    line: "Everything that has a beginning has an end.",
    speaker: "The Oracle",
    tone: "nebula",
  },
  "/workflows": {
    line: "There is no spoon.",
    speaker: "Spoon Boy",
    tone: "quantum",
  },
  "/connectors": {
    line: "My name is Seraph. I protect that which matters most.",
    speaker: "Seraph",
    tone: "ion",
  },
  "/models": {
    line: "I am that which connects all things. I am The Source.",
    speaker: "The Source",
    tone: "nebula",
  },
  "/spend": {
    line: "Choice. The problem is choice.",
    speaker: "Neo",
    tone: "solar",
  },
  "/goals": {
    line: "You have the sight now, Neo. You are looking at the world without time.",
    speaker: "The Oracle",
    tone: "quantum",
  },
  "/traction": {
    line: "I can only show you the door. You're the one that has to walk through it.",
    speaker: "Morpheus",
    tone: "nebula",
  },
  "/oracle": {
    line: "Being The One is just like being in love. No one can tell you you're in love — you just know it.",
    speaker: "The Oracle",
    tone: "nebula",
  },
  "/control": {
    line: "Buckle up, Dorothy — because Kansas is going bye-bye.",
    speaker: "Cypher",
    tone: "solar",
  },
  "/insights": {
    line: "What is real? How do you define 'real'?",
    speaker: "Morpheus",
    tone: "ion",
  },
};
