"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import { Card } from "../ui/Card";
import { AlertOctagon, Power, ShieldAlert } from "lucide-react";

export function KillSwitchCard() {
  const { killSwitchArmed, toggleKillSwitch } = useWorkspaceStore();
  const [confirm, setConfirm] = useState(false);

  const armed = killSwitchArmed;

  const act = () => {
    if (!armed && !confirm) {
      setConfirm(true);
      return;
    }
    toggleKillSwitch();
    setConfirm(false);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        armed
          ? "border-crimson/50 bg-crimson-soft/10 shadow-[0_0_40px_rgba(255,90,111,0.25)]"
          : ""
      )}
    >
      {armed && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-crimson/15 via-transparent to-transparent" />
      )}

      <div className="relative flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
            armed
              ? "border-crimson/50 bg-crimson/15 text-crimson animate-pulse"
              : "border-border/60 bg-elevated text-text-muted"
          )}
        >
          <ShieldAlert size={20} strokeWidth={1.6} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.22em]",
                armed ? "text-crimson" : "text-text-faint"
              )}
            >
              Kill Switch
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                armed
                  ? "border-crimson/40 bg-crimson-soft text-crimson"
                  : "border-quantum/30 bg-quantum-soft text-quantum"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  armed ? "bg-crimson animate-breathe" : "bg-quantum"
                )}
              />
              {armed ? "armed" : "disarmed"}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-text">
            {armed
              ? "Tüm ajanlar duraklatıldı."
              : "Sistem normal çalışıyor."}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
            {armed
              ? "Hiçbir workflow tetiklenmiyor, hiçbir skill çalışmıyor, hiçbir external-send gönderilemez. Kontrolü geri aldığında her şey bıraktığı yerden devam eder."
              : "Bir şey ters giderse bu tek tuş tüm agent'ları anında pasifleştirir. Ortam değişkeni AGENT_KILL_SWITCH=on olarak işaretlenir."}
          </p>

          {confirm && !armed && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-solar/40 bg-solar-soft/30 px-3 py-2">
              <AlertOctagon size={14} className="text-solar" />
              <span className="text-sm text-text">
                Emin misin? Bu, tüm iş akışlarını anında durdurur.
              </span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={act}
              className={cn(
                "group relative inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200",
                armed
                  ? "bg-quantum text-void hover:shadow-[0_0_20px_rgba(61,224,168,0.5)]"
                  : confirm
                  ? "bg-crimson text-void hover:shadow-[0_0_20px_rgba(255,90,111,0.5)] animate-pulse"
                  : "bg-crimson/20 text-crimson border border-crimson/40 hover:bg-crimson/30"
              )}
            >
              <Power
                size={15}
                strokeWidth={2}
                className={cn(armed && "rotate-180")}
              />
              {armed
                ? "Sistemi geri getir"
                : confirm
                ? "Onaylıyorum — tetikle"
                : "Kill switch'i tetikle"}
            </button>
            {confirm && !armed && (
              <button
                onClick={() => setConfirm(false)}
                className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-elevated hover:text-text"
              >
                Vazgeç
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
