"use client";

import { create } from "zustand";

export type ToastTone = "ion" | "nebula" | "quantum" | "solar" | "crimson";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  action?: { label: string; href?: string };
  createdAt: number;
  /** ms; null = sticky */
  ttlMs: number | null;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id" | "createdAt" | "ttlMs"> & { ttlMs?: number | null }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const toast: Toast = {
      id,
      createdAt: Date.now(),
      ttlMs: t.ttlMs === undefined ? 4500 : t.ttlMs,
      tone: t.tone,
      title: t.title,
      description: t.description,
      action: t.action,
    };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/** Convenience — call from any client component without a hook. */
export function toast(opts: Parameters<ToastState["push"]>[0]) {
  return useToastStore.getState().push(opts);
}
