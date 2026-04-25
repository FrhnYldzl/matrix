"use client";

/**
 * OracleCommandPalette — Cmd+K ile her sayfada açılan sticky Oracle sohbeti.
 *
 * Ferhan'ın "Vibe Business" doktrini:
 *   "Oracle benim yerime işi yönetsin, sonuçları göreyim. Varlıklar var,
 *    sanki işlem yapılan hisse ve fonlar gibi."
 *
 * Felsefe:
 *   - Konuşma birinci, dashboard ikinci, navigasyon üçüncü
 *   - Her sayfada Cmd+K → Oracle açılır
 *   - Workspace bağlamını otomatik gönderir (current workspace + entity sayıları)
 *   - Sohbet geçmişi localStorage'da kalıcı (Zustand persist)
 *   - Modal kapansa da konuşma kaybolmaz, sonraki Cmd+K kaldığı yerden devam eder
 *
 * Klavye:
 *   Cmd+K (Mac) / Ctrl+K (Win) → Aç/Kapat
 *   ESC → Kapat
 *   Enter → Gönder (Shift+Enter yeni satır)
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useWorkspaceStore, type OracleChatMessage } from "@/lib/store";
import { cn } from "@/lib/cn";
import { ArrowRight, Eraser, Sparkles, X, Zap } from "lucide-react";

interface PaletteContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

// Module-level singleton — herhangi bir component setOpen edebilir
let externalSetOpen: ((v: boolean) => void) | null = null;

/** Programatik açma — TopBar gibi yerlerden çağrılır */
export function openOraclePalette() {
  externalSetOpen?.(true);
}

export function OracleCommandPalette() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [oracleTyping, setOracleTyping] = useState(false);
  const [mode, setMode] = useState<"real" | "simulated" | "error" | "init">("init");
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Store
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const createdAgents = useWorkspaceStore((s) => s.createdAgents);
  const createdSkills = useWorkspaceStore((s) => s.createdSkills);
  const createdWorkflows = useWorkspaceStore((s) => s.createdWorkflows);
  const createdGoals = useWorkspaceStore((s) => s.createdGoals);
  const createdOperatorTasks = useWorkspaceStore((s) => s.createdOperatorTasks);
  const createdRituals = useWorkspaceStore((s) => s.createdRituals);
  const oracleChatHistory = useWorkspaceStore((s) => s.oracleChatHistory);
  const appendOracleMessage = useWorkspaceStore((s) => s.appendOracleMessage);
  const clearOracleChat = useWorkspaceStore((s) => s.clearOracleChat);

  const ws = workspaces.find((w) => w.id === wsId);
  const historyKey = wsId || "__global__";
  const messages = useMemo(
    () => oracleChatHistory[historyKey] ?? [],
    [oracleChatHistory, historyKey]
  );

  // External setOpen çıkar
  useEffect(() => {
    externalSetOpen = setOpen;
    return () => {
      externalSetOpen = null;
    };
  }, []);

  // Mount + portal
  useEffect(() => setMounted(true), []);

  // Cmd+K / Ctrl+K listener (global)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Cmd+K (Mac) veya Ctrl+K (Win/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Açıldığında textarea'ya focus
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, oracleTyping, open]);

  async function sendMessage(text: string) {
    const userMsg: OracleChatMessage = {
      role: "user",
      content: text,
      at: new Date().toISOString(),
    };
    appendOracleMessage(wsId || null, userMsg);
    setInput("");
    setOracleTyping(true);

    try {
      // Workspace context'i hazırla
      const workspaceCtx = ws
        ? {
            id: ws.id,
            name: ws.name,
            industry: ws.industry,
            mission: ws.mission,
            agentCount: createdAgents.filter((c) => c.entity.workspaceId === ws.id)
              .length,
            skillCount: createdSkills.filter((c) => c.entity.workspaceId === ws.id)
              .length,
            workflowCount: createdWorkflows.filter(
              (c) => c.entity.workspaceId === ws.id
            ).length,
            goalCount: createdGoals.filter((c) => c.entity.workspaceId === ws.id)
              .length,
            taskOpenCount: createdOperatorTasks.filter(
              (c) =>
                c.entity.workspaceId === ws.id && c.entity.status === "todo"
            ).length,
            ritualActiveCount: createdRituals.filter(
              (c) => c.entity.workspaceId === ws.id && c.entity.active
            ).length,
          }
        : null;

      // Mesaj geçmişi (kullanıcı mesajı dahil)
      const historyForApi = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: text },
      ];

      const res = await fetch("/api/oracle/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
          workspace: workspaceCtx,
        }),
      });
      const data = await res.json();
      if (data.mode) setMode(data.mode);
      if (data.content) {
        appendOracleMessage(wsId || null, {
          role: "assistant",
          content: data.content,
          at: new Date().toISOString(),
        });
      }
    } catch {
      setMode("error");
      appendOracleMessage(wsId || null, {
        role: "assistant",
        content:
          "Matrix ile bağlantım koptu. Bir saniye sonra dene — ben buradayım.",
        at: new Date().toISOString(),
      });
    } finally {
      setOracleTyping(false);
    }
  }

  function handleSubmit() {
    const text = input.trim();
    if (!text || oracleTyping) return;
    void sendMessage(text);
  }

  function clearHistory() {
    clearOracleChat(wsId || null);
  }

  if (!mounted || !open) return null;

  // Quick prompt suggestions — workspace varsa farklı, yoksa farklı
  const quickPrompts = ws
    ? [
        "Bu varlık bu hafta ne durumda?",
        "Sıradaki en yüksek leverage'lı aksiyon ne?",
        "Hangi metrik beni en çok endişelendirmeli?",
        "Bu varlık için yeni bir gelir kanalı önerir misin?",
      ]
    : [
        "Yeni varlık kurmak istiyorum, başlayalım",
        "Newsletter mı SaaS mı daha hızlı para getirir?",
        "Az saatim var, hangi varlık türü bana uygun?",
        "Hero's Journey'de neredeyim?",
      ];

  const dialog = (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 py-[6vh]">
      <button
        onClick={() => setOpen(false)}
        aria-label="Kapat"
        className="absolute inset-0 bg-void/85 backdrop-blur-sm"
      />

      <div
        className="relative flex max-h-[88vh] w-[min(720px,98vw)] flex-col overflow-hidden rounded-2xl border border-nebula/40 bg-surface/95 shadow-[0_30px_80px_-20px_rgba(155,123,255,0.4)] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="relative overflow-hidden border-b border-border/60 px-5 py-3">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-nebula/40 bg-nebula-soft text-nebula shadow-[0_0_20px_rgba(155,123,255,0.4)]">
                <Sparkles size={14} />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
                  The Oracle · Cmd+K
                </div>
                <div className="text-sm font-medium text-text">
                  {ws ? `${ws.name} · cofounder` : "Portföy yöneticisi"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {mode === "simulated" && (
                <span className="rounded-md border border-solar/30 bg-solar-soft/30 px-2 py-1 font-mono text-[9px] text-solar">
                  ⚠ simulated
                </span>
              )}
              {mode === "real" && (
                <span className="rounded-md border border-quantum/30 bg-quantum-soft/30 px-2 py-1 font-mono text-[9px] text-quantum">
                  ✓ live
                </span>
              )}
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="rounded-md p-1.5 text-text-faint transition-colors hover:bg-elevated/40 hover:text-text-muted"
                  aria-label="Sohbeti temizle"
                  title="Sohbeti temizle"
                >
                  <Eraser size={12} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-text-faint transition-colors hover:bg-elevated/40 hover:text-text-muted"
                aria-label="Kapat"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <EmptyState
              workspaceName={ws?.name}
              quickPrompts={quickPrompts}
              onPick={(p) => void sendMessage(p)}
            />
          ) : (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} text={m.content} />
              ))}
              {oracleTyping && <TypingBubble />}
            </div>
          )}
        </div>

        {/* Footer input */}
        <footer className="border-t border-border/60 bg-elevated/20 px-5 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-end gap-2 rounded-lg border border-border/60 bg-elevated/40 px-3 py-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={
                oracleTyping
                  ? "Oracle yazıyor…"
                  : "Oracle'a sor — varlık, gelir, aksiyon… (Enter gönder)"
              }
              rows={1}
              disabled={oracleTyping}
              className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-text-faint disabled:opacity-50 max-h-32"
            />
            <button
              type="submit"
              disabled={!input.trim() || oracleTyping}
              className="inline-flex items-center gap-1 rounded-md bg-nebula px-2.5 py-1.5 text-xs font-medium text-void transition-all hover:bg-nebula/90 disabled:opacity-40"
            >
              <ArrowRight size={11} />
            </button>
          </form>
          <p className="mt-2 text-center font-mono text-[10px] text-text-faint">
            <Zap size={9} className="mr-1 inline text-nebula" />
            Vibe Business · Oracle yönetir, sen sonuçları görürsün
          </p>
        </footer>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

