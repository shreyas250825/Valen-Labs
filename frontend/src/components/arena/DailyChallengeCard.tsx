import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Flame } from "lucide-react";
import GlassCard from "./GlassCard";
import { getDailyChallengeSlug, getProblemBySlug } from "../../data/arena/problems";

const DailyChallengeCard = () => {
  const slug = getDailyChallengeSlug();
  const problem = getProblemBySlug(slug);
  if (!problem) return null;

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const difficultyColor =
    problem.difficulty === "Easy"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : problem.difficulty === "Medium"
        ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
        : "text-rose-400 bg-rose-500/10 border-rose-500/30";

  return (
    <section className="px-6 pb-12">
      <GlassCard className="p-6 md:p-8 relative overflow-hidden" delay={0.1}>
        <motion.div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <motion.div
          className="relative flex flex-col md:flex-row md:items-center justify-between gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex-1">
            <motion.div
              className="flex items-center gap-2 text-purple-400 text-xs uppercase tracking-widest mb-4"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame size={14} />
              Daily Challenge
            </motion.div>
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={18} className="text-slate-500" />
              <span className="text-slate-500 text-sm">{today}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${difficultyColor}`}>
                {problem.difficulty}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{problem.title}</h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Solve today&apos;s challenge to maintain your streak and earn bonus points.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {problem.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-400 border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={`/arena/problems/${problem.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-black hover:bg-slate-100 transition-colors shrink-0"
            >
              Solve Now
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </GlassCard>
    </section>
  );
};

export default DailyChallengeCard;
