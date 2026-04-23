import { MatrixErrorFrame } from "@/components/brand/MatrixErrorFrame";

export default function NotFound() {
  return (
    <MatrixErrorFrame
      code="404"
      title="Bu koordinat Matrix'te yok."
      description="Aradığın sayfa ya Zion'a sürgün edildi, ya hiç var olmadı. Orchestrator log'lara işledi; Oracle bir sonraki taramada boşluk olarak işaretleyebilir."
      speaker="The Oracle"
      quote="Don't worry about the vase."
      tone="nebula"
      primaryAction={{ label: "The Construct'a dön", href: "/" }}
      secondaryAction={{ label: "Oracle'ı dinle", href: "/oracle" }}
    />
  );
}
