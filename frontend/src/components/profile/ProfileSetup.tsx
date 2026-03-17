import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResumeUpload from './ResumeUpload';
import ManualSetup from './ManualSetup';
import InterviewConfig from './InterviewConfig';
import { Upload, Settings, FileText, User, Sparkles } from 'lucide-react';

const ProfileSetup: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get parsedData from location state or localStorage
  const parsedDataFromState = (location.state as any)?.parsedData;
  const [parsedData, setParsedData] = React.useState<any>(parsedDataFromState);
  const [mode, setMode] = useState<'resume' | 'manual' | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // Check for parsedData on mount and when location state changes
  useEffect(() => {
    // First check location state
    const stateData = (location.state as any)?.parsedData;
    if (stateData) {
      console.log('Found parsedData in location state:', stateData);
      setParsedData(stateData);
      setShowRoleSelection(true);
      setMode(null);
      // Clear location state after reading
      window.history.replaceState({}, '', location.pathname);
      return;
    }
    
    // Then check localStorage
    const storedData = localStorage.getItem('resumeParsedData');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        console.log('Found parsedData in localStorage:', parsed);
        setParsedData(parsed);
        setShowRoleSelection(true);
        setMode(null);
        // Clear from localStorage after reading
        localStorage.removeItem('resumeParsedData');
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
  }, [location.state, location.pathname]);

  return (
    <div className="min-h-screen bg-[#020617] text-white py-20 px-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-sky-600 rounded-2xl mb-6 transform hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase mb-4">
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Setup Your Interview
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Choose how you'd like to set up your interview profile
          </p>
        </div>

        {showRoleSelection && parsedData ? (
          /* Role Selection after Resume Review */
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                setShowRoleSelection(false);
                setMode(null);
                setParsedData(null);
                // Clear any stored data
                localStorage.removeItem('resumeParsedData');
                navigate('/setup', { replace: true });
              }}
              className="mb-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <InterviewConfig
              parsedData={parsedData}
              onComplete={() => {
                // Navigation is handled in InterviewConfig
              }}
            />
          </div>
        ) : !mode ? (
          /* Mode Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Resume Upload Option */}
            <button
              onClick={() => setMode('resume')}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-2xl mb-6 transform group-hover:rotate-6 transition-transform duration-300">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">Upload Resume</h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Let our AI automatically extract your skills, experience, and background from your resume to personalize your interview experience.
                </p>
                <div className="flex items-center space-x-2 text-sky-400 font-semibold group-hover:text-sky-300 transition-colors">
                  <Upload className="w-5 h-5" />
                  <span>Quick & Easy</span>
                </div>
                <div className="mt-6 p-4 bg-sky-400/10 border border-sky-400/30 rounded-xl">
                  <p className="text-xs text-gray-400">Supports PDF, DOCX, TXT formats</p>
                </div>
              </div>
            </button>

            {/* Manual Setup Option */}
            <button
              onClick={() => setMode('manual')}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 transform group-hover:rotate-6 transition-transform duration-300">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">Manual Setup</h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Manually configure your interview settings by selecting your target role, interview type, and round preferences.
                </p>
                <div className="flex items-center space-x-2 text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Custom Control</span>
                </div>
                <div className="mt-6 p-4 bg-purple-400/10 border border-purple-400/30 rounded-xl">
                  <p className="text-xs text-gray-400">Full control over interview parameters</p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          /* Selected Mode Content */
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setMode(null)}
              className="mb-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to options</span>
            </button>
            {mode === 'resume' && <ResumeUpload />}
            {mode === 'manual' && <ManualSetup />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
