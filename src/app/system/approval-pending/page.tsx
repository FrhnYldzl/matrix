import { MatrixErrorFrame } from "@/components/brand/MatrixErrorFrame";

export default function ApprovalPendingPage() {
  return (
    <MatrixErrorFrame
      code="✋"
      title="Bir ajan insan onayı bekliyor."
      description="external-send kapsamındaki bir aksiyon Seraph'ın kapısında durdu. Kimse — Matrix dahi — senin mühürün olmadan dış dünyaya yazı göndermez. Bu senin Matrix'inin en önemli güvenlik katmanı."
      speaker="Seraph"
      quote="I protect that which matters most."
      tone="ion"
      primaryAction={{ label: "Control Room onay kuyruğu", href: "/control" }}
      secondaryAction={{ label: "Audit log", href: "/control" }}
    >
      <div className="rounded-lg border border-ion/30 bg-ion-soft/15 p-4 font-mono text-[11px] leading-relaxed">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-wider text-ion">Bekleyen aksiyon</span>
          <span className="rounded border border-ion/30 bg-ion-soft px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ion">
            external-send
          </span>
        </div>
        <div className="text-sm text-text">Sales-qualifier → 12 prospect'e outbound email</div>
        <div className="mt-2 text-text-muted">
          <b className="text-text">Hazırlayan:</b> Business Exec (agent)
          <br />
          <b className="text-text">Tahmini etki:</b> ~$4.20 cost · 12 external touch
          <br />
          <b className="text-text">Hedef:</b> Pipeline Q2 rock için lead generation
        </div>
      </div>
    </MatrixErrorFrame>
  );
}
