import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FileText, Briefcase, Target, TrendingUp, 
  CheckCircle, AlertCircle, Calendar, Award, BookOpen,
  Search, Edit3, Loader2
} from 'lucide-react';
import Layout from '../layout/Layout';
import { logJobFitResultToBackend } from '../../services/backendSupabase';
import { API_BASE_URL } from '../../services/api';

interface ParsedResumeData {
  skills: string[];
  experience_years: number;
  experience: {
    level: string;
    years_experience: number;
    companies: string[];
    positions: string[];
  };
  projects: string[];
  education: string[];
  estimated_role: string;
  summary: string;
}

interface JobFitAnalysis {
  overall_fit_score: number;
  skill_match_percentage: number;
  experience_match_percentage: number;
  missing_skills: string[];
  matched_skills: string[];
  role_suitability: string;
  confidence_score: number;
  role_specific_insights: {
    experience_alignment: any;
    skill_gap_analysis: any;
    growth_potential: any;
    cultural_fit_indicators: any;
  };
}

interface JobFitResult {
  success: boolean;
  role: string;
  candidate_summary: {
    name: string;
    experience_years: number;
    experience_level: string;
    top_skills: string[];
    estimated_role: string;
  };
  job_fit_analysis: JobFitAnalysis;
  recommendation: {
    recommendation: string;
    action: string;
    confidence_level: string;
    color: string;
    score: number;
  };
  next_steps: string[];
}

interface AvailableRole {
  roles: string[];
  total_count: number;
}

type FlowStep = 'upload' | 'role-selection' | 'analysis' | 'results';

const JobFitAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JobFitResult | null>(null);
  const [error, setError] = useState<string>('');

  // Load available roles and check for existing resume data on component mount
  useEffect(() => {
    fetchAvailableRoles();
    checkForExistingResumeData();
  }, []);

  const checkForExistingResumeData = () => {
    // Check if there's existing resume data from localStorage or previous sessions
    const existingProfile = localStorage.getItem('interviewProfile');
    if (existingProfile) {
      try {
        const profile = JSON.parse(existingProfile);
        if (profile.skills && profile.estimated_role) {
          // Auto-populate with existing resume data
          const resumeData: ParsedResumeData = {
            skills: profile.skills || [],
            experience_years: 2.0, // Safe default
            experience: {
              level: "Mid-Level",
              years_experience: 2.0,
              companies: [],
              positions: []
            },
            projects: profile.projects || [],
            education: profile.education || [],
            estimated_role: profile.estimated_role || "Software Engineer",
            summary: profile.summary || "Professional with 2 years of experience"
          };
          
          setParsedData(resumeData);
          setCurrentStep('role-selection');
          setSelectedRole(profile.estimated_role || '');
        }
      } catch (e) {
        // Failed to parse existing data, continue with upload flow
      }
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/job-fit/available-roles`);
      if (response.ok) {
        const data: AvailableRole = await response.json();
        setAvailableRoles(data.roles);
      }
    } catch (error) {
      console.error('Failed to fetch available roles:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, Word document, or text file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume_file', file);

      const response = await fetch(`${API_BASE_URL}/api/job-fit/parse-resume`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setParsedData(data.parsed_data);
          setCurrentStep('role-selection');
          
          // Pre-select estimated role if available
          if (data.parsed_data.estimated_role && availableRoles.includes(data.parsed_data.estimated_role)) {
            setSelectedRole(data.parsed_data.estimated_role);
          }
        } else {
          setError('Failed to parse resume. Please try again.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to parse resume');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
    setIsCustomRole(false);
    setCustomRole('');
  };

  const handleAnalyze = async () => {
    if (!parsedData || (!selectedRole && !customRole)) return;

    const roleToAnalyze = isCustomRole ? customRole : selectedRole;
    
    // For custom roles, we don't validate against the available roles list
    if (!isCustomRole && !availableRoles.includes(roleToAnalyze)) {
      setError('Please select a valid role from the list');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('parsed_resume', JSON.stringify(parsedData));
      formData.append('selected_role', roleToAnalyze);

      const response = await fetch(`${API_BASE_URL}/api/job-fit/analyze-with-role`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: JobFitResult = await response.json();
        setAnalysisResult(result);
        setCurrentStep('results');

        // Non-blocking: persist latest job fit result to Supabase (1 row per user)
        logJobFitResultToBackend({
          role: result.role,
          overall_fit_score: result.job_fit_analysis?.overall_fit_score ?? null,
          skill_match_percentage: result.job_fit_analysis?.skill_match_percentage ?? null,
          experience_match_percentage: result.job_fit_analysis?.experience_match_percentage ?? null,
          matched_skills: result.job_fit_analysis?.matched_skills ?? null,
          missing_skills: result.job_fit_analysis?.missing_skills ?? null,
          recommendation: result.recommendation?.recommendation ?? null,
          next_steps: result.next_steps ?? null,
          full_result: result,
        }).catch((e) => console.error('Failed to store job fit result:', e));
        
        // Save job fit analysis to localStorage
        const jobFitAnalysis = {
          id: `jobfit_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          targetRole: isCustomRole ? customRole : selectedRole,
          role: isCustomRole ? customRole : selectedRole,
          candidateName: parsedData?.summary || 'User',
          overall_fit_score: result.job_fit_analysis.overall_fit_score,
          overallFitScore: result.job_fit_analysis.overall_fit_score,
          skill_match_percentage: result.job_fit_analysis.skill_match_percentage,
          experience_match_percentage: result.job_fit_analysis.experience_match_percentage,
          matched_skills: result.job_fit_analysis.matched_skills,
          missing_skills: result.job_fit_analysis.missing_skills,
          recommendation: result.recommendation.recommendation,
          confidence_score: result.job_fit_analysis.confidence_score,
          next_steps: result.next_steps,
          full_result: result
        };
        
        const existingAnalyses = JSON.parse(localStorage.getItem('jobFitAnalyses') || '[]');
        existingAnalyses.push(jobFitAnalysis);
        localStorage.setItem('jobFitAnalyses', JSON.stringify(existingAnalyses));
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to analyze job fit');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setParsedData(null);
    setSelectedRole('');
    setCustomRole('');
    setIsCustomRole(false);
    setAnalysisResult(null);
    setError('');
    
    // Clear file input
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'blue': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      case 'yellow': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'red': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-88px)] bg-gradient-to-br from-slate-950 via-[#020617] to-slate-900 text-white">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-[15px] pb-10 relative z-10">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase mb-3 bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">
              AI Job Fit Analysis
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">Upload resume → Select role → Get AI-powered analysis</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-4">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {[
                { step: 'upload', label: 'Upload Resume', icon: Upload },
                { step: 'role-selection', label: 'Select Role', icon: Briefcase },
                { step: 'analysis', label: 'AI Analysis', icon: Target },
                { step: 'results', label: 'Results', icon: TrendingUp }
              ].map(({ step, label, icon: Icon }, index) => {
                const isActive = currentStep === step;
                const isCompleted = ['upload', 'role-selection', 'analysis', 'results'].indexOf(currentStep) > index;
                
                return (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      isActive 
                        ? 'border-sky-400 bg-sky-400/20 text-sky-400' 
                        : isCompleted 
                          ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                          : 'border-gray-600 bg-gray-600/20 text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-sky-400' : isCompleted ? 'text-emerald-400' : 'text-gray-400'
                    }`}>
                      {label}
                    </span>
                    {index < 3 && (
                      <div
                        className={`hidden md:block w-8 h-0.5 mx-4 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-gray-600'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-400/10 border border-red-400/30 rounded-xl">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-300 mt-1">{error}</p>
            </div>
          )}

          {/* Step 1: Upload Resume */}
          {currentStep === 'upload' && (
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8">
              {/* Check if existing resume data is available */}
              {(() => {
                const existingProfile = localStorage.getItem('interviewProfile');
                const hasExistingData = existingProfile && JSON.parse(existingProfile).skills;
                
                return hasExistingData ? (
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-600 to-sky-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-4">Resume Data Available</h2>
                    <p className="text-gray-400 mb-6">We found existing resume data from your previous session</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                      <button
                        onClick={checkForExistingResumeData}
                        className="flex flex-col items-center gap-3 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 px-6 py-4 rounded-[24px] font-black tracking-tighter uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)]"
                      >
                        <CheckCircle className="w-6 h-6" />
                        Use Existing Resume Data
                      </button>
                      
                      <label className="flex flex-col items-center gap-3 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 px-6 py-4 rounded-[24px] font-black tracking-tighter uppercase cursor-pointer transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)]">
                        <Upload className="w-6 h-6" />
                        Upload New Resume
                        <input
                          id="resume-upload"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      Choose to use your existing resume data or upload a new resume file
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-sky-600 rounded-full flex items-center justify-center">
                      <Upload className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-4">Upload Your Resume</h2>
                    <p className="text-gray-400 mb-6">Upload your resume to get started with AI-powered job fit analysis</p>
                    <p className="text-sm text-gray-500 mb-8">Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)</p>
                    
                    {!isUploading ? (
                      <label className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 px-8 py-4 rounded-[24px] font-black tracking-tighter uppercase cursor-pointer transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)]">
                        <Upload className="w-6 h-6" />
                        Choose Resume File
                        <input
                          id="resume-upload"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sky-400 font-medium">Parsing your resume...</p>
                        <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
                      </div>
                    )}
                    
                    {uploadedFile && !isUploading && (
                      <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <FileText className="w-4 h-4" />
                          <span>{uploadedFile.name}</span>
                          <span>({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Step 2: Role Selection */}
          {currentStep === 'role-selection' && parsedData && (
            <div className="space-y-6">
              {/* Parsed Resume Summary */}
              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-xl font-black tracking-tighter uppercase">Resume Parsed Successfully</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-emerald-400">Profile Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span>Estimated Role: {parsedData.estimated_role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Experience: 2 years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span>Level: {parsedData.experience.level}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-sky-400">Top Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-sky-400/10 border border-sky-400/30 rounded-full text-xs text-sky-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {parsedData.skills.length > 6 && (
                        <span className="px-3 py-1 bg-gray-600/30 border border-gray-600/30 rounded-full text-xs text-gray-400">
                          +{parsedData.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6">
                <h3 className="text-xl font-black tracking-tighter uppercase mb-4">Select Target Role</h3>
                
                {/* Auto-selected role notification */}
                {selectedRole && !isCustomRole && (
                  <div className="mb-6 p-4 bg-emerald-400/10 border border-emerald-400/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="font-semibold text-emerald-400">Auto-Selected Role</span>
                    </div>
                    <p className="text-sm text-emerald-300">
                      Based on your resume, we've pre-selected "<strong>{selectedRole}</strong>" as your target role. 
                      You can change this selection below if needed.
                    </p>
                  </div>
                )}
                
                {/* Toggle between predefined and custom role */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setIsCustomRole(false)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      !isCustomRole 
                        ? 'bg-sky-400/20 text-sky-400 border border-sky-400/30' 
                        : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                    }`}
                  >
                    Choose from List
                  </button>
                  <button
                    onClick={() => setIsCustomRole(true)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      isCustomRole 
                        ? 'bg-sky-400/20 text-sky-400 border border-sky-400/30' 
                        : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                    }`}
                  >
                    Custom Role
                  </button>
                  {selectedRole && (
                    <button
                      onClick={() => {
                        setSelectedRole('');
                        setCustomRole('');
                        setIsCustomRole(false);
                      }}
                      className="px-4 py-2 rounded-xl font-medium transition-all bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {!isCustomRole ? (
                  <div>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search roles..."
                          className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-sky-400/50"
                          onChange={() => {
                            // Simple search filter - you can enhance this
                            // Filter logic here if needed
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                      {availableRoles.map((role, index) => {
                        const isRecommended = parsedData.estimated_role === role;
                        const isSelected = selectedRole === role;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleRoleSelection(role)}
                            className={`text-left p-4 rounded-xl border transition-all relative ${
                              isSelected
                                ? 'border-sky-400 bg-sky-400/10 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                                : isRecommended
                                  ? 'border-emerald-400/50 bg-emerald-400/5 hover:bg-emerald-400/10 text-gray-300 hover:border-emerald-400'
                                  : 'border-white/10 bg-slate-700/30 hover:bg-slate-700/50 text-gray-300'
                            }`}
                          >
                            {isRecommended && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className="font-medium">{role}</div>
                            {isRecommended && (
                              <div className="text-xs text-emerald-400 mt-1 font-semibold">
                                ✨ Auto-Selected from Resume
                              </div>
                            )}
                            {isSelected && !isRecommended && (
                              <div className="text-xs text-sky-400 mt-1">Selected</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Edit3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter custom role (e.g., Senior DevOps Engineer)"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-sky-400/50"
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Enter any role title you want to analyze against
                    </p>
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleStartOver}
                    className="px-6 py-3 bg-gray-600/30 hover:bg-gray-600/50 rounded-xl font-medium transition-all"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={() => setCurrentStep('analysis')}
                    disabled={!selectedRole && !customRole}
                    className={`flex-1 px-6 py-3 rounded-xl font-black tracking-tighter uppercase transition-all ${
                      (selectedRole || customRole)
                        ? 'bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                        : 'bg-gray-600/30 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Analyze Job Fit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Analysis */}
          {currentStep === 'analysis' && (
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-sky-600 rounded-full flex items-center justify-center">
                  {!isAnalyzing ? (
                    <Target className="w-12 h-12 text-white" />
                  ) : (
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  )}
                </div>
                <h2 className="text-2xl font-black tracking-tighter uppercase mb-4">
                  {!isAnalyzing ? 'Ready to Analyze' : 'AI Analysis in Progress'}
                </h2>
                <p className="text-gray-400 mb-8">
                  {!isAnalyzing 
                    ? `Analyzing your fit for: ${isCustomRole ? customRole : selectedRole}`
                    : 'Ollama AI is analyzing your resume against the selected role...'
                  }
                </p>
                
                {!isAnalyzing ? (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setCurrentStep('role-selection')}
                      className="px-6 py-3 bg-gray-600/30 hover:bg-gray-600/50 rounded-xl font-medium transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAnalyze}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 rounded-xl font-black tracking-tighter uppercase transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                    >
                      Start Analysis
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sky-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing with Ollama AI...</span>
                    </div>
                    <p className="text-sm text-gray-500">This may take 30-60 seconds</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 'results' && analysisResult && (
            <div className="space-y-6">
              {/* Overall Results */}
              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6">
                <h3 className="text-2xl font-black tracking-tighter uppercase mb-6 text-center">
                  Job Fit Analysis Results
                </h3>

                {/* Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className={`text-5xl font-black mb-2 ${getScoreColor(analysisResult.job_fit_analysis.overall_fit_score)}`}>
                      {analysisResult.job_fit_analysis.overall_fit_score}%
                    </div>
                    <div className="text-gray-400 font-medium">Overall Fit</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-black mb-2 ${getScoreColor(analysisResult.job_fit_analysis.skill_match_percentage)}`}>
                      {analysisResult.job_fit_analysis.skill_match_percentage}%
                    </div>
                    <div className="text-gray-400 font-medium">Skill Match</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-black mb-2 ${getScoreColor(analysisResult.job_fit_analysis.experience_match_percentage)}`}>
                      {analysisResult.job_fit_analysis.experience_match_percentage}%
                    </div>
                    <div className="text-gray-400 font-medium">Experience Match</div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`p-4 rounded-xl border mb-6 ${getRecommendationColor(analysisResult.recommendation.color)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5" />
                    <span className="font-black tracking-tighter uppercase">
                      {analysisResult.recommendation.recommendation}
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{analysisResult.recommendation.action}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span>Confidence: {analysisResult.recommendation.confidence_level}</span>
                    <span>AI Confidence: {analysisResult.job_fit_analysis.confidence_score}%</span>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6">
                  <h4 className="font-black tracking-tighter uppercase mb-4 text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Matched Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.job_fit_analysis.matched_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/30 rounded-full text-xs text-emerald-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6">
                  <h4 className="font-black tracking-tighter uppercase mb-4 text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Skills to Develop
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.job_fit_analysis.missing_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-400/10 border border-red-400/30 rounded-full text-xs text-red-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {analysisResult.job_fit_analysis.missing_skills.length === 0 && (
                      <span className="text-emerald-400 text-sm">No missing skills identified!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6">
                <h4 className="font-black tracking-tighter uppercase mb-4 text-sky-400 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Recommended Next Steps
                </h4>
                <div className="space-y-3">
                  {analysisResult.next_steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-xl">
                      <div className="w-6 h-6 bg-sky-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-sky-400">{index + 1}</span>
                      </div>
                      <span className="text-sm text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleStartOver}
                  className="px-6 py-3 bg-gray-600/30 hover:bg-gray-600/50 rounded-xl font-medium transition-all"
                >
                  Analyze Another Role
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 rounded-xl font-black tracking-tighter uppercase transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobFitAnalysis;