import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { ConsoleLine, TestCaseResult } from "../../types/arena";

interface OutputConsoleProps {
  lines: ConsoleLine[];
  stderr: ConsoleLine[];
  testCases?: TestCaseResult[];
  runtimeMs?: number;
  memoryMb?: number;
  isRunning?: boolean;
}

const lineColor: Record<ConsoleLine["type"], string> = {
  stdout: "text-emerald-300",
  stderr: "text-rose-400",
  info: "text-sky-400",
  success: "text-emerald-400",
  error: "text-rose-400",
};

const OutputConsole = ({
  lines,
  stderr,
  testCases = [],
  runtimeMs,
  memoryMb,
  isRunning = false,
}: OutputConsoleProps) => {
  const allLines = [...lines, ...stderr];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-[#0d1117] border-t border-white/5"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#161b22]">
        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest">
          <Terminal size={14} />
          Console
        </div>
        {(runtimeMs !== undefined || memoryMb !== undefined) && !isRunning && (
          <div className="flex gap-4 text-xs text-slate-500 font-mono">
            {runtimeMs !== undefined && <span>Runtime: {runtimeMs}ms</span>}
            {memoryMb !== undefined && <span>Memory: {memoryMb} MB</span>}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm min-h-[120px] max-h-[200px] lg:max-h-none">
        <AnimatePresence mode="popLayout">
          {isRunning && (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sky-400"
            >
              <span className="inline-block animate-pulse">▸ Executing...</span>
            </motion.p>
          )}
          {!isRunning && allLines.length === 0 && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-600"
            >
              Run your code to see output here.
            </motion.p>
          )}
          {allLines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mb-1 ${lineColor[line.type]}`}
            >
              {line.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {testCases.length > 0 && (
        <div className="border-t border-white/5 p-3 space-y-2 max-h-[140px] overflow-auto">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Test Cases</p>
          {testCases.map((tc) => (
            <motion.div
              key={tc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
                tc.passed ? "bg-emerald-500/10" : "bg-rose-500/10"
              }`}
            >
              {tc.passed ? (
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="font-mono text-slate-400">
                <span className="text-slate-500">Case {tc.id}:</span> {tc.input} → expected {tc.expected}
                {!tc.passed && (
                  <span className="block text-rose-400 mt-0.5">
                    <AlertCircle size={12} className="inline mr-1" />
                    got {tc.actual}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default OutputConsole;
