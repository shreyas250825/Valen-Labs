import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import { FileText, Calendar, Clock, Target, Search, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { fetchReportsFromBackend } from '../../services/backendSupabase';
import { useTheme } from '../../context/ThemeContext';

interface Report {
  session_id: string;
  role: string;
  interview_type: string;
  created_at: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  questions_count: number;
}

const ReportList: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLightTheme = theme === "light";
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetchReportsFromBackend();
        setIsLoading(false);
        setReports(response.reports || []);
      } catch (err: any) {
        console.error('Failed to load reports:', err);
        setError(err.message || 'Failed to load reports');
        setIsLoading(false);
        // Fallback to localStorage if API fails
        const history = localStorage.getItem('interviewHistory');
        if (history) {
          try {
            const parsed = JSON.parse(history);
            setReports(parsed.map((r: any) => ({
              session_id: r.session_id || r.id,
              role: r.role || 'Software Engineer',
              interview_type: r.interview_type || r.type || 'mixed',
              created_at: r.created_at || r.date || new Date().toISOString(),
              overall_score: r.overall_score || r.score || 0,
              technical_score: r.technical_score || 0,
              communication_score: r.communication_score || 0,
              confidence_score: r.confidence_score || 0,
              questions_count: r.questions_count || 7,
            })));
          } catch (e) {
            console.error('Failed to parse localStorage history:', e);
          }
        }
      }
    };

    fetchReports();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return '';
    }
  };

  const formatInterviewType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-500/20 border-green-500/50';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const filteredReports = reports.filter(report =>
    report.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.interview_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.session_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner size="xl" text="Loading your interview reports..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-screen pb-20 px-6 -mt-20 ${isLightTheme ? "bg-slate-50 text-slate-900" : "bg-[#020617] text-white"}`}>
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase mb-3">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Interview Reports
              </span>
            </h1>
            <p className={`text-xl font-medium ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              Review your past interview performances and track your progress
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className={`relative backdrop-blur-xl rounded-2xl p-4 ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/40 border border-white/10"}`}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by role, interview type, or session ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all ${
                    isLightTheme
                      ? "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400"
                      : "bg-slate-900/50 border border-white/10 text-white placeholder-gray-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-6 bg-red-500/20 border border-red-500/50 rounded-2xl">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Reports Grid */}
          {filteredReports.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredReports.map((report) => (
                  <button
                    key={report.session_id}
                    onClick={() => navigate(`/report?sessionId=${report.session_id}`)}
                    className="relative group text-left"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className={`relative backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 transform group-hover:scale-105 ${
                      isLightTheme
                        ? "bg-white border border-slate-200 hover:border-sky-400/50"
                        : "bg-slate-800/40 border border-white/10 hover:border-sky-400/50"
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${isLightTheme ? "text-slate-900" : "text-white"}`}>{report.role}</h3>
                            <p className="text-sm text-gray-400">{formatInterviewType(report.interview_type)}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBgColor(report.overall_score)} ${getScoreColor(report.overall_score)} border`}>
                          {Math.round(report.overall_score)}%
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Technical</span>
                          <span className={`font-semibold ${isLightTheme ? "text-slate-900" : "text-white"}`}>{Math.round(report.technical_score)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Communication</span>
                          <span className={`font-semibold ${isLightTheme ? "text-slate-900" : "text-white"}`}>{Math.round(report.communication_score)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Confidence</span>
                          <span className={`font-semibold ${isLightTheme ? "text-slate-900" : "text-white"}`}>{Math.round(report.confidence_score)}%</span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className={`flex items-center justify-between text-xs text-gray-400 pt-4 ${isLightTheme ? "border-t border-slate-200" : "border-t border-white/10"}`}>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(report.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(report.created_at)}</span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        {report.questions_count} questions answered
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Stats */}
              {reports.length > 0 && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
                  <div className={`relative backdrop-blur-xl rounded-2xl p-6 ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/40 border border-white/10"}`}>
                    <h3 className="text-xl font-bold mb-6 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-sky-300" />
                      Progress Overview
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl">
                        <div className="text-3xl font-bold text-sky-300 mb-1">{reports.length}</div>
                        <div className="text-sm text-gray-400">Total Interviews</div>
                      </div>
                      <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <div className="text-3xl font-bold text-green-300 mb-1">
                          {Math.round(reports.reduce((acc, r) => acc + r.overall_score, 0) / reports.length)}%
                        </div>
                        <div className="text-sm text-gray-400">Average Score</div>
                      </div>
                      <div className="text-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <div className="text-3xl font-bold text-purple-300 mb-1">
                          {Math.max(...reports.map(r => r.overall_score))}%
                        </div>
                        <div className="text-sm text-gray-400">Best Score</div>
                      </div>
                      <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                        <div className="text-3xl font-bold text-orange-300 mb-1">
                          {new Set(reports.map(r => r.role)).size}
                        </div>
                        <div className="text-sm text-gray-400">Roles Practiced</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-cyan-500/20 rounded-2xl blur-2xl opacity-50"></div>
              <div className={`relative backdrop-blur-xl rounded-2xl p-12 text-center ${isLightTheme ? "bg-white border border-slate-200" : "bg-slate-800/40 border border-white/10"}`}>
                <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className={`text-2xl font-bold mb-3 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                  No reports found
                </h3>
                <p className="text-gray-400 mb-8 text-lg">
                  {searchTerm 
                    ? 'No reports match your search criteria'
                    : "You haven't completed any interviews yet"
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/setup')}
                    className="relative group/btn"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-xl blur opacity-75 group-hover/btn:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform group-hover/btn:scale-105 transition-all duration-300">
                      <Target className="w-5 h-5" />
                      <span>Start Your First Interview</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReportList;
