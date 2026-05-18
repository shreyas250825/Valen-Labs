import type { ArenaProgress } from "../../types/arena";

const STORAGE_KEY = "valen-arena-progress";

const DEFAULT: ArenaProgress = {
  solvedSlugs: [],
  points: 0,
  streak: 0,
  lastSolvedDate: null,
  recentSlugs: [],
  attempts: {},
};

export function loadProgress(): ArenaProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveProgress(progress: ArenaProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function touchRecent(slug: string): ArenaProgress {
  const p = loadProgress();
  p.recentSlugs = [slug, ...p.recentSlugs.filter((s) => s !== slug)].slice(0, 8);
  saveProgress(p);
  return p;
}

export function recordAttempt(slug: string): ArenaProgress {
  const p = loadProgress();
  p.attempts[slug] = (p.attempts[slug] ?? 0) + 1;
  saveProgress(p);
  return p;
}

export function recordSolve(slug: string, difficulty: "Easy" | "Medium" | "Hard"): ArenaProgress {
  const p = loadProgress();
  const today = todayKey();

  if (!p.recentSlugs.includes(slug)) {
    p.recentSlugs = [slug, ...p.recentSlugs.filter((s) => s !== slug)].slice(0, 8);
  } else {
    p.recentSlugs = [slug, ...p.recentSlugs.filter((s) => s !== slug)].slice(0, 8);
  }

  if (p.solvedSlugs.includes(slug)) {
    saveProgress(p);
    return p;
  }

  p.solvedSlugs = [...p.solvedSlugs, slug];
  const pointsMap = { Easy: 100, Medium: 200, Hard: 350 };
  p.points += pointsMap[difficulty];

  if (p.lastSolvedDate === today) {
    // same day, streak unchanged
  } else if (p.lastSolvedDate === yesterdayKey()) {
    p.streak += 1;
  } else {
    p.streak = 1;
  }
  p.lastSolvedDate = today;
  saveProgress(p);
  return p;
}

export function getDailyChallengeSlug(problemSlugs: string[]): string {
  const dayIndex = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return problemSlugs[dayIndex % problemSlugs.length] ?? problemSlugs[0];
}
