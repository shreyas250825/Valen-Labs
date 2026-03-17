import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase web config (from `code.md`).
const firebaseConfig = {
  apiKey: "AIzaSyD17UmkfrEmDWa1GyAPqd2h1ePUEV8pqBQ",
  authDomain: "valen-ai-4cea3.firebaseapp.com",
  projectId: "valen-ai-4cea3",
  storageBucket: "valen-ai-4cea3.firebasestorage.app",
  messagingSenderId: "20017157509",
  appId: "1:20017157509:web:e2f73248a54c0e7517e0ec",
  measurementId: "G-3L5QPBLRDG",
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

// Analytics is optional and can fail in some environments.
export async function initFirebaseAnalytics() {
  if (typeof window === "undefined") return;
  const supported = await isSupported();
  if (!supported) return;
  return getAnalytics(firebaseApp);
}

