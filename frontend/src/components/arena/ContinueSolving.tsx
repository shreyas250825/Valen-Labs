import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, ChevronRight, RotateCcw } from "lucide-react";
import GlassCard from "./GlassCard";
import { getProblemBySlug } from "../../data/arena/problems";
import { loadProgress } from "../../services/arena/progress";

const difficultyClass: Record<string, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
};

const ContinueSolving = () => {
  const progress = loadProgress();
  const inProgress = progress.recentSlugs.filter((s) => !progress.solvedSlugs.includes(s)).slice(0, 3);
  const toShow = inProgress.length > 0 ? inProgress : progress.recentSlugs.slice(0, 3);

  if (toShow.length === 0) return null;

  return (
    <section className="px-6 pb-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <RotateCcw size={20} className="text-purple-400" />
          Continue Solving
        </h2>
        <Link to="#problems" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
          All problems <ChevronRight size={14} />
        </Link>
      </motion.div>

      <motion.div className="space-y-3">
        {toShow.map((slug, i) => {
          const problem = getProblemBySlug(slug);
          if (!problem) return null;
          const solved = progress.solvedSlugs.includes(slug);
          return (
            <GlassCard key={slug} delay={0.05 * i} className="p-0">
              <Link to={`/arena/problems/${slug}`} className="flex items-center justify-between p-4 md:p-5 group">
                <motion.div className="flex items-center gap-4">
                  <motion.div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                    <Clock size={18} />
                  </motion.div>
                  <motion.div>
                    <p className="font-semibold group-hover:text-purple-300 transition-colors">{problem.title}</p>
                    <p className="text-xs">
                      <span className={difficultyClass[problem.difficulty]}>{problem.difficulty}</span>
                      {solved && <span className="text-emerald-400 ml-2">· Solved</span>}
                    </p>
                  </motion.div>
                </motion.div>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
              </Link>
            </GlassCard>
          );
        })}
      </motion.div>
    </section>
  );
};

export default ContinueSolving;
