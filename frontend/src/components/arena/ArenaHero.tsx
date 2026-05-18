import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Play, Trophy, Target, Flame } from "lucide-react";
import { getDailyChallengeSlug, ARENA_PROBLEMS } from "../../data/arena/problems";
import { loadProgress } from "../../services/arena/progress";

const ArenaHero = () => {
  const progress = loadProgress();
  const dailySlug = getDailyChallengeSlug();

  return (
    <section className="relative px-6 pt-16 pb-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-4xl mx-auto"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs uppercase tracking-widest mb-6"
        >
          <Sparkles size={12} />
          Valen Coding Arena
        </motion.span>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6">
          Code. Compete.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-sky-400 to-cyan-400">
            Conquer.
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Solve real algorithm challenges with a live IDE, test cases, and guided mentorship.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Target size={16} className="text-purple-400" />
            <span>
              <strong className="text-white">{progress.solvedSlugs.length}</strong> / {ARENA_PROBLEMS.length} solved
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Flame size={16} className="text-orange-400" />
            <span>
              <strong className="text-white">{progress.streak}</strong> day streak
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Trophy size={16} className="text-amber-400" />
            <span>
              <strong className="text-white">{progress.points}</strong> points
            </span>
          </div>
        </div>

        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={`/arena/problems/${dailySlug}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-sky-500 text-white shadow-lg shadow-purple-500/25"
            >
              <Play size={18} fill="currentColor" />
              Daily Challenge
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <a
              href="#problems"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Browse Problems
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ArenaHero;
