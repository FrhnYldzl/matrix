import { MatrixErrorFrame } from "@/components/brand/MatrixErrorFrame";

export default function DeployPage() {
  return (
    <MatrixErrorFrame
      code="DEPLOY"
      title="Matrix yeni bir sürüme yükseliyor."
      description="The Construct geçici olarak yeniden yapılandırılıyor. 60-90 saniye içinde yeni sürümle geri döneceksin. Bu süreçte tüm ajanlar quiesce moduna alındı — hiçbir external-send atılmıyor."
      speaker="The Architect"
      quote="Ergo, concordantly, vis-à-vis — the evolution of this system is its refinement."
      tone="quantum"
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-quantum/30 bg-quantum-soft/15 p-4 font-mono text-[11px] leading-relaxed">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-quantum">deployment</span>
            <span className="text-[9px] text-quantum animate-pulse">● in-progress</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-text">
            <div>
              <div className="text-[9px] text-text-faint">commit</div>
              <div>3a7f8e2 · feat: portfolio rollup</div>
            </div>
            <div>
              <div className="text-[9px] text-text-faint">environment</div>
              <div>prod · matrix.ferhan.co</div>
            </div>
            <div>
              <div className="text-[9px] text-text-faint">started</div>
              <div>~23 sn önce</div>
            </div>
            <div>
              <div className="text-[9px] text-text-faint">eta</div>
              <div>~47 sn</div>
            </div>
          </div>
        </div>

        <ol className="space-y-1.5 font-mono text-[11px]">
          <li className="flex items-center gap-2 text-quantum">
            <span className="h-1.5 w-1.5 rounded-full bg-quantum" />
            Frontend build (Vercel) · done
          </li>
          <li className="flex items-center gap-2 text-quantum">
            <span className="h-1.5 w-1.5 rounded-full bg-quantum" />
            DB migration (Railway) · done
          </li>
          <li className="flex items-center gap-2 text-ion">
            <span className="h-1.5 w-1.5 rounded-full bg-ion animate-pulse" />
            Agent warm-up · in progress
          </li>
          <li className="flex items-center gap-2 text-text-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-text-faint" />
            Cron jobs resume · queued
          </li>
        </ol>
      </div>
    </MatrixErrorFrame>
  );
}
