"use client";

import { Card } from "../ui/Card";
import { DnaGauge } from "./DnaGauge";
import type { Workspace } from "@/lib/types";
import { Button } from "../ui/Button";
import { RefreshCcw, Save } from "lucide-react";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";
import { toast } from "@/lib/toast";

export function VisionHero({ ws }: { ws: Workspace }) {
  return (
    <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
      <MatrixHexGrid tone="nebula" opacity={0.08} />
      <div className="pointer-events-none absolute -top-24 right-1/4 h-48 w-[500px] rounded-full bg-nebula/10 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <span className="h-px w-6 bg-border-strong" />
            The Prime Program · {ws.industry}
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            {ws.name} <span className="text-text-muted">·</span>{" "}
            <span className="text-text-muted">DNA</span>
          </h1>
          <p className="mt-3 text-base text-text-muted leading-relaxed">
            Bu workspace'in stratejik DNA'sı burada tanımlanır. Misyon, vizyon, temalar ve
            değer çıpaları — Oracle her gece bu temeli kullanarak organizasyonun hizalı olup
            olmadığını denetler.
          </p>

          <div className="mt-5 flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              className="gap-1.5"
              onClick={() =>
                toast({
                  tone: "quantum",
                  title: "DNA kaydedildi",
                  description: `${ws.name} Prime Program snapshot'ı alındı — Oracle bir sonraki taramada yeni DNA'ya göre hizayı denetler.`,
                })
              }
            >
              <Save size={14} />
              DNA'yı kaydet
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="gap-1.5"
              onClick={() =>
                toast({
                  tone: "ion",
                  title: "Revizyon geçmişi",
                  description: "Son 5 revizyon bu workspace için yakında burada listelenecek.",
                })
              }
            >
              <RefreshCcw size={14} />
              Revizyon geçmişi
            </Button>
          </div>
        </div>

        <Card className="w-full max-w-md p-5">
          <DnaGauge ws={ws} />
        </Card>
      </div>

      <div className="relative mt-6 max-w-2xl">
        <MatrixQuote speaker={MODULE_QUOTES["/vision"].speaker} tone={MODULE_QUOTES["/vision"].tone}>
          {MODULE_QUOTES["/vision"].line}
        </MatrixQuote>
      </div>
    </section>
  );
}
