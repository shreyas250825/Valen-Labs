import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import {
  Video,
  Brain,
  Target,
  Trophy,
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  History,
  ArrowRight,
  Activity,
  Zap,
  Sparkles,
  Shield,
  ChevronRight,
  FileText
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { fetchDashboardFromBackend } from "../../services/backendSupabase";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../../lib/firebase";
import { useTheme } from "../../context/ThemeContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLightTheme = theme === "light";

  // State for comprehensive user data
  const [userProfile, setUserProfile] = useState<any>(null);
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [jobFitAnalyses, setJobFitAnalyses] = useState<any[]>([]);
  const [aptitudeResults, setAptitudeResults] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Prefer Supabase dashboard (works across devices / refresh)
        try {
          // Wait briefly for Firebase to restore session on page refresh.
          const authedUser =
            firebaseAuth.currentUser ??
            (await new Promise((resolve) => {
              let unsub: (() => void) | null = null;
              const timeout = setTimeout(() => {
                if (unsub) unsub();
                resolve(null);
              }, 1500);
              unsub = onAuthStateChanged(firebaseAuth, (u) => {
                clearTimeout(timeout);
                if (unsub) unsub();
                resolve(u);
              });
            }));

          if (!authedUser) {
            throw new Error("Not authenticated yet");
          }

          const payload = await fetchDashboardFromBackend();

          const userRow = payload?.user ?? null;
          if (userRow) setUserProfile(userRow);

          const sessions: any[] = Array.isArray(payload?.interview_sessions)
            ? payload.interview_sessions
            : [];
          const reports: any[] = Array.isArray(payload?.interview_reports)
            ? payload.interview_reports
            : [];

          const reportsBySession = new Map<string, any>();
          for (const r of reports) {
            if (r?.session_id && !reportsBySession.has(r.session_id)) {
              reportsBySession.set(r.session_id, r);
            }
          }

          const interviews = sessions.map((s: any) => {
            const rep = reportsBySession.get(s.id);
            return {
              session_id: s.external_session_id || s.id,
              supabase_session_id: s.id,
              role: s.job_role,
              difficulty: s.difficulty,
              created_at: s.started_at,
              started_at: s.started_at,
              overall_score: rep?.overall_score ?? null,
              type: "interview",
              date: s.started_at
                ? new Date(s.started_at).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            };
          });

          const jobFitRow = payload?.job_fit_result ? { ...payload.job_fit_result } : null;
          const jobFitWithType = jobFitRow
            ? [
                {
                  ...jobFitRow,
                  type: "job-fit",
                  date: jobFitRow.updated_at
                    ? new Date(jobFitRow.updated_at).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                },
              ]
            : [];

          const aptitudeRow = payload?.aptitude_result ? { ...payload.aptitude_result } : null;
          const aptitudeWithType = aptitudeRow
            ? [
                {
                  ...aptitudeRow,
                  type: "aptitude",
                  date: aptitudeRow.updated_at
                    ? new Date(aptitudeRow.updated_at).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                },
              ]
            : [];

          const combined = [...interviews, ...jobFitWithType, ...aptitudeWithType].sort(
            (a, b) =>
              new Date(b.date || b.created_at || 0).getTime() -
              new Date(a.date || a.created_at || 0).getTime()
          );

          setInterviewHistory(interviews);
          setJobFitAnalyses(jobFitWithType);
          setAptitudeResults(aptitudeWithType);
          setAllActivities(combined);
          return;
        } catch {
          // fall back to local storage + in-memory report list
        }

        // Load user profile from localStorage
        const profile = localStorage.getItem("interviewProfile");
        if (profile) {
          try {
            setUserProfile(JSON.parse(profile));
          } catch {
            // ignore parse error
          }
        }

        // Load local storage data
        let localHistory: any[] = [];
        let localJobFit: any[] = [];
        let localAptitude: any[] = [];

        try {
          localHistory = JSON.parse(localStorage.getItem("interviewHistory") || "[]");
        } catch {
          localHistory = [];
        }

        try {
          localJobFit = JSON.parse(localStorage.getItem("jobFitAnalyses") || "[]");
        } catch {
          localJobFit = [];
        }

        try {
          localAptitude = JSON.parse(localStorage.getItem("aptitudeResults") || "[]");
        } catch {
          localAptitude = [];
        }

        // Try to fetch from API and merge
        try {
          const { interviewApi } = await import("../../services/api");
          const apiResponse = await interviewApi.listReports();
          const apiReports = apiResponse.reports || [];

          // Merge API reports with local history
          const mergedInterviews = apiReports.map((apiReport: any) => {
            const localMatch = localHistory.find(
              (h: any) => h.session_id === apiReport.session_id
            );
            return {
              ...localMatch,
              ...apiReport,
              type: "interview",
              date: apiReport.created_at
                ? new Date(apiReport.created_at).toISOString().split("T")[0]
                : localMatch?.date || new Date().toISOString().split("T")[0],
            };
          });

          // Add local-only interviews
          const apiSessionIds = new Set(apiReports.map((r: any) => r.session_id));
          const localOnly = localHistory
            .filter((h: any) => !apiSessionIds.has(h.session_id))
            .map((h) => ({ ...h, type: "interview" }));

          const allInterviews = [...mergedInterviews, ...localOnly];

          // Add type to local job fit and aptitude
          const jobFitWithType = localJobFit.map((jf) => ({
            ...jf,
            type: "job-fit",
          }));
          const aptitudeWithType = localAptitude.map((apt) => ({
            ...apt,
            type: "aptitude",
          }));

          // Combine all activities
          const combined = [
            ...allInterviews,
            ...jobFitWithType,
            ...aptitudeWithType,
          ].sort(
            (a, b) =>
              new Date(b.date || b.created_at || 0).getTime() -
              new Date(a.date || a.created_at || 0).getTime()
          );

          setInterviewHistory(allInterviews);
          setJobFitAnalyses(jobFitWithType);
          setAptitudeResults(aptitudeWithType);
          setAllActivities(combined);
        } catch {
          // API failed – use localStorage only
          const interviewsWithType = localHistory.map((h) => ({ ...h, type: "interview" }));
          const jobFitWithType = localJobFit.map((jf) => ({ ...jf, type: "job-fit" }));
          const aptitudeWithType = localAptitude.map((apt) => ({ ...apt, type: "aptitude" }));

          const combined = [...interviewsWithType, ...jobFitWithType, ...aptitudeWithType].sort(
            (a, b) =>
              new Date(b.date || b.created_at || 0).getTime() -
              new Date(a.date || a.created_at || 0).getTime()
          );

          setInterviewHistory(interviewsWithType);
          setJobFitAnalyses(jobFitWithType);
          setAptitudeResults(aptitudeWithType);
          setAllActivities(combined);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Comprehensive statistics
  const userStats = useMemo(() => {
    const totalInterviews = interviewHistory.length;
    const totalJobFits = jobFitAnalyses.length;
    const totalAptitude = aptitudeResults.length;
    const totalActivities = totalInterviews + totalJobFits + totalAptitude;

    // Calculate average scores across all activities
    const interviewScores = interviewHistory
      .map((i: any) => i.score || i.overall_score || 0)
      .filter((s: number) => s > 0);
    const jobFitScores = jobFitAnalyses
      .map((jf: any) => jf.score || jf.overall_fit_score || jf.overallFitScore || 0)
      .filter((s: number) => s > 0);
    const aptitudeScores = aptitudeResults
      .map((apt: any) => apt.score || apt.overall_score || 0)
      .filter((s: number) => s > 0);

    const allScores = [...interviewScores, ...jobFitScores, ...aptitudeScores];
    const averageScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    // Calculate improvement rate (compare recent 3 vs previous 3)
    let improvementRate = 0;
    if (allScores.length >= 6) {
      const recent = allScores.slice(-3);
      const previous = allScores.slice(-6, -3);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
      improvementRate = previousAvg > 0
        ? Math.round(((recentAvg - previousAvg) / previousAvg) * 100)
        : 0;
    }

    // Estimate hours spent
    const hoursSpent =
      interviewHistory.reduce((total: number, i: any) => {
        const duration = i.duration || "45 min";
        const minutes = parseInt(duration) || 45;
        return total + minutes / 60;
      }, 0) +
      totalJobFits * 0.5 +
      totalAptitude * 0.75;

    return {
      totalInterviews,
      totalJobFits,
      totalAptitude,
      totalActivities,
      averageScore,
      improvementRate,
      hoursSpent: Math.round(hoursSpent * 10) / 10,
    };
  }, [interviewHistory, jobFitAnalyses, aptitudeResults]);

  const latestJobFitScore = useMemo(() => {
    const latest = jobFitAnalyses?.[0];
    const s = latest?.score ?? latest?.overall_fit_score ?? latest?.overallFitScore;
    return typeof s === "number" ? s : null;
  }, [jobFitAnalyses]);

  const latestAptitudeScore = useMemo(() => {
    const latest = aptitudeResults?.[0];
    const s = latest?.score ?? latest?.overall_score;
    return typeof s === "number" ? s : null;
  }, [aptitudeResults]);

  // Prepare chart data for performance trend (last 10 activities with scores)
  const chartData = useMemo(() => {
    const activitiesWithScores = allActivities
      .filter((a) => a.score || a.overall_score)
      .slice(0, 10)
      .map((a, index) => ({
        name: `S${index + 1}`,
        score: a.score || a.overall_score || 0,
        fullDate: a.date || a.created_at || "",
      }))
      .reverse();
    return activitiesWithScores;
  }, [allActivities]);

  // Additional chart for activity distribution
  const distributionData = useMemo(() => {
    return [
      { name: "Interviews", value: userStats.totalInterviews },
      { name: "Job Fits", value: userStats.totalJobFits },
      { name: "Aptitude", value: userStats.totalAptitude },
    ];
  }, [userStats]);

  // Recent activities formatted for display
  const recentActivities = useMemo(() => {
    return allActivities.slice(0, 5).map((activity: any) => {
      const base = {
        id: activity.session_id || activity.id || activity.firebase_uid || `act_${Math.random()}`,
        date: activity.date || activity.created_at || "N/A",
        score: activity.score || activity.overall_score || "—",
      };
      if (activity.type === "interview") {
        return {
          ...base,
          type: "Interview",
          subtype: activity.interview_type || "Technical",
          icon: "🎤",
          color: "text-blue-500",
        };
      } else if (activity.type === "job-fit") {
        return {
          ...base,
          type: "Job Fit",
          subtype: activity.job_role || activity.role || "General",
          icon: "🎯",
          color: "text-emerald-500",
        };
      } else if (activity.type === "aptitude") {
        return {
          ...base,
          type: "Aptitude",
          subtype: "Assessment",
          icon: "🧠",
          color: "text-purple-500",
        };
      }
      return {
        ...base,
        type: "Activity",
        subtype: "",
        icon: "📋",
        color: "text-slate-400",
      };
    });
  }, [allActivities]);

  const userName = userProfile?.name || userProfile?.estimated_role || "User";

  // Handlers
  const handleStartInterview = (type?: string) => {
    if (type) {
      const profile = userProfile || {};
      profile.interview_type = type.toLowerCase();
      localStorage.setItem("interviewProfile", JSON.stringify(profile));
    }
    navigate("/setup");
  };

  const handleViewReport = (id: string, type: string) => {
    if (type.includes("Interview")) navigate(`/report?sessionId=${id}`);
    else if (type.includes("Job Fit")) navigate(`/job-fit?analysisId=${id}`);
    else if (type.includes("Aptitude")) navigate(`/aptitude?resultId=${id}`);
    else navigate("/reports");
  };

  if (loading) {
    return (
      <Layout>
        <div className={`min-h-[calc(100vh-88px)] flex items-center justify-center ${isLightTheme ? "bg-slate-50 text-slate-900" : "bg-black text-white"}`}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={isLightTheme ? "text-slate-600" : "text-slate-400"}>Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-0 -mt-5 px-4 md:px-6 pt-0 pb-12 md:pt-0 md:pb-16 overflow-x-hidden ${isLightTheme ? "bg-slate-50 text-slate-900" : "bg-black text-white"}`}>
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium uppercase tracking-wider mb-4">
            Valen AI Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">{userName}</span>
          </h1>
          <p className={`max-w-2xl text-lg ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
            Monitor your interview readiness, track performance trends, and get AI‑powered recommendations to accelerate your career growth.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={() => navigate("/setup")}
              className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-opacity-90 transition flex items-center gap-2 shadow-lg shadow-white/10"
            >
              <Video size={18} />
              Start New Interview
            </button>
            <button
              onClick={() => navigate("/reports")}
              className={`px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 ${
                isLightTheme
                  ? "bg-white border border-slate-200 text-slate-800 hover:bg-slate-100"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <BarChart3 size={18} />
              View All Reports
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <StatCard
            label="Interviews"
            value={userStats.totalInterviews}
            icon={Video}
            change={userStats.totalInterviews > 0 ? "+2" : undefined}
            description="Total sessions"
            isLightTheme={isLightTheme}
          />
          <StatCard
            label="Job Fits"
            value={userStats.totalJobFits}
            icon={Target}
            change={userStats.totalJobFits > 0 ? "+1" : undefined}
            description={latestJobFitScore != null ? `Latest score: ${latestJobFitScore}%` : "Role analyses"}
            isLightTheme={isLightTheme}
          />
          <StatCard
            label="Aptitude Tests"
            value={userStats.totalAptitude}
            icon={Brain}
            change={userStats.totalAptitude > 0 ? "+3" : undefined}
            description={latestAptitudeScore != null ? `Latest score: ${latestAptitudeScore}%` : "Assessments"}
            isLightTheme={isLightTheme}
          />
          <StatCard
            label="Avg. Score"
            value={`${userStats.averageScore}%`}
            icon={Trophy}
            change={
              userStats.improvementRate !== 0
                ? `${userStats.improvementRate > 0 ? "+" : ""}${userStats.improvementRate}%`
                : undefined
            }
            description="Overall performance"
            isLightTheme={isLightTheme}
          />
        </div>

        {/* Charts Section */}
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-purple-400" size={24} />
            Performance Analytics
          </h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Line Chart - Score Trend */}
            <div className={`lg:col-span-2 rounded-2xl p-6 ${isLightTheme ? "bg-white border border-slate-200" : "bg-white/5 border border-white/10"}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Score Trend (Last 10 Sessions)</h3>
                <div className={`text-xs ${isLightTheme ? "text-slate-500" : "text-slate-500"}`}>Higher is better</div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#a78bfa"
                      strokeWidth={3}
                      dot={{ fill: "#a78bfa", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart - Activity Distribution */}
            <div className={`rounded-2xl p-6 ${isLightTheme ? "bg-white border border-slate-200" : "bg-white/5 border border-white/10"}`}>
              <h3 className="font-medium mb-4">Activity Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="text-purple-400" size={24} />
            AI-Powered Insights
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InsightCard
              title="Performance Trend"
              value={
                userStats.improvementRate > 0
                  ? `+${userStats.improvementRate}%`
                  : userStats.improvementRate < 0
                  ? `${userStats.improvementRate}%`
                  : "Stable"
              }
              desc={
                userStats.improvementRate > 0
                  ? "Your scores are consistently improving. Keep up the momentum!"
                  : userStats.improvementRate < 0
                  ? "Slight dip detected. Focus on weak areas."
                  : "No significant change. Try new challenges."
              }
              icon={TrendingUp}
              color={userStats.improvementRate > 0 ? "text-emerald-400" : "text-amber-400"}
              isLightTheme={isLightTheme}
            />
            <InsightCard
              title="Focus Area"
              value="Technical Depth"
              desc="Your answers lack depth in system design. Practice with real-world scenarios."
              icon={Target}
              color="text-blue-400"
              isLightTheme={isLightTheme}
            />
            <InsightCard
              title="Streak"
              value={`${Math.min(userStats.totalActivities, 7)} days`}
              desc="You're on a roll! Consistency builds mastery."
              icon={Zap}
              color="text-orange-400"
              isLightTheme={isLightTheme}
            />
            <InsightCard
              title="Readiness Score"
              value={`${Math.min(userStats.averageScore + 10, 100)}%`}
              desc="Estimated interview readiness based on your performance."
              icon={Shield}
              color="text-purple-400"
              isLightTheme={isLightTheme}
            />
          </div>
        </div>

        {/* Action Center */}
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Zap className="text-purple-400" size={24} />
            Start a Session
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <ActionCard
              name="Technical"
              icon={Brain}
              onClick={() => handleStartInterview("technical")}
              description="Algorithms & System Design"
              isLightTheme={isLightTheme}
            />
            <ActionCard
              name="Behavioral"
              icon={Users}
              onClick={() => handleStartInterview("behavioral")}
              description="Leadership & Culture Fit"
              isLightTheme={isLightTheme}
            />
            <ActionCard
              name="Aptitude"
              icon={Target}
              onClick={() => navigate("/aptitude")}
              description="Logical & Quantitative"
              isLightTheme={isLightTheme}
            />
            <ActionCard
              name="Job Fit"
              icon={BarChart3}
              onClick={() => navigate("/job-fit")}
              description="Role Compatibility"
              isLightTheme={isLightTheme}
            />
            <ActionCard
              name="Resume"
              icon={FileText}
              onClick={() => navigate("/dashboard/resume-builder")}
              description="Structured → LaTeX → PDF"
              isLightTheme={isLightTheme}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <History className="text-purple-400" size={24} />
              Recent Activity
            </h2>
            <button
              onClick={() => navigate("/reports")}
              className={`text-sm flex items-center gap-1 transition ${isLightTheme ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"}`}
            >
              View all <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => handleViewReport(activity.id, activity.type)}
                  className={`w-full p-5 rounded-xl transition-all text-left group ${
                    isLightTheme
                      ? "bg-white border border-slate-200 hover:border-purple-400/50"
                      : "bg-white/5 border border-white/10 hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{activity.icon}</span>
                      <div>
                        <p className={`font-medium transition ${isLightTheme ? "text-slate-900 group-hover:text-purple-600" : "text-white group-hover:text-purple-400"}`}>
                          {activity.type}
                        </p>
                        <p className="text-sm text-slate-500">{activity.subtype}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-xl font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>{activity.score}</p>
                        <p className="text-xs text-slate-500">Score</p>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <Calendar size={14} /> {activity.date}
                        </p>
                      </div>
                      <ArrowRight
                        size={20}
                        className="text-slate-600 opacity-0 group-hover:opacity-100 transition"
                      />
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className={`p-12 rounded-xl text-center ${isLightTheme ? "bg-white border border-slate-200" : "bg-white/5 border border-white/10"}`}>
                <History size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400 mb-2">No activities yet</p>
                <p className="text-sm text-slate-500">
                  Start your first interview or assessment to see your progress here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Extra spacing */}
        <div className="h-20" />
      </div>
    </Layout>
  );
};

// ========== Reusable Components ==========

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  description?: string;
  isLightTheme?: boolean;
}

const StatCard = ({ label, value, icon: Icon, change, description, isLightTheme = false }: StatCardProps) => (
  <div className={`p-6 rounded-2xl transition group ${
    isLightTheme
      ? "bg-white border border-slate-200 hover:border-purple-300"
      : "bg-white/5 border border-white/10 hover:border-purple-500/30"
  }`}>
    <div className="flex items-start justify-between mb-4">
      <Icon size={24} className="text-purple-400 group-hover:scale-110 transition" />
      {change && (
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            change.startsWith("+")
              ? "bg-emerald-500/20 text-emerald-400"
              : change.startsWith("-")
              ? "bg-red-500/20 text-red-400"
              : "bg-slate-500/20 text-slate-400"
          }`}
        >
          {change}
        </span>
      )}
    </div>
    <p className={`text-2xl font-bold mb-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>{value}</p>
    <p className={`text-sm font-medium ${isLightTheme ? "text-slate-700" : "text-white/80"}`}>{label}</p>
    {description && <p className="text-xs text-slate-500 mt-2">{description}</p>}
  </div>
);

interface InsightCardProps {
  title: string;
  value: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  isLightTheme?: boolean;
}

const InsightCard = ({ title, value, desc, icon: Icon, color, isLightTheme = false }: InsightCardProps) => (
  <div className={`p-6 rounded-2xl transition ${
    isLightTheme
      ? "bg-white border border-slate-200 hover:border-purple-300"
      : "bg-white/5 border border-white/10 hover:border-purple-500/30"
  }`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
        <Icon size={20} />
      </div>
      <h3 className={`font-medium ${isLightTheme ? "text-slate-900" : "text-white"}`}>{title}</h3>
    </div>
    <p className={`text-2xl font-bold mb-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>{value}</p>
    <p className={`text-sm leading-relaxed ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>{desc}</p>
  </div>
);

interface ActionCardProps {
  name: string;
  icon: React.ElementType;
  onClick: () => void;
  description: string;
  isLightTheme?: boolean;
}

const ActionCard = ({ name, icon: Icon, onClick, description, isLightTheme = false }: ActionCardProps) => (
  <button
    onClick={onClick}
    className={`p-6 rounded-2xl transition-all text-left group ${
      isLightTheme
        ? "bg-white border border-slate-200 hover:border-purple-400/50 hover:bg-slate-50"
        : "bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/10"
    }`}
  >
    <Icon size={24} className="mb-3 text-purple-400 group-hover:scale-110 transition" />
    <p className={`font-semibold mb-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>{name}</p>
    <p className="text-xs text-slate-500">{description}</p>
  </button>
);

export default Dashboard;