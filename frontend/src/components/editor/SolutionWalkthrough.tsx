import { motion, AnimatePresence } from "framer-motion";
import { Code2, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { SolutionStep } from "../../types/arena";

interface SolutionWalkthroughProps {
  steps: SolutionStep[];
}

const SolutionWalkthrough = ({ steps }: SolutionWalkthroughProps) => {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(0);

  if (steps.length === 0) return null;

  return (
    <section className="border-t border-white/5 pt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors w-full"
      >
        {open ? <EyeOff size={16} /> : <Eye size={16} />}
        Solution walkthrough
        <span className="text-xs text-slate-600 ml-auto">optional — reveal step by step</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3 overflow-hidden"
          >
            {steps.slice(0, revealed).map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <p className="text-xs text-sky-400 uppercase tracking-widest mb-1">Step {i + 1}</p>
                <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.explanation}</p>
                {step.code && (
                  <pre className="mt-3 p-3 rounded-lg bg-black/40 border border-white/5 text-xs font-mono text-cyan-300 overflow-x-auto">
                    {step.code}
                  </pre>
                )}
              </motion.div>
            ))}

            {revealed < steps.length && (
              <motion.button
                type="button"
                onClick={() => setRevealed((n) => n + 1)}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300"
              >
                <Code2 size={14} />
                Show step {revealed + 1}
                <ChevronRight size={14} />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SolutionWalkthrough;
