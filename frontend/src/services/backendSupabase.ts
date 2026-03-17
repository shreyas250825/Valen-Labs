import { firebaseAuth } from "../lib/firebase";
import { API_BASE_URL } from "./api";

async function authHeader(): Promise<Record<string, string>> {
  const user = firebaseAuth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function fetchDashboardFromBackend() {
  const res = await fetch(`${API_BASE_URL}/api/v1/supabase/dashboard`, {
    headers: {
      ...(await authHeader()),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch dashboard (${res.status}): ${text}`);
  }
  return res.json();
}

export async function fetchReportsFromBackend() {
  const res = await fetch(`${API_BASE_URL}/api/v1/supabase/reports`, {
    headers: {
      ...(await authHeader()),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch reports (${res.status}): ${text}`);
  }
  return res.json() as Promise<{ reports: any[] }>;
}

export function hydrateDashboardToLocalStorage(payload: any) {
  try {
    if (payload?.user) {
      // keep existing shape used across app
      localStorage.setItem("userProfile", JSON.stringify(payload.user));
    }

    if (Array.isArray(payload?.interview_sessions)) {
      const reportsBySession = new Map<string, any>();
      for (const r of payload?.interview_reports || []) {
        if (r?.session_id && !reportsBySession.has(r.session_id)) reportsBySession.set(r.session_id, r);
      }

      const history = payload.interview_sessions.map((s: any) => {
        const rep = reportsBySession.get(s.id);
        return {
          session_id: s.external_session_id || s.id,
          role: s.job_role,
          difficulty: s.difficulty,
          created_at: s.started_at,
          started_at: s.started_at,
          overall_score: rep?.overall_score ?? null,
          type: "interview",
          date: s.started_at ? new Date(s.started_at).toISOString().split("T")[0] : undefined,
        };
      });
      localStorage.setItem("interviewHistory", JSON.stringify(history));
    }

    if (payload?.job_fit_result) {
      localStorage.setItem("jobFitAnalyses", JSON.stringify([{ ...payload.job_fit_result, type: "job-fit" }]));
    }

    if (payload?.aptitude_result) {
      localStorage.setItem("aptitudeResults", JSON.stringify([{ ...payload.aptitude_result, type: "aptitude" }]));
    }
  } catch {
    // ignore hydration errors
  }
}

const SUPABASE_SESSION_MAP_KEY = "supabaseInterviewSessionMap";

function readSessionMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SUPABASE_SESSION_MAP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function getSupabaseSessionIdForExternalSession(externalSessionId: string): string | null {
  const map = readSessionMap();
  return map[externalSessionId] ?? null;
}

function setSupabaseSessionIdForExternalSession(externalSessionId: string, supabaseSessionId: string) {
  const map = readSessionMap();
  map[externalSessionId] = supabaseSessionId;
  localStorage.setItem(SUPABASE_SESSION_MAP_KEY, JSON.stringify(map));
}

export async function syncUserToBackend() {
  const user = firebaseAuth.currentUser;
  if (!user) return;

  await fetch(`${API_BASE_URL}/api/v1/supabase/sync-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify({
      email: user.email,
      name: user.displayName,
    }),
  });
}

export async function createInterviewSessionInBackend(payload: {
  resume_id?: string | null;
  job_role?: string | null;
  difficulty?: string | null;
  external_session_id?: string | null;
}) {
  const res = await fetch(`${API_BASE_URL}/api/v1/supabase/interview/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to create interview session (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { ok?: boolean; id?: string };
  if (payload.external_session_id && data?.id) {
    setSupabaseSessionIdForExternalSession(payload.external_session_id, data.id);
  }
  return data;
}

export async function logSkillAnalysisToBackend(skill: string, proficiencyScore: number) {
  await fetch(`${API_BASE_URL}/api/v1/supabase/skill-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify({
      skill,
      proficiency_score: proficiencyScore,
    }),
  });
}

export async function fetchSkillAnalysisFromBackend() {
  const res = await fetch(`${API_BASE_URL}/api/v1/supabase/skill-analysis`, {
    headers: {
      ...(await authHeader()),
    },
  });
  if (!res.ok) {
    throw new Error("Failed to load skill analysis from backend");
  }
  return res.json();
}

export async function logResumeToBackend(resumeName: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/supabase/resume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify({ resume_name: resumeName }),
  });
  if (!res.ok) throw new Error("Failed to log resume to backend");
  return res.json() as Promise<{ ok: boolean; id?: string }>;
}

export async function logResumeParsedToBackend(payload: {
  resume_id: string;
  full_name?: string | null;
  skills?: string[] | null;
  education?: string | null;
  experience?: string | null;
  projects?: string[] | null;
  certifications?: string[] | null;
}) {
  const res = await fetch(`${API_BASE_URL}/api/v1/supabase/resume/parsed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to log parsed resume to backend (${res.status}): ${text}`);
  }
}

export async function logInterviewReportToBackend(payload: {
  session_id: string;
  overall_score?: number | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  improvement_suggestions?: string | null;
}) {
  const res = await fetch(`${API_BASE_URL}/api/v1/supabase/interview/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to log interview report (${res.status}): ${text}`);
  }
}

export async function logInterviewQuestionToBackend(payload: {
  session_id: string;
  question: string;
  user_answer?: string | null;
  ai_feedback?: string | null;
  score?: number | null;
}) {
  const res = await fetch(`${API_BASE_URL}/api/v1/supabase/interview/question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to log interview question (${res.status}): ${text}`);
  }
}

export async function logJobFitResultToBackend(payload: any) {
  const res = await fetch(`${API_BASE_URL}/api/v1/supabase/job-fit/result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to log job fit result (${res.status}): ${text}`);
  }
}

export async function logAptitudeResultToBackend(payload: any) {
  const res = await fetch(`${API_BASE_URL}/api/v1/supabase/aptitude/result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to log aptitude result (${res.status}): ${text}`);
  }
}


