"use client";

import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { Eye, ExternalLink } from "lucide-react";

/**
 * /workspace/[id]/preview — The Lobby
 *
 * Asset'in dış görünümü. Asset türüne göre dinamik içerik (sonraki sprint'te
 * zenginleştirilecek). Şimdilik placeholder + asset türü hint'i.
 */
export default function PreviewTab() {
  const params = useParams<{ id: string }>();
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const ws = workspaces.find((w) => w.id === params.id);

  if (!ws) return null;

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
            <Eye size={12} className="text-nebula" />
            The Lobby · asset&apos;in dış yüzü
          </div>
          <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-text">
            {ws.name} · canlı görünüm
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Bu sekme &quot;{ws.industry}&quot; tipi varlık için optimize
            edilecek — son edition / aktif ürünler / live URL preview / build
            status. Sprint E&apos;de zenginleştirilecek.
          </p>
        </header>

        {/* Placeholder card */}
        <div className="rounded-2xl border border-dashed border-border/60 bg-elevated/20 p-12 text-center">
          <Eye size={32} className="mx-auto text-text-faint" />
          <h3 className="mt-3 text-base font-medium text-text">
            Preview yakında
          </h3>
          <p className="mt-2 text-sm text-text-muted max-w-md mx-auto">
            Asset türüne göre özelleştirilmiş canlı görünüm. SaaS için live
            URL, Newsletter için son issue, FBA için inventory & top SKU,
            Course için cohort progress…
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-border/60 bg-elevated/40 px-3 py-1.5 font-mono text-[10px] text-text-muted">
            <ExternalLink size={11} />
            Domain: yakında bu workspace için ayarlanacak
          </div>
        </div>
      </div>
    </div>
  );
}
