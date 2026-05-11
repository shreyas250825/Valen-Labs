/** Public site origin (social, footer, auth). Override with VITE_SITE_URL in env when needed. */
export const SITE_URL =
  (typeof import.meta.env.VITE_SITE_URL === "string" && import.meta.env.VITE_SITE_URL.trim()) ||
  "https://www.valen.live";

export const API_ENDPOINTS = {
  INTERVIEW: '/api/interview',
  RESUME: '/api/resume',
  REPORT: '/api/report',
  AUTH: '/api/auth',
  HEALTH: '/api/health',
};

export const INTERVIEW_STATES = {
  IDLE: 'idle',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
};

export const METRICS_TYPES = {
  BEHAVIORAL: 'behavioral',
  TECHNICAL: 'technical',
  COMMUNICATION: 'communication',
};
