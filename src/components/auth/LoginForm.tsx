"use client";

import { useState } from "react";
import { MatrixCodeRain } from "@/components/brand/MatrixCodeRain";
import { MatrixQuote } from "@/components/brand/MatrixQuote";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Mail, Terminal } from "lucide-react";

/**
 * LoginForm — "Operator Console" sign-in.
 *
 * SADELEŞTİRİLMİŞ AKIŞ (Ferhan: "magic link işi karıştırıyor, kaldır"):
 *   - Kullanıcı email girer + "Giriş yap" tıklar
 *   - API allowlist kontrolü yapar, doğrudan session cookie set eder
 *   - Frontend window.location.href = "/dashboard" yönlendirir
 *   - Magic-link email tıklama adımı YOK (Resend dependency yok)
 *
 * Allowlist hâlâ aktif — yetkisiz email giriş yapamaz. 2FA istersek
 * ileride magic-link flow'una geri dönülebilir.
 */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "error", message: data.error || "Bir sorun oluştu" });
        return;
      }
      // Direct redirect — session cookie zaten set edildi
      window.location.href = data.redirect || "/dashboard";
    } catch {
      setState({ kind: "error", message: "Ağ hatası — tekrar dene" });
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-6 py-12">
      <MatrixCodeRain tone="ion" opacity={0.2} columns={22} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/40 via-void/20 to-void/50" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-ion/30 bg-surface/90 p-8 shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          {/* Brand */}
          <div className="flex items-center gap-3 border-b border-border/50 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-ion/40 bg-ion-soft text-ion">
              <Terminal size={18} />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
                Matrix · Operator Console
              </div>
              <div className="mt-0.5 text-sm font-medium text-text">
                Agent Organization OS
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                E-posta · allowlist doğrulaması
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-md border border-border/60 bg-elevated/50 px-3 py-2">
                <Mail size={14} className="text-text-faint" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ferhan@ferhan.co"
                  required
                  autoFocus
                  className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
                />
              </div>
              <p className="mt-2 font-mono text-[10px] text-text-faint">
                Yetkili adresleri Matrix tanıyor. Diğerleri reddedilir.
              </p>
            </div>

            {state.kind === "error" && (
              <div className="flex items-start gap-2 rounded-md border border-crimson/30 bg-crimson-soft/20 p-3 text-xs text-crimson">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <span>{state.message}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={state.kind === "loading"}
            >
              {state.kind === "loading" ? "Giriş yapılıyor…" : "Giriş yap"}
            </Button>

            <p className="text-center font-mono text-[10px] text-text-faint">
              7 gün geçerli oturum · sadece bu cihaz
            </p>
          </form>

          <div className="mt-6 border-t border-border/50 pt-5">
            <MatrixQuote speaker="Morpheus" tone="ion">
              You take the blue pill, the story ends. You take the red pill, you stay in Wonderland.
            </MatrixQuote>
          </div>
        </div>

        <div className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
          MATRIX · Agent Organization OS · Private Holdco
        </div>
      </div>
    </main>
  );
}
