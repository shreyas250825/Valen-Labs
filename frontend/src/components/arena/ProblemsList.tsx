import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { ARENA_PROBLEMS } from "../../data/arena/problems";
import { loadProgress } from "../../services/arena/progress";
import GlassCard from "./GlassCard";

interface ProblemsListProps {
  categoryFilter?: string | null;
}

const difficultyClass: Record<string, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
};

const ProblemsList = ({ categoryFilter }: ProblemsListProps) => {
  const progress = loadProgress();
  const problems = categoryFilter
    ? ARENA_PROBLEMS.filter((p) => p.category === categoryFilter)
    : ARENA_PROBLEMS;

  return (
    <section id="problems" className="px-6 pb-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold mb-1">
          {categoryFilter ? "Category Problems" : "All Problems"}
        </h2>
        <p className="text-slate-400 text-sm">
          {problems.length} challenge{problems.length !== 1 ? "s" : ""} · {progress.solvedSlugs.length} solved by you
        </p>
      </motion.div>

      <div className="space-y-2">
        {problems.map((p, i) => {
          const solved = progress.solvedSlugs.includes(p.slug);
          return (
            <GlassCard key={p.slug} delay={0.03 * i} className="p-0">
              <Link
                to={`/arena/problems/${p.slug}`}
                className="flex items-center justify-between p-4 md:p-5 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      solved ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {solved ? <CheckCircle2 size={18} /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate group-hover:text-purple-300 transition-colors">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      <span className={difficultyClass[p.difficulty]}>{p.difficulty}</span>
                      {" · "}
                      {p.tags.slice(0, 2).join(", ")}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-slate-600 group-hover:text-purple-400 shrink-0 ml-2 transition-colors"
                />
              </Link>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
};

export default ProblemsList;
