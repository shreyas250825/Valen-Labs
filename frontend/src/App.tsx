import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/common/ScrollToTop';
import LandingPage from './components/landing/LandingPage';
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
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";

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
        
        {/* All routes are now public - no authentication required */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/report" element={<Layout><Report /></Layout>} />
        <Route path="/setup" element={<Layout><ProfileSetup /></Layout>} />
        <Route path="/interview" element={<Layout><InterviewInterface /></Layout>} />
        <Route path="/feedback" element={<Layout><FeedbackDashboard /></Layout>} />
        <Route path="/reports" element={<Layout><ReportList /></Layout>} />
        <Route path="/reports/:sessionId" element={<Layout><ReportViewer /></Layout>} />
        <Route path="/aptitude" element={<Layout><AptitudeAssessment /></Layout>} />
        <Route path="/job-fit" element={<Layout><JobFitAnalysis /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;