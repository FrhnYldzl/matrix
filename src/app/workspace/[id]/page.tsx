import { redirect } from "next/navigation";

/**
 * /workspace/[id] → /workspace/[id]/operations'a redirect
 * Default tab: Operations (en sık kullanılan, day-to-day)
 */
export default async function WorkspaceRootPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/workspace/${id}/operations`);
}
