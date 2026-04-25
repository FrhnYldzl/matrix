import { OracleConversation } from "@/components/onboarding/OracleConversation";

/**
 * /onboarding — first-time user onboarding flow.
 *
 * The Oracle conversational experience. Login sonrası workspace yoksa
 * /dashboard'dan buraya yönlendirilir. Tamamlanınca /dashboard'a döner.
 *
 * AppShell bu route'u "bare" mod'da render eder — sidebar/topbar yok,
 * full-screen Oracle ekranı.
 */
export default function OnboardingPage() {
  return <OracleConversation />;
}
