"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import { approvals as allApprovals } from "@/lib/mock-data";
import { useMounted } from "@/lib/useMounted";
import type { ApprovalChannel, ApprovalItem } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  ArrowRight,
  ArrowRightLeft,
  Check,
  Inbox,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  X,
} from "lucide-react";

const channelMeta: Record<
  ApprovalChannel,
  { icon: typeof Mail; label: string; tone: "ion" | "nebula" | "solar" | "quantum" | "crimson" }
> = {
  gmail: { icon: Mail, label: "Gmail", tone: "ion" },
  slack: { icon: MessageSquare, label: "Slack", tone: "nebula" },
  sms: { icon: Smartphone, label: "SMS", tone: "solar" },
  transfer: { icon: ArrowRightLeft, label: "Transfer", tone: "crimson" },
  webhook: { icon: Webhook, label: "Webhook", tone: "quantum" },
};

function timeAgo(iso: string) {
  const diff = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `az önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

export function ApprovalQueue() {
  const { currentWorkspaceId, dismissedApprovals, dismissApproval } =
    useWorkspaceStore();

  const items = useMemo(
    () =>
      allApprovals
        .filter((a) => a.workspaceId === currentWorkspaceId && !dismissedApprovals.has(a.id))
        .sort((a, b) => {
          const pOrder = { high: 0, medium: 1, low: 2 } as const;
          return pOrder[a.priority] - pOrder[b.priority];
        }),
    [currentWorkspaceId, dismissedApprovals]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Inbox size={14} className="text-solar" />
          <CardTitle>Onay Kuyruğu</CardTitle>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          external-send aksiyonları
        </span>
      </CardHeader>
      <CardBody className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-elevated/30 p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-quantum-soft text-quantum">
              <Check size={16} />
            </div>
            <h4 className="mt-3 text-sm font-medium text-text">Kuyruk boş</h4>
            <p className="mt-1 text-xs text-text-muted">
              Bekleyen bir external-send yok. Sistem sorunsuz akıyor.
            </p>
          </div>
        ) : (
          items.map((item) => <ApprovalRow key={item.id} item={item} onDismiss={dismissApproval} />)
        )}
      </CardBody>
    </Card>
  );
}

function ApprovalRow({
  item,
  onDismiss,
}: {
  item: ApprovalItem;
  onDismiss: (id: string) => void;
}) {
  const meta = channelMeta[item.channel];
  const Icon = meta.icon;
  const mounted = useMounted();
  const prioTone: "crimson" | "solar" | "neutral" =
    item.priority === "high" ? "crimson" : item.priority === "medium" ? "solar" : "neutral";

  return (
    <div className="group rounded-lg border border-border/70 bg-elevated/40 p-3 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            meta.tone === "ion" && "bg-ion-soft text-ion",
            meta.tone === "nebula" && "bg-nebula-soft text-nebula",
            meta.tone === "solar" && "bg-solar-soft text-solar",
            meta.tone === "quantum" && "bg-quantum-soft text-quantum",
            meta.tone === "crimson" && "bg-crimson-soft text-crimson"
          )}
        >
          <Icon size={14} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            {item.priority === "high" && <Badge tone={prioTone}>Yüksek</Badge>}
            <span className="ml-auto font-mono text-[10px] text-text-faint" suppressHydrationWarning>
              {mounted ? timeAgo(item.createdAt) : ""}
            </span>
          </div>
          <h4 className="mt-2 text-sm font-medium text-text leading-snug">{item.title}</h4>
          <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
            <span className="text-ion">{item.agent}</span>
            <ArrowRight size={10} className="text-text-faint" />
            <span>{item.recipient}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-muted">
            {item.preview}
          </p>
          <div className="mt-3 flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-text-faint hover:text-crimson"
              onClick={() => onDismiss(item.id)}
            >
              <X size={12} />
              Reddet
            </Button>
            <Button size="sm" variant="secondary" className="h-7">
              İncele
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="h-7 gap-1"
              onClick={() => onDismiss(item.id)}
            >
              <Check size={12} />
              Onayla & Gönder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
