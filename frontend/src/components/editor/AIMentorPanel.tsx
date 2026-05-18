import { motion } from "framer-motion";
import { Bot, Brain, Lightbulb, Zap, ListOrdered } from "lucide-react";
import { useState } from "react";
import type { ArenaProblem } from "../../types/arena";

interface AIMentorPanelProps {
  problem: ArenaProblem;
}

const AIMentorPanel = ({ problem }: AIMentorPanelProps) => {
  const [approachStep, setApproachStep] = useState(0);
  const { mentor } = problem;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden xl:flex flex-col w-72 shrink-0 border-l border-white/5 bg-[#0a0f1a]/80 backdrop-blur-xl"
    >
      <motion.div className="p-4 border-b border-white/5 flex items-center gap-2">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <Bot size={18} className="text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI Mentor</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Problem insights</p>
        </div>
      </motion.div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <motion.div className="flex items-center gap-2 mb-2">
            <Brain size={14} className="text-purple-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Complexity</h4>
          </motion.div>
          <p className="text-sm text-slate-400 leading-relaxed">{mentor.complexity}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-cyan-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Optimization</h4>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{mentor.optimization}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <ListOrdered size={14} className="text-amber-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Approach</h4>
          </div>
          <ol className="space-y-2">
            {mentor.approach.slice(0, approachStep).map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-slate-400 flex gap-2"
              >
                <span className="text-amber-500/80 shrink-0">{i + 1}.</span>
                {step}
              </motion.li>
            ))}
          </ol>
          {approachStep < mentor.approach.length && (
            <button
              type="button"
              onClick={() => setApproachStep((n) => n + 1)}
              className="mt-3 text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Lightbulb size={12} />
              Next approach step
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default AIMentorPanel;
