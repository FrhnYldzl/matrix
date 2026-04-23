import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { WelcomeToast } from "./WelcomeToast";
import { ToastViewport } from "../ui/ToastViewport";

export function AppShell({ children }: { children: ReactNode }) {
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
