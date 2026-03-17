// src/components/feedback/FeedbackDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import RadarChart from './RadarChart';
import BehavioralInsights from './BehavioralInsights';
import TechnicalAnalysis from './TechnicalAnalysis';
import ImprovementPlan from './ImprovementPlan';
import LoadingSpinner from '../common/LoadingSpinner';
import { ArrowLeft, Download, Share2 } from 'lucide-react';

interface ReportData {
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  question_analysis: any[];
  behavioral_insights: any;
  improvement_suggestions: string[];
}

const FeedbackDashboard: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const reportData = await apiService.getReport(sessionId);
        setReport(reportData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your interview report..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Report not found'}
          </h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const overallScore = report.overall_score;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Interview Performance Report
          </h1>
          
          <div className="flex justify-center items-end space-x-4 mb-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600">
                {Math.round(overallScore)}
              </div>
              <div className="text-gray-600">Overall Score</div>
            </div>
            
            <div className="text-left text-sm text-gray-600 space-y-1">
              <div>Technical: {Math.round(report.technical_score)}/100</div>
              <div>Communication: {Math.round(report.communication_score)}/100</div>
              <div>Confidence: {Math.round(report.confidence_score)}/100</div>
            </div>
          </div>

          {/* Performance Message */}
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
            overallScore >= 80 
              ? 'bg-green-100 text-green-800' 
              : overallScore >= 60 
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {overallScore >= 80 && '🎉 Excellent Performance!'}
            {overallScore >= 60 && overallScore < 80 && '👍 Good Performance'}
            {overallScore < 60 && '💪 Keep Practicing!'}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Radar Chart */}
          <div className="lg:col-span-2">
            <RadarChart
              technicalScore={report.technical_score}
              communicationScore={report.communication_score}
              confidenceScore={report.confidence_score}
              overallScore={report.overall_score}
            />
          </div>

          {/* Behavioral Insights */}
          <div>
            <BehavioralInsights insights={report.behavioral_insights} />
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Technical Analysis */}
          <div>
            <TechnicalAnalysis questions={report.question_analysis} />
          </div>

          {/* Improvement Plan */}
          <div>
            <ImprovementPlan suggestions={report.improvement_suggestions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDashboard;