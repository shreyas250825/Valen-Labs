import { motion } from "framer-motion";
import { Medal } from "lucide-react";
import { firebaseAuth } from "../../lib/firebase";
import { loadProgress } from "../../services/arena/progress";
import GlassCard from "./GlassCard";

const TOP_SOLVERS = [
  { rank: 1, name: "alex.codes", score: 2840, streak: 12 },
  { rank: 2, name: "dev_nova", score: 2710, streak: 8 },
  { rank: 3, name: "byte_runner", score: 2655, streak: 15 },
];

const LeaderboardPreview = () => {
  const progress = loadProgress();
  const displayName =
    firebaseAuth.currentUser?.displayName?.split(" ")[0] ??
    firebaseAuth.currentUser?.email?.split("@")[0] ??
    "You";

  type Row = { rank: number; name: string; score: number; streak: number; highlight?: boolean };

  const rows: Row[] = [
    ...TOP_SOLVERS.map((r) => ({ ...r, highlight: false })),
    { rank: 4, name: displayName, score: progress.points, streak: progress.streak, highlight: true },
  ].sort((a, b) => b.score - a.score);

  return (
    <section className="px-6 pb-16">
      <GlassCard className="p-6" delay={0.25}>
        <motion.div className="flex items-center gap-2 mb-6">
          <Medal size={20} className="text-amber-400" />
          <h2 className="text-xl font-bold">Your Rank</h2>
        </motion.div>
        <motion.div className="space-y-2">
          {rows.map((user, i) => (
            <motion.div
              key={`${user.name}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i }}
              className={`flex items-center justify-between py-3 px-4 rounded-xl ${
                user.highlight === true ? "bg-purple-500/10 border border-purple-500/20" : "bg-white/[0.02]"
              }`}
            >
              <motion.div className="flex items-center gap-4">
                <motion.span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? "bg-amber-500/20 text-amber-400"
                      : i === 1
                        ? "bg-slate-400/20 text-slate-300"
                        : i === 2
                          ? "bg-orange-600/20 text-orange-400"
                          : "bg-white/5 text-slate-500"
                  }`}
                >
                  {i + 1}
                </motion.span>
                <motion.span className={`font-medium ${user.highlight === true ? "text-purple-300" : ""}`}>{user.name}</motion.span>
              </motion.div>
              <motion.div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{user.score} pts</span>
                {user.streak > 0 && <span className="text-orange-400">🔥 {user.streak}d</span>}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </GlassCard>
    </section>
  );
};

export default LeaderboardPreview;
