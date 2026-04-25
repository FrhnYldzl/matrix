/**
 * Matrix OS · Claude wrapper.
 *
 * Orchestrator'ın LLM çağrı yüzü. Anthropic SDK'yı tek yerde sarıp:
 *   - kilit nokta model routing (Opus vs Sonnet vs Haiku) yapar
 *   - input/output token sayısını döndürür (cost tracking için)
 *   - system prompt + structured messages + tool_use akışını soyutlar
 *   - ANTHROPIC_API_KEY yoksa simulated mode'da çalışır (dev / park mode)
 *
 * B+1 sprint'te: tools array (MCP server'ları) + streaming response.
 */

import Anthropic from "@anthropic-ai/sdk";

// Matrix'in kullandığı canonical model id'leri (llm-catalog.ts ile eşleşir)
export type ClaudeModelId =
  | "claude-opus-4-6-20260215" // reasoning + long-horizon tasks
  | "claude-sonnet-4-6-20260110" // default day-to-day
  | "claude-haiku-4-6-20260110"; // fast + low-cost triage

export const DEFAULT_MODEL: ClaudeModelId = "claude-sonnet-4-6-20260110";

export interface ClaudeCallParams {
  /** LLM model id — default: sonnet */
  model?: ClaudeModelId;
  /** System prompt (agent/skill persona) */
  system?: string;
  /** User message — Matrix'in içinde hazırlanır */
  user: string;
  /** Maksimum output token */
  maxTokens?: number;
  /** Sampling temperature 0-1 */
  temperature?: number;
}

export interface ClaudeCallResult {
  /** Assistant response — text content concat'lenmiş */
  text: string;
  /** Token usage — cost attribution için */
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  /** Matrix'in kullandığı model id */
  model: ClaudeModelId;
  /** "real" → gerçek API çağrısı yapıldı, "simulated" → API key yok, mock döndü */
  mode: "real" | "simulated";
  /** Gerçek-dünya süresi */
  durationMs: number;
}

/**
 * Claude'a bir soru sor.
 *
 * ANTHROPIC_API_KEY tanımlıysa gerçek SDK çağrısı yapar.
 * Yoksa "simulated" mode'da sahte bir cevap döner — orchestrator yine
 * AgentRun record'unu başarıyla yazar ve ilk end-to-end path test
 * edilebilir olur. API key ekler eklemez kod aynı, çıktı gerçekleşir.
 */
export async function callClaude(
  params: ClaudeCallParams
): Promise<ClaudeCallResult> {
  const model = params.model ?? DEFAULT_MODEL;
  const maxTokens = params.maxTokens ?? 1024;
  const temperature = params.temperature ?? 0.7;
  const started = Date.now();

  // Matrix-spesifik variable adı öncelikli (başka projelerle karışmasın),
  // standart ANTHROPIC_API_KEY ise fallback
  const apiKey =
    process.env.MATRIX_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;

  // ── SIMULATED MODE ──────────────────────────────────────────────────────
  if (!apiKey) {
    const simulated = `[Matrix simulated response — ANTHROPIC_API_KEY not set]\n\nYou asked:\n> ${params.user.slice(0, 180)}${params.user.length > 180 ? "…" : ""}\n\nEkli Anthropic SDK (0.91.0) ile gerçek Claude çağrısı için Railway Variables'a ANTHROPIC_API_KEY ekle. O zaman bu çıktı gerçek ${model} cevabıyla yer değiştirir.`;
    return {
      text: simulated,
      usage: {
        inputTokens: Math.ceil(params.user.length / 4),
        outputTokens: Math.ceil(simulated.length / 4),
      },
      model,
      mode: "simulated",
      durationMs: Date.now() - started,
    };
  }

  // ── REAL SDK CALL ───────────────────────────────────────────────────────
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  // Content block'larından text'i topla (tool_use + thinking bloklarını sonraki sprint'te)
  const text = response.content
    .flatMap((c) => (c.type === "text" && "text" in c ? [c.text] : []))
    .join("\n");

  return {
    text,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
    model,
    mode: "real",
    durationMs: Date.now() - started,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Cost estimation — llm-catalog.ts ile uyumlu fiyatlandırma
// ───────────────────────────────────────────────────────────────────────────

const MODEL_PRICING_USD_PER_M_TOKENS: Record<
  ClaudeModelId,
  { input: number; output: number }
> = {
  "claude-opus-4-6-20260215": { input: 15, output: 75 },
  "claude-sonnet-4-6-20260110": { input: 3, output: 15 },
  "claude-haiku-4-6-20260110": { input: 0.25, output: 1.25 },
};

export function estimateCostUsd(
  model: ClaudeModelId,
  usage: { inputTokens: number; outputTokens: number }
): number {
  const p = MODEL_PRICING_USD_PER_M_TOKENS[model];
  const inCost = (usage.inputTokens / 1_000_000) * p.input;
  const outCost = (usage.outputTokens / 1_000_000) * p.output;
  return inCost + outCost;
}
