"use client";

/**
 * Glossary — Matrix jargonunu inline açıklayan tooltip + drawer.
 *
 * Felsefe: Ferhan'ın Boeing kokpit eleştirisi — "DNA, OKR, Ritüel, Rock,
 * Scorecard… kullanıcı bilmiyor, korkutuyor". Her terim ilk geçtiğinde
 * Glossary'den geçer, kullanıcı "bu ne demek?" sorusunu **anında** alır.
 *
 * Kullanım:
 *   <GlossaryTerm term="DNA">DNA</GlossaryTerm>
 *   <GlossaryTerm term="OKR">OKR</GlossaryTerm>
 *
 * Hover/tap → mini tooltip. Detaylı açıklama için tooltip'te "Daha fazla"
 * Oracle drawer'ı açar.
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { HelpCircle } from "lucide-react";

export type GlossaryKey =
  | "dna"
  | "okr"
  | "rock"
  | "ritual"
  | "scorecard"
  | "l10"
  | "leverage"
  | "mrr"
  | "blueprint"
  | "skill"
  | "agent"
  | "workflow"
  | "department"
  | "connector"
  | "approval"
  | "kill-switch"
  | "auto-pilot"
  | "streak"
  | "ids"
  | "external-send";

interface GlossaryEntry {
  short: string; // 1 cümle, hover tooltip'te görünür
  long: string; // 2-3 cümle, drawer'da görünür
  example?: string; // somut örnek
  oracleNote?: string; // Oracle'ın eklediği yorum
}

const GLOSSARY: Record<GlossaryKey, GlossaryEntry> = {
  dna: {
    short: "Asset'in 'kim olduğu' — mission, vision, stratejik temalar.",
    long:
      "DNA = bu asset'in karakteri. Misyon (niye var?), Vizyon (3-5 yıl sonra ne olacak?) ve 3-5 stratejik tema. Oracle her aksiyonu 'DNA ile uyumlu mu?' diye kontrol eder.",
    example: "Newsletter için DNA: 'AI tools haberlerinin en güvenilir kaynağı.'",
    oracleNote: "Sen yazmadıysan ben varsayılan koydum. Sonra rafine ederiz.",
  },
  okr: {
    short: "Hedef + ölçüm. 'Bu çeyrek $5K MRR' gibi.",
    long:
      "OKR = Objectives & Key Results. Bir Objective (hedef) + onu ölçen 1-3 Key Result (sayı). Matrix'te 'Goal' diyoruz. Her OKR bir agent veya skill'e bağlanır — hedefi takip eden o.",
    example: "Hedef: $5K MRR. Ölçüm: aylık abonelik geliri (6 ayda).",
    oracleNote: "Onboarding cevaplarından 4 OKR çıkardım. Onaylar mısın?",
  },
  rock: {
    short: "Çeyreklik büyük taahhüt — 90 günde bitirilecek tek bir şey.",
    long:
      "Rock = Gino Wickman'ın EOS sisteminden. 'Bu çeyrek bitirilecek 3-7 büyük şey'. Her birinin sahibi (insan veya agent) ve milestone'ları var. Çeyrek sonunda done veya dropped.",
    example: "Q2 Rock: 'Beehiiv migration tamamlandı, ilk 100 sub geçişti.'",
  },
  ritual: {
    short: "Tekrar eden iş bloğu — L10, Weekly Review, Deep Work.",
    long:
      "Ritual = haftalık veya günlük disiplin. Workflow değil çünkü insan ritmi (agent değil). Calendar'a düşer. Streak sayacı tutulur — 5 hafta üst üste tutturursan +300 XP.",
    example: "Pazartesi 09:30 · L10 Meeting (90 dk).",
  },
  scorecard: {
    short: "13 hafta rolling metrik takibi.",
    long:
      "Scorecard = haftalık rakamsal sağlık paneli. Her satır bir metrik (sub sayısı, MRR, churn). 13 hafta tutulur, off-track olanlar otomatik Issue'ya düşer.",
  },
  l10: {
    short: "Pazartesi 90 dk haftalık meeting (EOS).",
    long:
      "Level 10 Meeting = EOS'un kalbi. 7 bölüm: Segue → Scorecard → Rocks → Customer/Employee Headlines → To-Do → IDS → Conclude. Solo iseniz kendinle yaparsın.",
  },
  leverage: {
    short: "Delegasyon saati / yönetim saati oranı (5x+ hedef).",
    long:
      "Leverage = Matrix'in bu hafta sana kaç saat kazandırdığı. Eğer 1 saat ayarlama yapıp 5 saat agent çıktısı alıyorsan 5x. The Truth modülü bunu hesaplar.",
  },
  mrr: {
    short: "Aylık tekrar eden gelir (Monthly Recurring Revenue).",
    long:
      "MRR = SaaS, newsletter premium, subscription gelirleri. One-time satışlar dahil değil. Holdco'nun en sağlıklı metriği — predictable cash flow.",
  },
  blueprint: {
    short: "Hazır departman paketi — 12 dk'da kurar.",
    long:
      "Blueprint = bir departmanın canonical seti (agent + skill + workflow + OKR). 'Sales & Marketing' Blueprint'i tek tıkla 4 agent + 6 skill + 3 workflow + 4 OKR kurar. The Keymaker modülünde.",
  },
  skill: {
    short: "Yeniden kullanılabilir prosedür — agent çağırır.",
    long:
      "Skill = adımlara bölünmüş bir prosedür (SKILL.md). Agent'lar skill'leri çağırır. Örn 'lead-enrichment' skill'i. ClawHub gibi marketplace'ten import edilebilir (yakında).",
  },
  agent: {
    short: "Bir rolü yürüten AI birimi.",
    long:
      "Agent = belirli scope (read/write/external-send) ve skill set'i olan AI rolü. 'sales-assistant', 'content-writer' gibi. The Architect'te departmanlara yerleşir.",
  },
  workflow: {
    short: "Trigger + adım zinciri — otomatik çalışan iş akışı.",
    long:
      "Workflow = trigger (cron/webhook/manual) + adımlar (skill çağrı, integration, approval, notify). The Loading Program'da görsel kurarsın.",
  },
  department: {
    short: "Bir görev alanı — Sales, Ops, Customer Success.",
    long:
      "Department = workspace'in iç yapısının bir parçası. Sales, Marketing, Customer Success, Finance gibi. Her departmanın agent'ları + workflow'ları olur.",
  },
  connector: {
    short: "Dış sistem köprüsü — Stripe, HubSpot, Slack.",
    long:
      "Connector = dış servise bağlantı (API key + scope). Skill'ler connector üzerinden iş yapar. TrainStation modülünde 62+ connector var.",
  },
  approval: {
    short: "Onay kuyruğu — external-send her zaman buradan geçer.",
    long:
      "Approval = Matrix'in 'insan son söz' prensibi. Email send, Stripe refund, tweet post gibi external aksiyonlar Control Room'a düşer. Sen onaylamazsan Matrix dışarıya dokunmaz.",
  },
  "kill-switch": {
    short: "Tüm agent'ları aniden durdur.",
    long:
      "Kill switch = acil durum tetiği. Bir agent deli saçma davransa veya cost patlatma görsen tek tık ile tüm workspace'i durdurursun. Control Room'da.",
  },
  "auto-pilot": {
    short: "Matrix kendi yapar, sen sadece monitor edersin.",
    long:
      "Auto-pilot ON = Oracle önerileri otomatik kabul, her quick-win otomatik tamamlandı sayılır, sadece kritik approval (>$X harcama, external-send) durur. OFF iken her aksiyonu manuel onaylarsın.",
  },
  streak: {
    short: "Ardışık aktif gün — kırılırsa sıfırlanır.",
    long:
      "Streak = günde en az 1 aksiyon (XP olayı) attığında devam eder. 24 saat geçerse kırılır. 7+ gün streak special XP getirir.",
  },
  ids: {
    short: "Issue çözüm yöntemi — Identify, Discuss, Solve.",
    long:
      "IDS = EOS'un sorun çözme protokolü. Issue'yu tanımla, tartış (kök neden), çöz (action item). Captain's Log Issues sekmesinde.",
  },
  "external-send": {
    short: "Dış dünyaya dokunan aksiyonlar — email, ödeme, tweet.",
    long:
      "External-send = workspace dışına sinyal gönderen agent eylemleri. Her zaman approval kuyruğuna düşer. Sen onaylayana kadar Matrix'in dışında hiçbir şey olmaz.",
  },
};

/**
 * Inline glossary term — metin içinde kullanılır:
 *   <GlossaryTerm term="okr">OKR</GlossaryTerm>
 */
