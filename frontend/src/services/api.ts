import axios from 'axios';

// Base URL for API requests - tries localhost first, falls back to Render backend
const LOCAL_API_URL = 'http://localhost:8000';
const RENDER_API_URL = 'https://iit-b-finals.onrender.com';

// Function to check if localhost is available
const checkLocalhost = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${LOCAL_API_URL}/health`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Initialize API base URL
export let API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? LOCAL_API_URL 
  : RENDER_API_URL;

// If running locally, check if local backend is available, if not, use Render
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  checkLocalhost().then(isLocalAvailable => {
    if (!isLocalAvailable) {
      console.warn('Local backend not available, falling back to Render backend');
      API_BASE_URL = RENDER_API_URL;
    }
  });
}

// Create axios instance with dynamic base URL
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Create initial API instance
let api = createApiInstance(API_BASE_URL);

// Function to update the API instance with a new base URL
const updateApiBaseUrl = (newUrl: string) => {
  API_BASE_URL = newUrl;
  api = createApiInstance(newUrl);
};

// If running locally, check if local backend is available, if not, use Render
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  checkLocalhost().then(isLocalAvailable => {
    if (!isLocalAvailable) {
      console.warn('Local backend not available, falling back to Render backend');
      updateApiBaseUrl(RENDER_API_URL);
    }
  });
}

// Existing types and clients (kept for compatibility with other screens)
export interface InterviewProfile {
  role: string;
  interview_type: string;
  round_type: string;
  resume_data?: any;
}

export interface AnswerSubmission {
  session_id: string;
  question_index: number;
  answer_text: string;
  behavioral_metrics?: any;
}

export interface AnalysisResult {
  technical_score: number;
  behavioral_score: number;
  feedback: string;
  suggestions: string[];
}

export const apiService = {
  startInterview: async (profile: any) => {
    const response = await api.post('/api/v1/interview/start', profile);
    return response.data;
  },

  submitAnswer: async (sessionId: string, answer: string) => {
    const response = await api.post('/api/v1/interview/submit-answer', {
      session_id: sessionId,
      answer_text: answer,
    });
    return response.data;
  },

  endInterview: async (sessionId: string) => {
    const response = await api.post(`/api/v1/interview/${sessionId}/complete`);
    return response.data;
  },

  getReport: async (sessionId: string) => {
    const response = await api.get(`/api/v1/reports/${sessionId}`);
    return response.data;
  },
};

export const interviewApi = {
  startInterview: async (profile: InterviewProfile) => {
    const response = await api.post('/api/v1/interview/start', profile);
    return response.data;
  },

  getNextQuestion: async (sessionId: string) => {
    const response = await api.get(`/api/v1/interview/${sessionId}/next-question`);
    return response.data;
  },

  submitAnswer: async (submission: AnswerSubmission) => {
    const response = await api.post('/api/v1/interview/submit-answer', submission);
    return response.data;
  },

  completeInterview: async (sessionId: string) => {
    const response = await api.post(`/api/v1/interview/${sessionId}/complete`);
    return response.data;
  },

  listReports: async () => {
    const response = await fetch(`${BASE}/api/interview/reports`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.status}`);
    }
    return response.json();
  },
};

export { api };

// New lightweight REST helpers for the simplified interview flow

const BASE = API_BASE_URL;

export async function startInterviewSimple(profile: any, role?: string, interviewType?: string, persona?: string) {
  const body = {
    profile,
    role: role || profile?.role || profile?.estimated_role,
    interview_type: interviewType || profile?.interview_type || 'mixed',
    persona: persona || profile?.persona || 'male',
  };
  const res = await fetch(`${API_BASE_URL}/api/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to start interview: ${res.status}`);
  }
  const data = await res.json();
  // Non-blocking: ask backend to persist this session in Supabase (if user is logged in)
  import("./backendSupabase")
    .then(({ createInterviewSessionInBackend }) =>
      createInterviewSessionInBackend({
        job_role: body.role ?? null,
        difficulty: profile?.difficulty ?? null,
        external_session_id: data?.session_id ?? data?.id ?? null,
      }).catch((e: any) => console.error("Failed to persist interview session:", e))
    )
    .catch(() => {});
  return data;
}

export async function submitAnswerSimple(payload: {
  session_id: string;
  question_id: string;
  transcript: string;
  metrics: any;
}) {
  const res = await fetch(`${API_BASE_URL}/api/interview/answer`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload),
    credentials: 'include'  // Include cookies for session handling
  });
  
  if (!res.ok) {
    let errorMessage = `Failed to submit answer: ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // If we can't parse the error as JSON, use the status text
      console.error('Error parsing error response:', e);
    }
    throw new Error(errorMessage);
  }
  
  return res.json();
}

export async function sendMetricsSimple(metrics: any) {
  await fetch(`${API_BASE_URL}/api/metrics`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(metrics),
    credentials: 'include'
  });
}

export async function getReportSimple(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/api/interview/report/${sessionId}`, {
    method: 'GET',
    headers: { 
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  
  if (!res.ok) {
    let errorMessage = `Failed to fetch report: ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      console.error('Error parsing error response:', e);
    }
    throw new Error(errorMessage);
  }
  
  const data = await res.json();

  // Non-blocking: persist report summary to Supabase via backend (uses Supabase session id mapping)
  import("./backendSupabase")
    .then(({ getSupabaseSessionIdForExternalSession, logInterviewReportToBackend }) => {
      const supabaseSessionId = getSupabaseSessionIdForExternalSession(sessionId);
      if (!supabaseSessionId) return;
      const evaluations = Array.isArray(data?.evaluations) ? data.evaluations : [];
      const avg = (key: string) => {
        if (!evaluations.length) return null;
        const sum = evaluations.reduce((acc: number, e: any) => acc + (Number(e?.[key]) || 0), 0);
        return Math.round(sum / evaluations.length);
      };
      const technical = avg("technical");
      const communication = avg("communication");
      const relevance = avg("relevance");
      const overall =
        technical == null || communication == null || relevance == null
          ? null
          : Math.round((technical + communication + relevance) / 3);

      return logInterviewReportToBackend({
        session_id: supabaseSessionId,
        overall_score: overall,
        strengths: null,
        weaknesses: null,
        improvement_suggestions: data?.summary ?? null,
      }).catch((e: any) => console.error("Failed to persist report:", e));
    })
    .catch(() => {});

  return data;
}
