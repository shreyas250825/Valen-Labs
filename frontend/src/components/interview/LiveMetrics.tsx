// src/components/interview/LiveMetrics.tsx
import React from 'react';
import { Eye, Brain, Activity, MessageCircle } from 'lucide-react';

interface FaceMetrics {
  eyeContact: number;
  confidence: number;
  engagement: number;
  headMovement: number;
}

interface SpeechMetrics {
  isListening: boolean;
  transcript: string;
}

interface LiveMetricsProps {
  faceMetrics: FaceMetrics;
  speechMetrics: SpeechMetrics;
  stage: string;
}

const LiveMetrics: React.FC<LiveMetricsProps> = ({ 
  faceMetrics, 
  speechMetrics, 
  stage 
}) => {
  const metrics = [
    {
      icon: Eye,
      label: 'Eye Contact',
      value: faceMetrics.eyeContact,
      color: 'bg-blue-500'
    },
    {
      icon: Brain,
      label: 'Confidence',
      value: faceMetrics.confidence,
      color: 'bg-green-500'
    },
    {
      icon: Activity,
      label: 'Engagement',
      value: faceMetrics.engagement,
      color: 'bg-purple-500'
    },
    {
      icon: MessageCircle,
      label: 'Speech Clarity',
      value: speechMetrics.isListening ? 75 : 50,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Live Metrics</h3>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <metric.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{metric.label}</span>
              </div>
              <span className="text-sm font-semibold text-white">
                {Math.round(metric.value)}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${metric.color}`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Speech Transcript */}
      {speechMetrics.transcript && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Speech Recognition
          </h4>
          <div className="text-white text-sm max-h-20 overflow-y-auto">
            {speechMetrics.transcript}
          </div>
          {speechMetrics.isListening && (
            <div className="flex space-x-1 mt-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-1 h-4 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stage Indicator */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500 rounded-full text-sm text-white">
          <span>
            {stage === 'question' && '📝 Listening to Question'}
            {stage === 'answering' && '🎤 Answering Question'}
            {stage === 'analysis' && '📊 Analyzing Response'}
            {stage === 'not-started' && '⏳ Ready to Start'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveMetrics;