// src/components/feedback/TechnicalAnalysis.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

interface TechnicalAnalysisProps {
  questions: any[];
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ questions }) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const defaultQuestions = [
    {
      question: "Explain the concept of object-oriented programming.",
      answer: "Object-oriented programming is a programming paradigm based on the concept of objects...",
      scores: { technical: 85, communication: 78, confidence: 82, overall: 82 },
      feedback: "Excellent understanding of OOP concepts with clear examples."
    },
    {
      question: "What are the differences between SQL and NoSQL databases?",
      answer: "SQL databases are relational while NoSQL are non-relational...",
      scores: { technical: 72, communication: 65, confidence: 68, overall: 68 },
      feedback: "Good comparison but could include more specific use cases."
    }
  ];

  const questionData = questions && questions.length > 0 ? questions : defaultQuestions;

  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Question-by-Question Analysis
      </h3>

      <div className="space-y-4">
        {questionData.map((q, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Question Header */}
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getScoreBg(q.scores.overall)}`}>
                  <span className={`text-sm font-bold ${getScoreColor(q.scores.overall)}`}>
                    {Math.round(q.scores.overall)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Question {index + 1}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {q.question}
                  </p>
                </div>
              </div>
              {expandedQuestion === index ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Expanded Content */}
            {expandedQuestion === index && (
              <div className="p-4 space-y-4">
                {/* Question */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Question:</h5>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {q.question}
                  </p>
                </div>

                {/* Your Answer */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Your Answer:</h5>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {q.answer}
                  </p>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Technical</div>
                    <div className={`text-lg font-bold ${getScoreColor(q.scores.technical)}`}>
                      {Math.round(q.scores.technical)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Communication</div>
                    <div className={`text-lg font-bold ${getScoreColor(q.scores.communication)}`}>
                      {Math.round(q.scores.communication)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Confidence</div>
                    <div className={`text-lg font-bold ${getScoreColor(q.scores.confidence)}`}>
                      {Math.round(q.scores.confidence)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Overall</div>
                    <div className={`text-lg font-bold ${getScoreColor(q.scores.overall)}`}>
                      {Math.round(q.scores.overall)}%
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <h5 className="font-medium text-green-900">AI Feedback:</h5>
                  </div>
                  <p className="text-green-800 text-sm">
                    {q.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Technical Performance Summary</h4>
        <p className="text-sm text-blue-800">
          Your technical knowledge is solid. Focus on providing more specific examples 
          and structuring your answers with clear, concise points to improve communication scores.
        </p>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;