// src/components/interview/QuestionDisplay.tsx
import React from 'react';
import { HelpCircle, Clock } from 'lucide-react';

interface QuestionDisplayProps {
  question: string | null;
  stage: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, stage }) => {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 flex-1">
      <div className="flex items-center space-x-3 mb-4">
        <HelpCircle className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Current Question</h3>
      </div>

      {question ? (
        <div className="space-y-4">
          {/* Question Text */}
          <div className="bg-gray-700 rounded-xl p-6">
            <p className="text-lg text-white leading-relaxed">
              {question}
            </p>
          </div>

          {/* Stage Instructions */}
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">
                {stage === 'question' && 'Listen carefully to the question'}
                {stage === 'answering' && 'Provide your answer now'}
                {stage === 'analysis' && 'Analysis in progress...'}
              </span>
            </div>
            <p className="text-blue-200 text-sm">
              {stage === 'question' && 'The AI will speak the question. Listen carefully before answering.'}
              {stage === 'answering' && 'Speak clearly or type your answer. You can use voice recognition.'}
              {stage === 'analysis' && 'Your answer is being analyzed. Please wait...'}
            </p>
          </div>

          {/* Tips */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">💡 Tips for a great answer:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Structure your answer with clear points</li>
              <li>• Provide specific examples from your experience</li>
              <li>• Speak clearly and confidently</li>
              <li>• Maintain good eye contact with the camera</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <p>Waiting for the first question...</p>
          <p className="text-sm mt-2">The AI interviewer will ask you a question shortly</p>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;