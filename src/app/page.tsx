import { LandingPage } from "@/components/landing/LandingPage";

/**
 * / — public landing page.
 *
 * Auth gerekmez (middleware PUBLIC_PATHS'inde). AppShell bu route'u "bare"
 * mod'da render eder — sidebar/topbar yok, kendi tam-ekran layout'u.
 *
 * Kullanıcı login olduktan sonra /dashboard'a yönlenir (verify route default).
 */
export default function HomePage() {
  return <LandingPage />;
}
