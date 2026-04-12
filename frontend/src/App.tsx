import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/common/ScrollToTop';
import LandingPage from './components/landing/LandingPage';
import ComingSoonResumePage from './components/landing/ComingSoonResumePage';
import ProfileSetup from './components/profile/ProfileSetup';
import InterviewInterface from './components/interview/InterviewInterface';
import FeedbackDashboard from './components/feedback/FeedbackDashboard';
import ReportList from './components/reports/ReportList';
import ReportViewer from './components/reports/ReportViewer';
import Report from './components/reports/Report';
import Dashboard from './components/dashboard/Dashboard';
import AboutPage from './components/about/AboutPage';
import AptitudeAssessment from './components/aptitude/AptitudeAssessment';
import JobFitAnalysis from './components/jobfit/JobFitAnalysis';
import { ResumeBuilder } from './features/resume-builder';
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { firebaseAuth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

function RequireAuth({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading");

  useEffect(() => {
    const current = firebaseAuth.currentUser;
    if (current) {
      setStatus("authed");
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, (user: User | null) => {
      setStatus(user ? "authed" : "guest");
      unsub();
    });

    return () => {
      unsub();
    };
  }, []);

  if (status === "loading") {
    return <LoadingSpinner text="Checking your session..." />;
  }

  if (status === "guest") {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

function App() {
  // Disable automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<Layout><SignInPage /></Layout>} />
        <Route path="/signup" element={<Layout><SignUpPage /></Layout>} />
        <Route path="/ai-resume-builder" element={<Layout><ComingSoonResumePage /></Layout>} />
        <Route path="/coming-soon" element={<Navigate to="/ai-resume-builder" replace />} />

        {/* Protected routes - require sign in */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Layout><Dashboard /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/report"
          element={
            <RequireAuth>
              <Layout><Report /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/setup"
          element={
            <RequireAuth>
              <Layout><ProfileSetup /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/interview"
          element={
            <RequireAuth>
              <Layout><InterviewInterface /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/feedback"
          element={
            <RequireAuth>
              <Layout><FeedbackDashboard /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/reports"
          element={
            <RequireAuth>
              <Layout><ReportList /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/reports/:sessionId"
          element={
            <RequireAuth>
              <Layout><ReportViewer /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/aptitude"
          element={
            <RequireAuth>
              <Layout><AptitudeAssessment /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/job-fit"
          element={
            <RequireAuth>
              <Layout><JobFitAnalysis /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/resume-builder"
          element={
            <RequireAuth>
              <Layout><ResumeBuilder /></Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;