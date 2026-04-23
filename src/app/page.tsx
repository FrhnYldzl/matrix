import { HeroHeader } from "@/components/deck/HeroHeader";
import { KpiRow } from "@/components/deck/KpiRow";
import { Constellation } from "@/components/deck/Constellation";
import { OracleNudges } from "@/components/deck/OracleNudges";
import { ActivityFeed } from "@/components/deck/ActivityFeed";
import { GoalOrbits } from "@/components/deck/GoalOrbits";
import { BlueprintSuggestionBanner } from "@/components/deck/BlueprintSuggestionBanner";
import { PortfolioRollup } from "@/components/deck/PortfolioRollup";

export default function CommandDeckPage() {
  return (
    <div className="flex flex-col">
      <HeroHeader />

      <section className="space-y-6 px-8 py-8">
        <BlueprintSuggestionBanner />

        <KpiRow />

        <PortfolioRollup />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Constellation />
            <OracleNudges />
          </div>

          <div className="space-y-6">
            <GoalOrbits />
            <ActivityFeed />
          </div>
        </div>
      </section>
    </div>
  );
}
