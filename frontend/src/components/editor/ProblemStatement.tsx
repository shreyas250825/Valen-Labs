import { motion } from "framer-motion";
import type { ArenaProblem } from "../../types/arena";
import ProgressiveHints from "./ProgressiveHints";
import SolutionWalkthrough from "./SolutionWalkthrough";

interface ProblemStatementProps {
  problem: ArenaProblem;
}

const difficultyStyles: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Hard: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

const ProblemStatement = ({ problem }: ProblemStatementProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="h-full overflow-auto p-4 md:p-6 space-y-6"
  >
    <motion.div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${difficultyStyles[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
        {problem.tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
            {tag}
          </span>
        ))}
      </div>
      <h1 className="text-2xl md:text-3xl font-bold">{problem.title}</h1>
      {problem.acceptanceRate != null && (
        <p className="text-slate-500 text-sm mt-1">{problem.acceptanceRate}% acceptance</p>
      )}
    </motion.div>

    <section>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Description</h2>
      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
        {problem.statement.split("`").map((part, i) =>
          i % 2 === 1 ? (
            <code key={i} className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-xs">
              {part}
            </code>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </div>
    </section>

    <section>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Constraints</h2>
      <ul className="space-y-1 text-sm text-slate-400 font-mono">
        {problem.constraints.map((c) => (
          <li key={c} className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            {c}
          </li>
        ))}
      </ul>
    </section>

    <section>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Examples</h2>
      <div className="space-y-4">
        {problem.examples.map((ex, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-sm"
          >
            <p className="text-slate-400 mb-2">
              <span className="text-slate-500">Input: </span>
              {ex.input}
            </p>
            <p className="text-emerald-400/90">
              <span className="text-slate-500">Output: </span>
              {ex.output}
            </p>
            {ex.explanation && (
              <p className="text-slate-500 mt-2 text-xs font-sans">{ex.explanation}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>

    <ProgressiveHints hints={problem.hints} />
    <SolutionWalkthrough steps={problem.solutionSteps} />
  </motion.div>
);

export default ProblemStatement;
