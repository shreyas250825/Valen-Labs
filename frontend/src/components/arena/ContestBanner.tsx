import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Timer, Zap } from "lucide-react";
import GlassCard from "./GlassCard";
import { ARENA_PROBLEMS } from "../../data/arena/problems";

function getNextSunday(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntil = day === 0 ? 7 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  next.setHours(10, 0, 0, 0);
  return next;
}

const ContestBanner = () => {
  const label = getNextSunday().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section id="contest" className="px-6 pb-20">
      <GlassCard className="p-6 md:p-8" delay={0.15}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <motion.div className="flex items-start gap-4">
            <motion.div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Trophy size={24} className="text-amber-400" />
            </motion.div>
            <motion.div>
              <span className="text-xs uppercase tracking-widest text-amber-400/80">Weekly Contest</span>
              <h2 className="text-xl md:text-2xl font-bold mt-1 mb-2">Valen Arena Sprint</h2>
              <p className="text-slate-400 text-sm max-w-lg">
                Timed run across {ARENA_PROBLEMS.length} curated problems. Climb the board and beat your best streak.
              </p>
            </motion.div>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-400">
            <motion.div className="flex items-center gap-2">
              <Timer size={16} />
              <span>Starts {label}</span>
            </motion.div>
            <motion.div className="flex items-center gap-2">
              <Zap size={16} className="text-purple-400" />
              <span>90 minutes · rated</span>
            </motion.div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="#problems"
              className="px-6 py-3 rounded-xl font-semibold border border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-colors shrink-0 text-center block"
            >
              Practice Now
            </Link>
          </motion.div>
        </motion.div>
      </GlassCard>
    </section>
  );
};

export default ContestBanner;
