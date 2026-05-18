export type Difficulty = "Easy" | "Medium" | "Hard";

export type EditorLanguage = "python" | "cpp" | "java" | "javascript";

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ArenaTestCase {
  id: number;
  label: string;
  input: Record<string, unknown>;
  expected: unknown;
}

export interface MentorInsight {
  complexity: string;
  optimization: string;
  approach: string[];
}

export interface SolutionStep {
  title: string;
  explanation: string;
  code?: string;
}

export interface ArenaProblem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  statement: string;
  constraints: string[];
  examples: ProblemExample[];
  hints: string[];
  acceptanceRate?: number;
  category: string;
  entryPoint: string;
  testCases: ArenaTestCase[];
  mentor: MentorInsight;
  solutionSteps: SolutionStep[];
  starterCode: Record<EditorLanguage, string>;
}

export interface ProblemCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface ConsoleLine {
  id: string;
  type: "stdout" | "stderr" | "info" | "success" | "error";
  content: string;
  timestamp: number;
}

export interface TestCaseResult {
  id: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface RunResult {
  stdout: ConsoleLine[];
  stderr: ConsoleLine[];
  runtimeMs: number;
  memoryMb: number;
  testCases: TestCaseResult[];
  status: "success" | "error" | "compile_error";
  allPassed: boolean;
}

export interface ArenaProgress {
  solvedSlugs: string[];
  points: number;
  streak: number;
  lastSolvedDate: string | null;
  recentSlugs: string[];
  attempts: Record<string, number>;
}
