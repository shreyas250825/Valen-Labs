import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ProgressiveHintsProps {
  hints: string[];
}

const ProgressiveHints = ({ hints }: ProgressiveHintsProps) => {
  const [revealed, setRevealed] = useState(0);

  if (hints.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Lightbulb size={14} className="text-amber-400" />
          Hints
        </h2>
        <span className="text-xs text-slate-600">
          {revealed}/{hints.length} revealed
        </span>
      </div>

      <AnimatePresence>
        {hints.slice(0, revealed).map((hint, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-300 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 mb-2"
          >
            <span className="text-purple-400 font-medium">Hint {i + 1}: </span>
            {hint}
          </motion.div>
        ))}
      </AnimatePresence>

      {revealed < hints.length && (
        <motion.button
          type="button"
          onClick={() => setRevealed((n) => n + 1)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 mt-2"
        >
          <ChevronRight size={16} />
          Reveal hint {revealed + 1}
        </motion.button>
      )}
    </section>
  );
};

export default ProgressiveHints;
