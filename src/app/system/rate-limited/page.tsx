import { MatrixErrorFrame } from "@/components/brand/MatrixErrorFrame";

export default function RateLimitedPage() {
  return (
    <MatrixErrorFrame
      code="429"
      title="Ajanlar yavaşlatıldı — Merovingian'ın bağlantı koridoru darboğazlandı."
      description="Bir connector rate-limit eşiğine çarptı. Matrix otomatik exponential backoff başlattı. Kullanım kotanın %80'ini geçtiğinde Oracle bir risk suggestion üretir."
      speaker="The Merovingian"
      quote="Causality. Action. Reaction. Cause and effect."
      tone="solar"
      primaryAction={{ label: "TrainStation'da connector sağlığı", href: "/connectors" }}
      secondaryAction={{ label: "The Tribute'ta kullanım", href: "/spend" }}
    >
      <div className="grid grid-cols-3 gap-3 rounded-lg border border-solar/30 bg-solar-soft/15 p-3 font-mono text-[11px]">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-solar">Connector</div>
          <div className="mt-0.5 text-text">HubSpot</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-solar">Kullanım</div>
          <div className="mt-0.5 text-text">96% · 14.4K / 15K</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-solar">Reset</div>
          <div className="mt-0.5 text-text">~42 dk</div>
        </div>
      </div>
    </MatrixErrorFrame>
  );
}
