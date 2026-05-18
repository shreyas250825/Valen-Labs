import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Send, Loader2, CheckCircle2 } from "lucide-react";
import type { ArenaProblem, ConsoleLine, EditorLanguage } from "../../types/arena";
import { getStarterCode } from "../../data/arena/problems";
import { runCode } from "../../services/arena/runCode";
import { loadProgress, recordAttempt, recordSolve, touchRecent } from "../../services/arena/progress";
import ArenaLayout from "../arena/ArenaLayout";
import ProblemStatement from "./ProblemStatement";
import CodeEditor from "./CodeEditor";
import OutputConsole from "./OutputConsole";
import LanguageSelector from "./LanguageSelector";
import AIMentorPanel from "./AIMentorPanel";

interface ProblemIDEProps {
  problem: ArenaProblem;
}

const codeKey = (slug: string, lang: EditorLanguage) => `valen-arena-code:${slug}:${lang}`;

const ProblemIDE = ({ problem }: ProblemIDEProps) => {
  const [language, setLanguage] = useState<EditorLanguage>("python");
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(codeKey(problem.slug, "python"));
    return saved ?? getStarterCode(problem, "python");
  });
  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState<ConsoleLine[]>([]);
  const [stderr, setStderr] = useState<ConsoleLine[]>([]);
  const [runtimeMs, setRuntimeMs] = useState<number | undefined>();
  const [memoryMb, setMemoryMb] = useState<number | undefined>();
  const [testCases, setTestCases] = useState<import("../../types/arena").TestCaseResult[]>([]);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    touchRecent(problem.slug);
    const saved = localStorage.getItem(codeKey(problem.slug, language));
    setCode(saved ?? getStarterCode(problem, language));
    setAccepted(false);
    setStdout([]);
    setStderr([]);
    setTestCases([]);
  }, [problem.slug, language, problem]);

  useEffect(() => {
    if (loadProgress().solvedSlugs.includes(problem.slug)) setAccepted(true);
  }, [problem.slug]);

  useEffect(() => {
    localStorage.setItem(codeKey(problem.slug, language), code);
  }, [code, problem.slug, language]);

  const handleLanguageChange = useCallback(
    (lang: EditorLanguage) => {
      setLanguage(lang);
    },
    []
  );

  const execute = useCallback(
    async (isSubmit: boolean) => {
      setIsRunning(true);
      setStdout([]);
      setStderr([]);
      setTestCases([]);
      recordAttempt(problem.slug);

      try {
        const result = await runCode(code, language, problem);
        setStdout(result.stdout);
        setStderr(result.stderr);
        setRuntimeMs(result.runtimeMs);
        setMemoryMb(result.memoryMb);
        setTestCases(result.testCases);

        if (result.allPassed) {
          setAccepted(true);
          if (isSubmit) recordSolve(problem.slug, problem.difficulty);
        } else {
          setAccepted(false);
        }
      } finally {
        setIsRunning(false);
      }
    },
    [code, language, problem]
  );

  return (
    <ArenaLayout fullBleed showBack>
      <div className="flex flex-col h-[calc(100vh-57px)] lg:flex-row">
        <div className="w-full lg:w-[42%] xl:w-[38%] border-b lg:border-b-0 lg:border-r border-white/5 bg-[#020617]/50 overflow-hidden flex flex-col min-h-[280px] lg:min-h-0 max-h-[40vh] lg:max-h-none">
          <ProblemStatement problem={problem} />
        </div>

        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/5 bg-[#0a0f1a]/90">
            <div className="flex items-center gap-3">
              <LanguageSelector value={language} onChange={handleLanguageChange} />
              {accepted && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 size={14} />
                  Solved
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={() => execute(false)}
                disabled={isRunning}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 border border-white/10 hover:bg-white/15 disabled:opacity-50 transition-colors"
              >
                {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                Run
              </motion.button>
              <motion.button
                type="button"
                onClick={() => execute(true)}
                disabled={isRunning}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-sky-500 text-white disabled:opacity-50"
              >
                <Send size={16} />
                Submit
              </motion.button>
            </div>
          </div>

          <div className="flex-1 min-h-[200px] lg:min-h-[240px] p-2">
            <CodeEditor value={code} onChange={setCode} language={language} height="100%" />
          </div>

          <div className="h-[180px] lg:h-[200px] shrink-0">
            <OutputConsole
              lines={stdout}
              stderr={stderr}
              testCases={testCases}
              runtimeMs={runtimeMs}
              memoryMb={memoryMb}
              isRunning={isRunning}
            />
          </div>
        </div>

        <AIMentorPanel problem={problem} />
      </div>
    </ArenaLayout>
  );
};

export default ProblemIDE;
