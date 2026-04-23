"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MatrixErrorFrame } from "@/components/brand/MatrixErrorFrame";
import { Button } from "@/components/ui/Button";
import { RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In prod this goes to Matrix audit log
    console.error("[nebuchadnezzar] uncaught:", error);
  }, [error]);

  return (
    <MatrixErrorFrame
      code="500"
      title="Sistem bir anlık çatladı."
      description="Matrix çekirdeğinde beklenmeyen bir istisna oluştu. Nebuchadnezzar log'ları tuttu; bir Issue olarak Captain's Log'a otomatik düştü."
      speaker="Nebuchadnezzar"
      quote="All I'm offering is the truth. Nothing more."
      tone="crimson"
      primaryAction={{ label: "Control Room'a git", href: "/control" }}
      secondaryAction={{ label: "Captain's Log", href: "/traction" }}
    >
      <div className="rounded-lg border border-crimson/30 bg-crimson-soft/15 p-3 font-mono text-[11px] leading-relaxed text-crimson">
        <div className="mb-1 uppercase tracking-wider text-[9px] text-crimson/80">
          exception · client
        </div>
        <div className="break-words text-text">{error.message || "unknown runtime error"}</div>
        {error.digest && (
          <div className="mt-1 text-[10px] text-text-faint">digest · {error.digest}</div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Button variant="primary" size="md" className="gap-1.5" onClick={reset}>
          <RefreshCcw size={13} />
          Tekrar dene
        </Button>
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-wider text-text-faint hover:text-text"
        >
          The Construct'a dön
        </Link>
      </div>
    </MatrixErrorFrame>
  );
}
