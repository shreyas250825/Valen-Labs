// src/components/feedback/BehavioralInsights.tsx
import React from 'react';
import { Eye, MessageCircle, Zap, TrendingUp } from 'lucide-react';

interface BehavioralInsightsProps {
  insights: any;
}

const BehavioralInsights: React.FC<BehavioralInsightsProps> = ({ insights }) => {
  const defaultInsights = {
    confidence_trend: 'stable',
    communication_consistency: 'consistent',
    performance_summary: 'Good overall performance with solid fundamentals.'
  };

  const actualInsights = insights || defaultInsights;

  const metrics = [
    {
      icon: Eye,
      label: 'Eye Contact',
      value: 72,
      trend: 'stable',
      description: 'Maintained good eye contact throughout'
    },
    {
      icon: MessageCircle,
      label: 'Speech Clarity',
      value: 68,
      trend: 'improving',
      description: 'Clear articulation with minor filler words'
    },
    {
      icon: Zap,
      label: 'Engagement Level',
      value: 75,
      trend: 'high',
      description: 'Good energy and enthusiasm'
    },
    {
      icon: TrendingUp,
      label: 'Confidence Trend',
      value: 65,
      trend: 'improving',
      description: 'Gained confidence as interview progressed'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Behavioral Insights
      </h3>

      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <metric.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{metric.label}</div>
                  <div className="text-sm text-gray-600">{metric.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {metric.value}%
                </div>
                <div className={`text-xs font-medium ${
                  metric.trend === 'improving' 
                    ? 'text-green-600' 
                    : metric.trend === 'high'
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}>
                  {metric.trend.charAt(0).toUpperCase() + metric.trend.slice(1)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-2">Overall Assessment</h4>
        <p className="text-sm text-green-800">
          {actualInsights.performance_summary}
        </p>
      </div>

      {/* Tips */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2">💡 Quick Tips</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Practice maintaining consistent eye contact</li>
          <li>• Work on reducing filler words</li>
          <li>• Use hand gestures naturally to emphasize points</li>
        </ul>
      </div>
    </div>
  );
};

export default BehavioralInsights;