// ───────────────────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────────────────

function EmptyState({
  workspaceName,
  quickPrompts,
  onPick,
}: {
  workspaceName?: string;
  quickPrompts: string[];
  onPick: (text: string) => void;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="rounded-xl border border-nebula/30 bg-nebula-soft/15 p-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
          <Sparkles size={11} />
          {workspaceName ? `${workspaceName} · varlık modu` : "Portföy modu"}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-text">
          {workspaceName
            ? `${workspaceName} senin dijital varlığın — sanki bir hisse senedi gibi. Bu hafta nasıl performans gösterdiğini, müdahale gereken yerleri ve bir sonraki hamleni birlikte görebiliriz.`
            : "Henüz portföye varlık eklemedin. Hadi ilk varlığın için Hero's Journey eşiğine gidelim."}
        </p>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          Hızlı sorular
        </div>
        <div className="mt-2 space-y-1.5">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onPick(p)}
              className="group flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 bg-elevated/30 px-3 py-2 text-left text-sm text-text-muted transition-all hover:border-nebula/40 hover:bg-nebula-soft/15 hover:text-text"
            >
              <span>{p}</span>
              <ArrowRight
                size={11}
                className="text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-nebula"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isOracle = role === "assistant";
  return (
    <div className={cn("flex", isOracle ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[88%] rounded-xl px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap",
          isOracle
            ? "border border-nebula/30 bg-nebula-soft/30 text-text"
            : "bg-ion text-void"
        )}
      >
        {isOracle && (
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-nebula">
            <Sparkles size={9} />
            Oracle
          </div>
        )}
        <p>{text}</p>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-xl border border-nebula/30 bg-nebula-soft/20 px-3.5 py-2.5">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-nebula [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-nebula [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-nebula [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );
}
