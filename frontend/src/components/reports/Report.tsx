import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../layout/Layout';
import { getReportSimple } from '../../services/api';
import { 
  ArrowLeft, Download, Share2, Trophy, TrendingUp,
  Clock, Target, MessageSquare, Zap, Eye,
  AlertCircle, CheckCircle, PieChart, Activity,
  BookOpen, Lightbulb, ThumbsUp, ThumbsDown, Minus,
  ChevronRight, PlayCircle
} from 'lucide-react';
import { LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const Report = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLightTheme = theme === "light";
  const [searchParams] = useSearchParams();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const sessionId = searchParams.get('sessionId');
  
  // Handler functions
  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleViewAllReports = () => {
    navigate('/reports');
  };

  const handlePracticeAgain = () => {
    navigate('/setup');
  };

  const handleStartPractice = () => {
    navigate('/setup');
  };
  
  useEffect(() => {
    const loadReport = async () => {
      if (!sessionId) {
        setError('No session ID provided in URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Try to get report from API first
        const data = await getReportSimple(sessionId);
        setReportData(data);
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to load report from API:', error);
        
        // Fallback to localStorage
        try {
          const history = localStorage.getItem('interviewHistory');
          if (history) {
            const historyArray = JSON.parse(history);
            const sessionData = historyArray.find((h: any) => h.session_id === sessionId);
            
            if (sessionData) {
              // Create a mock report structure from localStorage data
              const mockReportData = {
                session_id: sessionId,
                interview_type: sessionData.interview_type || 'mixed',
                evaluations: sessionData.evaluations || [],
                questions: sessionData.questions || [],
                answers: sessionData.answers || [],
                created_at: sessionData.created_at || sessionData.date || new Date().toISOString()
              };
              
              setReportData(mockReportData);
              setError('Report loaded from local storage (API unavailable)');
            } else {
              setError(`Report not found for session ID: ${sessionId}`);
            }
          } else {
            setError('No report data available');
          }
        } catch (localStorageError) {
          console.error('Failed to load from localStorage:', localStorageError);
          setError('Failed to load report data');
        }
        
        setLoading(false);
      }
    };
    
    loadReport();
  }, [sessionId, retryCount]);

  // Helper function to compute data from reportData
  const computeReportData = () => {
    if (!reportData) {
      return {
        interviewData: null,
        performanceMetrics: [],
        responseQuality: [],
        speechAnalysis: [],
        questions: [],
        insights: [],
        recommendations: []
      };
    }

    const profile = JSON.parse(localStorage.getItem('interviewProfile') || '{}');
    const evaluations = reportData.evaluations || [];
    const questions = reportData.questions || [];
    const answers = reportData.answers || [];

    // Calculate overall score from evaluations
    let overallScore = 0;
    if (evaluations.length > 0) {
      const avgTechnical = evaluations.reduce((sum: number, e: any) => sum + (e.technical || 0), 0) / evaluations.length;
      const avgCommunication = evaluations.reduce((sum: number, e: any) => sum + (e.communication || 0), 0) / evaluations.length;
      const avgConfidence = evaluations.reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / evaluations.length;
      overallScore = Math.round((avgTechnical + avgCommunication + avgConfidence) / 3);
    }

    // Interview data
    const interviewData = {
      id: reportData.session_id,
      type: reportData.interview_type || profile.interview_type || "Technical Interview",
      role: profile.estimated_role || profile.role || "Software Engineer",
      date: new Date().toISOString().split('T')[0],
      duration: `${Math.round((questions.length * 4))} min`, // Estimate 4 min per question
      overallScore: overallScore || 0,
      previousScore: 0, // Could be loaded from previous interview
      questionsAnswered: evaluations.length
    };

    // Performance metrics from evaluations
    const performanceMetrics = evaluations.length > 0 ? [
      {
        category: "Technical Knowledge",
        score: Math.round(evaluations.reduce((sum: number, e: any) => sum + (e.technical || 0), 0) / evaluations.length),
        benchmark: 80
      },
      {
        category: "Communication",
        score: Math.round(evaluations.reduce((sum: number, e: any) => sum + (e.communication || 0), 0) / evaluations.length),
        benchmark: 75
      },
      {
        category: "Confidence",
        score: Math.round(evaluations.reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / evaluations.length),
        benchmark: 70
      }
    ] : [];

    // Response quality breakdown
    const responseQuality = (() => {
      if (evaluations.length === 0) return [];
      const scores = evaluations.map((e: any) => {
        const avg = ((e.technical || 0) + (e.communication || 0) + (e.confidence || 0)) / 3;
        return avg;
      });
      
      const excellent = scores.filter((s: number) => s >= 90).length;
      const good = scores.filter((s: number) => s >= 75 && s < 90).length;
      const average = scores.filter((s: number) => s >= 60 && s < 75).length;
      const needsWork = scores.filter((s: number) => s < 60).length;
      
      const total = scores.length;
      return [
        { name: "Excellent", value: Math.round((excellent / total) * 100), color: "#10b981" },
        { name: "Good", value: Math.round((good / total) * 100), color: "#3b82f6" },
        { name: "Average", value: Math.round((average / total) * 100), color: "#f59e0b" },
        { name: "Needs Work", value: Math.round((needsWork / total) * 100), color: "#ef4444" }
      ];
    })();

    // Speech analysis over time (simulated from evaluations)
    const speechAnalysis = evaluations.map((e: any, index: number) => {
      const timeSegment = `${index * 5}-${(index + 1) * 5}min`;
      return {
        time: timeSegment,
        confidence: e.confidence || 75,
        clarity: e.communication || 80,
        pace: 85 - Math.random() * 10 // Simulated pace
      };
    });

    // Questions with real data - use question text directly from answers
    const questionData = answers.map((answer: any, index: number) => {
      const evaluation = evaluations[index] || {};
      // Use the question text stored with the answer, not from separate questions array
      const questionText = answer.question || answer.transcript || 'Question not available';
      const avgScore = evaluation ? Math.round(((evaluation.technical || 0) + (evaluation.communication || 0) + (evaluation.confidence || 0)) / 3) : 0;
      
      // Parse notes and improved answer for insights
      const notes = evaluation.notes || '';
      const improved = answer.improved || '';
      const strengths: string[] = [];
      const improvements: string[] = [];
      
      // Extract strengths from evaluation scores and notes
      if (avgScore >= 85) {
        strengths.push('Strong technical understanding demonstrated');
        strengths.push('Clear and structured response');
      } else if (avgScore >= 70) {
        strengths.push('Good foundation of knowledge');
        strengths.push('Relevant answer provided');
      }
      
      if (evaluation.technical && evaluation.technical >= 80) {
        strengths.push('Demonstrated technical depth');
      }
      if (evaluation.communication && evaluation.communication >= 80) {
        strengths.push('Clear communication style');
      }
      
      // Use notes for additional insights
      if (notes) {
        if (notes.toLowerCase().includes('excellent') || notes.toLowerCase().includes('strong')) {
          strengths.push('Performance noted as strong');
        }
      }
      
      // Extract improvements based on weak areas
      if (avgScore < 85) {
        if (evaluation.technical && evaluation.technical < 80) {
          improvements.push('Strengthen technical explanations with specific examples');
        }
        if (evaluation.communication && evaluation.communication < 75) {
          improvements.push('Improve clarity and structure of responses');
        }
        if (evaluation.confidence && evaluation.confidence < 75) {
          improvements.push('Work on building confidence in delivery');
        }
      }
      
      // Use improved answer as suggestion if available
      if (improved && improved.trim() && improved !== (answer.transcript || '').trim()) {
        const improvedPreview = improved.length > 80 ? improved.substring(0, 80) + '...' : improved;
        improvements.push(`Improved version: ${improvedPreview}`);
      }
      
      // Parse notes for improvement suggestions
      if (notes) {
        if (notes.toLowerCase().includes('improve') || notes.toLowerCase().includes('consider')) {
          improvements.push('Review feedback notes for specific areas to enhance');
        }
      }
      
      // Default fallback
      if (strengths.length === 0) {
        strengths.push('Answer provided relevant to the question');
      }
      if (improvements.length === 0 && avgScore < 90) {
        improvements.push('Continue practicing to refine your responses');
      }

      return {
        id: answer.question_id || `q${index + 1}`,
        question: questionText,
        answer: answer.transcript || answer.answer || 'No answer provided',
        expectedAnswer: evaluation.expected_answer || 'A strong answer should demonstrate relevant experience, specific examples, and clear technical understanding.',
        score: avgScore,
        sentiment: avgScore >= 75 ? 'positive' : avgScore >= 60 ? 'neutral' : 'negative',
        strengths: strengths,
        improvements: improvements,
        duration: '3-5 min'
      };
    });

    // Generate insights from evaluations
    const insights: any[] = [];
    if (evaluations.length > 0) {
      const avgTechnical = evaluations.reduce((sum: number, e: any) => sum + (e.technical || 0), 0) / evaluations.length;
      const avgCommunication = evaluations.reduce((sum: number, e: any) => sum + (e.communication || 0), 0) / evaluations.length;
      const avgConfidence = evaluations.reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / evaluations.length;

      if (avgTechnical >= 85) {
        insights.push({
          type: "strength",
          icon: ThumbsUp,
          title: "Technical Knowledge",
          description: "Your technical responses are strong, showing good understanding of the concepts.",
          gradient: "from-green-400 to-emerald-500"
        });
      } else {
        insights.push({
          type: "improvement",
          icon: TrendingUp,
          title: "Technical Depth",
          description: "Consider providing more detailed technical explanations and examples.",
          gradient: "from-orange-400 to-yellow-500"
        });
      }

      if (avgCommunication >= 80) {
        insights.push({
          type: "strength",
          icon: Target,
          title: "Communication Skills",
          description: "You communicate your ideas clearly and effectively.",
          gradient: "from-sky-400 to-cyan-500"
        });
      } else {
        insights.push({
          type: "improvement",
          icon: Eye,
          title: "Communication",
          description: "Work on structuring your answers more clearly and providing more context.",
          gradient: "from-purple-400 to-pink-500"
        });
      }

      if (avgConfidence < 75) {
        insights.push({
          type: "improvement",
          icon: TrendingUp,
          title: "Confidence",
          description: "Build confidence by practicing more and preparing examples.",
          gradient: "from-orange-400 to-yellow-500"
        });
      }
    }

    // Generate recommendations based on weak areas
    const recommendations: any[] = [];
    if (evaluations.length > 0) {
      const avgTechnical = evaluations.reduce((sum: number, e: any) => sum + (e.technical || 0), 0) / evaluations.length;
      const avgCommunication = evaluations.reduce((sum: number, e: any) => sum + (e.communication || 0), 0) / evaluations.length;
      const avgConfidence = evaluations.reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / evaluations.length;

      if (avgTechnical < 80) {
        recommendations.push({
          title: "Strengthen Technical Knowledge",
          description: "Review core concepts and practice explaining technical topics clearly.",
          priority: "high",
          estimatedTime: "2-3 hours"
        });
      }

      if (avgCommunication < 75) {
        recommendations.push({
          title: "Improve Communication Skills",
          description: "Practice structuring answers using the STAR method.",
          priority: avgCommunication < 70 ? "high" : "medium",
          estimatedTime: "1-2 hours"
        });
      }

      if (avgConfidence < 75) {
        recommendations.push({
          title: "Build Confidence",
          description: "Practice more interviews to become comfortable with the format.",
          priority: "medium",
          estimatedTime: "1 hour"
        });
      }
    }

    return {
      interviewData,
      performanceMetrics,
      responseQuality,
      speechAnalysis,
      questions: questionData,
      insights,
      recommendations: recommendations.length > 0 ? recommendations : [{
        title: "Continue Practicing",
        description: "Keep practicing interviews to maintain and improve your skills.",
        priority: "low",
        estimatedTime: "30 minutes"
      }]
    };
  };

  const {
    interviewData,
    performanceMetrics,
    responseQuality,
    speechAnalysis,
    questions,
    insights,
    recommendations
  } = computeReportData();

  // Show error state with better UX
  if (error && !reportData && !loading) {
    return (
      <Layout>
        <div className={`min-h-screen ${isLightTheme ? "bg-slate-50 text-slate-900" : "bg-[#020617] text-white"}`}>
          {/* Animated Background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative flex items-center justify-center min-h-screen px-6">
            <div className="max-w-md w-full">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-500/20 rounded-2xl blur-2xl opacity-50"></div>
                <div className={`relative backdrop-blur-xl rounded-2xl p-8 text-center ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/40 border border-white/10"}`}>
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                  
                  <h2 className={`text-2xl font-bold mb-3 ${isLightTheme ? "text-slate-900" : "text-white"}`}>Report Not Found</h2>
                  
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {error.includes('session ID') 
                      ? `We couldn't find a report for session ID: ${sessionId}`
                      : error.includes('local storage')
                      ? 'Report loaded from local storage, but some features may be limited.'
                      : 'There was an issue loading your report. This might be due to a network problem or the report may no longer be available.'
                    }
                  </p>

                  {error.includes('local storage') ? (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-center justify-center space-x-2 text-yellow-300 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Limited functionality - API unavailable</span>
                      </div>
                    </div>
                  ) : retryCount < maxRetries ? (
                    <button
                      onClick={handleRetry}
                      className="mb-4 w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Try Again ({maxRetries - retryCount} attempts left)
                    </button>
                  ) : (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <div className="flex items-center justify-center space-x-2 text-red-300 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Maximum retry attempts reached</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={handleViewAllReports}
                      className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
                    >
                      View All Reports
                    </button>
                    <button
                      onClick={handleBackToDashboard}
                      className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
                    >
                      Back to Dashboard
                    </button>
                  </div>

                  {sessionId && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="text-xs text-gray-500">
                        Session ID: {sessionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'positive') return <ThumbsUp className="w-4 h-4 text-green-400" />;
    if (sentiment === 'neutral') return <Minus className="w-4 h-4 text-yellow-400" />;
    return <ThumbsDown className="w-4 h-4 text-red-400" />;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'from-red-400 to-orange-500';
    if (priority === 'medium') return 'from-yellow-400 to-orange-400';
    return 'from-blue-400 to-cyan-500';
  };

  if (loading) {
    return (
      <Layout>
        <div className={`min-h-screen flex items-center justify-center ${isLightTheme ? "bg-slate-50 text-slate-900" : "bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white"}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
            <p>Loading report...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-screen ${isLightTheme ? "bg-slate-50 text-slate-900" : "bg-[#020617] text-white"}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className={`relative border-b backdrop-blur-3xl ${isLightTheme ? "border-slate-200 bg-white" : "border-white/10 bg-white/[0.03]"}`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-2xl transition-all duration-300 ${isLightTheme ? "hover:bg-slate-100" : "hover:bg-white/10"}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-2xl font-black tracking-tighter uppercase ${isLightTheme ? "text-slate-900" : "bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"}`}>Interview Performance Report</h1>
                {interviewData && (
                <p className="text-sm text-slate-400 mt-1 font-medium">
                  {interviewData.type} • {interviewData.role} • {interviewData.date}
                </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Interview Report',
                      text: `Check out my interview performance: ${interviewData?.overallScore || 0}%`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Report link copied to clipboard!');
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${isLightTheme ? "bg-white border border-slate-200 hover:bg-slate-100" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Warning banner for localStorage fallback */}
        {error && error.includes('local storage') && reportData && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 font-semibold text-sm">Limited Functionality</p>
                <p className="text-yellow-200/80 text-xs">
                  This report was loaded from local storage. Some features may be unavailable due to API connectivity issues.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Score */}
          <div className="lg:col-span-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
            <div className={`relative backdrop-blur-xl rounded-3xl p-8 text-center ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/30 border border-white/10"}`}>
              <Trophy className="w-12 h-12 mx-auto mb-4 text-sky-300" />
              <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent">
                {interviewData?.overallScore || 0}
              </div>
              <div className="text-sm text-gray-400 mb-4">Overall Score</div>
              {interviewData && interviewData.previousScore > 0 && (
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">+{interviewData.overallScore - interviewData.previousScore} from last interview</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-6">
            {interviewData && [
              { label: "Duration", value: interviewData.duration || "N/A", icon: Clock, gradient: "from-purple-500 to-pink-500" },
              { label: "Questions Answered", value: `${interviewData.questionsAnswered || 0}`, icon: MessageSquare, gradient: "from-blue-400 to-purple-500" },
              { label: "Avg Response Time", value: "3-5 min", icon: Activity, gradient: "from-orange-500 to-yellow-500" },
              { label: "Confidence Level", value: performanceMetrics.find(m => m.category === "Confidence") ? `${performanceMetrics.find(m => m.category === "Confidence")!.score}%` : "N/A", icon: Zap, gradient: "from-green-400 to-emerald-500" }
            ].filter(Boolean).map((stat, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                <div className={`relative backdrop-blur-xl rounded-2xl p-6 ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/30 border border-white/10"}`}>
                  <div className={`inline-flex p-3 bg-gradient-to-r ${stat.gradient} rounded-xl mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-cyan-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
            <div className={`relative backdrop-blur-xl rounded-2xl p-6 ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/30 border border-white/10"}`}>
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-sky-300" />
                Performance Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                {performanceMetrics.length > 0 ? (
                <RadarChart data={performanceMetrics}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                  <Radar 
                    name="Your Score" 
                    dataKey="score" 
                    stroke="#06b6d4" 
                    fill="#06b6d4" 
                    fillOpacity={0.6} 
                  />
                  <Radar 
                    name="Benchmark" 
                    dataKey="benchmark" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.3} 
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                </RadarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No performance data available
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
            <div className={`relative backdrop-blur-xl rounded-2xl p-6 ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/30 border border-white/10"}`}>
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-sky-300" />
                Response Quality Distribution
              </h3>
              <div className="space-y-4">
                {responseQuality.length > 0 ? responseQuality.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">{item.name}</span>
                      <span className="text-sm font-semibold text-white">{item.value}%</span>
                    </div>
                    <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-400">
                    No response quality data available
                  </div>
                )}
              </div>
              <div className="mt-6 p-4 bg-sky-400/10 border border-sky-400/30 rounded-xl">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-sky-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-sky-300 mb-1">Great Performance!</p>
                    <p className="text-xs text-gray-400">80% of your responses were rated as good or excellent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Speech Analysis Timeline */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
          <div className={`relative backdrop-blur-xl rounded-2xl p-6 ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/30 border border-white/10"}`}>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-sky-300" />
              Speech Analysis Over Time
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              {speechAnalysis.length > 0 ? (
              <LineChart data={speechAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="confidence" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="clarity" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pace" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No speech analysis data available
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2 text-sky-300" />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.length > 0 ? insights.map((insight, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${insight.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                <div className={`relative backdrop-blur-xl rounded-2xl p-6 ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/30 border border-white/10"}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 bg-gradient-to-r ${insight.gradient} rounded-xl flex-shrink-0`}>
                      <insight.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-white">{insight.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          insight.type === 'strength' 
                            ? 'bg-green-400/20 text-green-300' 
                            : 'bg-orange-400/20 text-orange-300'
                        }`}>
                          {insight.type === 'strength' ? 'Strength' : 'Improvement'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{insight.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-8 text-gray-400">
                No insights available yet
              </div>
            )}
          </div>
        </div>

        {/* Detailed Question Analysis */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-sky-300" />
            Question-by-Question Analysis
          </h3>
          <div className="space-y-6">
            {questions.length > 0 ? questions.map((q: any, index: number) => (
              <div key={q.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className={`relative backdrop-blur-xl rounded-2xl p-6 ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/30 border border-white/10"}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-lg text-sm font-bold">
                          {index + 1}
                        </span>
                        <h4 className="font-semibold text-lg text-white">{q.question}</h4>
                      </div>
                      <p className="text-sm text-gray-400 ml-11 mb-3 line-clamp-2">{q.answer}</p>
                    </div>
                    <div className="flex flex-col items-end ml-4">
                      <div className="text-3xl font-bold bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent">
                        {q.score}
                      </div>
                      <div className="text-xs text-gray-400">Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-semibold text-green-300">Strengths</span>
                      </div>
                      <ul className="space-y-2">
                        {q.strengths.map((strength: string, i: number) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start">
                            <ChevronRight className="w-4 h-4 mr-1 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-semibold text-orange-300">Areas to Improve</span>
                      </div>
                      <ul className="space-y-2">
                        {q.improvements.map((improvement: string, i: number) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start">
                            <ChevronRight className="w-4 h-4 mr-1 text-orange-400 flex-shrink-0 mt-0.5" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Expected Answer Section */}
                  <div className="mb-4">
                    <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-300">Expected Answer Guidance</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {q.expectedAnswer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getSentimentIcon(q.sentiment)}
                        <span className="text-xs text-gray-400 capitalize">{q.sentiment}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{q.duration}</span>
                      </div>
                    </div>
                    <button className="flex items-center space-x-2 text-sm text-sky-300 hover:text-sky-200 transition-colors">
                      <PlayCircle className="w-4 h-4" />
                      <span>Watch Recording</span>
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                No questions answered yet
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-sky-300" />
            Personalized Recommendations
          </h3>
          <div className="space-y-4">
            {recommendations.length > 0 ? recommendations.map((rec, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${getPriorityColor(rec.priority)} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                <div className={`relative backdrop-blur-xl rounded-2xl p-6 ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/30 border border-white/10"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-lg text-white">{rec.title}</h4>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          rec.priority === 'high' 
                            ? 'bg-red-400/20 text-red-300' 
                            : rec.priority === 'medium'
                            ? 'bg-yellow-400/20 text-yellow-300'
                            : 'bg-blue-400/20 text-blue-300'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{rec.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Est. {rec.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={handleStartPractice}
                      className="ml-4 px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-lg text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
                    >
                      Start Practice
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                No recommendations available
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handlePracticeAgain}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-4 rounded-xl font-semibold transform group-hover:scale-105 transition-all duration-300">
              <PlayCircle className="w-5 h-5" />
              <span>Practice Again</span>
            </div>
          </button>
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center justify-center space-x-3 bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-semibold backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default Report;

