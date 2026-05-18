import { useState } from "react";
import { motion } from "framer-motion";
import ArenaLayout from "../../components/arena/ArenaLayout";
import ArenaHero from "../../components/arena/ArenaHero";
import DailyChallengeCard from "../../components/arena/DailyChallengeCard";
import CategoryGrid from "../../components/arena/CategoryGrid";
import AIMentorBanner from "../../components/arena/AIMentorBanner";
import ContinueSolving from "../../components/arena/ContinueSolving";
import ContestBanner from "../../components/arena/ContestBanner";
import LeaderboardPreview from "../../components/arena/LeaderboardPreview";
import ProblemsList from "../../components/arena/ProblemsList";

const ArenaLandingPage = () => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const handleCategory = (id: string) => {
    setCategoryFilter(id);
    document.getElementById("problems")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ArenaLayout>
      <ArenaHero />
      <DailyChallengeCard />
      <motion.div className="grid lg:grid-cols-3 gap-0 lg:gap-8">
        <motion.div className="lg:col-span-2">
          <CategoryGrid onSelectCategory={handleCategory} />
          <ProblemsList categoryFilter={categoryFilter} />
          <AIMentorBanner />
          <ContinueSolving />
        </motion.div>
        <motion.div className="lg:col-span-1">
          <LeaderboardPreview />
        </motion.div>
      </motion.div>
      <ContestBanner />
    </ArenaLayout>
  );
};

export default ArenaLandingPage;
