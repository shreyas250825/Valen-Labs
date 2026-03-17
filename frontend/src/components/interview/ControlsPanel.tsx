// src/components/interview/ControlsPanel.tsx
import React from 'react';
import { Mic, Square, SkipForward, CheckCircle } from 'lucide-react';

interface ControlsPanelProps {
  stage: string;
  onStartAnswering: () => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  hasAnswer: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  stage,
  onStartAnswering,
  onSubmitAnswer,
  onNextQuestion,
  hasAnswer
}) => {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 mt-6">
      <div className="flex justify-center space-x-4">
        {/* Start Answering Button */}
        {stage === 'question' && (
          <button
            onClick={onStartAnswering}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Mic className="w-5 h-5" />
            <span>Start Answering</span>
          </button>
        )}

        {/* Stop Answering & Submit Button */}
        {stage === 'answering' && (
          <div className="flex space-x-4">
            <button
              onClick={onSubmitAnswer}
              disabled={!hasAnswer}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                hasAnswer
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Submit Answer</span>
            </button>
            
            <button
              onClick={onStartAnswering}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Square className="w-5 h-5" />
              <span>Restart Answer</span>
            </button>
          </div>
        )}

        {/* Analysis in Progress */}
        {stage === 'analysis' && (
          <div className="text-center">
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-semibold">Analyzing your response...</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              This may take a few seconds
            </p>
          </div>
        )}

        {/* Next Question Button */}
        {stage === 'analysis' && (
          <button
            onClick={onNextQuestion}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <SkipForward className="w-5 h-5" />
            <span>Next Question</span>
          </button>
        )}
      </div>

      {/* Status Message */}
      <div className="text-center mt-4 text-sm text-gray-400">
        {stage === 'question' && 'Click "Start Answering" when you are ready to respond'}
        {stage === 'answering' && 'Speak clearly into your microphone or type your answer below'}
        {stage === 'analysis' && 'Your answer is being evaluated by our AI system'}
      </div>
    </div>
  );
};

export default ControlsPanel;