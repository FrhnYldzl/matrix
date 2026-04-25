import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

/**
 * /workspace/[id]/* — workspace içi shell.
 *
 * Tüm 4 tab (preview/operations/data/backoffice) bu layout'u paylaşır.
 * AppShell'in sidebar'ı bu route'u "bare" olarak işliyor — workspace
 * kendi içinde Oracle paneli + tab nav sunuyor.
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
