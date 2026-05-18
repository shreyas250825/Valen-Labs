import { motion } from "framer-motion";
import { Bot, Brain, Lightbulb, Zap } from "lucide-react";
import GlassCard from "./GlassCard";

const features = [
  { icon: Brain, label: "Complexity Analysis", desc: "Big-O insights on your approach" },
  { icon: Lightbulb, label: "Smart Hints", desc: "Guided nudges without spoilers" },
  { icon: Zap, label: "Optimization Tips", desc: "Faster, cleaner solutions" },
];

const AIMentorBanner = () => (
  <section className="px-6 pb-16">
    <GlassCard className="p-6 md:p-10 relative overflow-hidden" delay={0.2}>
      <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10" />
      <motion.div
        className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/10"
          >
            <Bot size={32} className="text-purple-300" />
          </motion.div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">AI Mentor</h2>
            <p className="text-slate-400 text-sm max-w-md">
              Your personal coding coach — analyzes complexity, suggests optimizations, and delivers hints when you&apos;re stuck.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 lg:ml-auto">
          {features.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 min-w-[180px]"
            >
              <Icon size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </GlassCard>
  </section>
);

export default AIMentorBanner;