export function GlossaryTerm({
  term,
  children,
  className,
}: {
  term: GlossaryKey;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const entry = GLOSSARY[term];
  if (!entry) return <span>{children}</span>;

  return (
    <span ref={ref} className={cn("relative inline-flex items-center gap-0.5", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="border-b border-dashed border-nebula/50 pb-0.5 hover:text-nebula transition-colors"
        title={entry.short}
      >
        {children}
      </button>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-text-faint hover:text-nebula transition-colors"
        aria-label={`${term} ne demek?`}
      >
        <HelpCircle size={10} />
      </button>

      {open && (
        <span
          className="absolute left-0 top-full z-50 mt-1.5 block w-72 rounded-xl border border-nebula/30 bg-surface/98 p-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-nebula">
            {term.replace("-", " ")} · ne demek?
          </span>
          <span className="mt-1.5 block text-[12px] leading-relaxed text-text">
            {entry.short}
          </span>
          <span className="mt-2 block border-t border-border/50 pt-2 text-[11px] leading-relaxed text-text-muted">
            {entry.long}
          </span>
          {entry.example && (
            <span className="mt-2 block rounded-md border border-border/40 bg-elevated/40 px-2 py-1.5 font-mono text-[10px] text-text-muted">
              <b className="text-text-faint">örn:</b> {entry.example}
            </span>
          )}
          {entry.oracleNote && (
            <span className="mt-2 block rounded-md border border-nebula/20 bg-nebula-soft/20 px-2 py-1.5 text-[11px] text-nebula">
              ⚡ {entry.oracleNote}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/**
 * Standalone tooltip ikonu — metin yok, sadece "?" işareti
 */
export function GlossaryIcon({ term, className }: { term: GlossaryKey; className?: string }) {
  return (
    <GlossaryTerm term={term} className={className}>
      <span className="sr-only">{term}</span>
    </GlossaryTerm>
  );
}
