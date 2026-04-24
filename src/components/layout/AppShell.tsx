"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { WelcomeToast } from "./WelcomeToast";
import { ToastViewport } from "../ui/ToastViewport";

/**
 * Paths that render their own full-bleed layout (no sidebar/topbar).
 * Login, system error pages, deploy page etc.
 */
const BARE_PATHS = ["/login", "/system/rate-limited", "/system/approval-pending", "/system/deploy"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (bare) {
    return (
      <>
        {children}
        <ToastViewport />
      </>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
      <WelcomeToast />
      <ToastViewport />
    </div>
  );
}
