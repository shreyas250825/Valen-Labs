// src/components/feedback/ImprovementPlan.tsx
import React from 'react';
import { Target, Calendar, CheckCircle, Clock } from 'lucide-react';

interface ImprovementPlanProps {
  suggestions: string[];
}

const ImprovementPlan: React.FC<ImprovementPlanProps> = ({ suggestions }) => {
  const defaultSuggestions = [
    "Practice explaining technical concepts in simple terms",
    "Work on providing specific examples from your experience",
    "Structure answers with clear beginning, middle, and end",
    "Reduce filler words and speak more fluently",
    "Record yourself answering questions to identify areas for improvement"
  ];

  const improvementSuggestions = suggestions && suggestions.length > 0 ? suggestions : defaultSuggestions;

  const weeklyPlan = [
    {
      week: 1,
      focus: "Technical Fundamentals",
      tasks: [
        "Review core concepts in your field",
        "Practice explaining 3 technical concepts daily",
        "Complete 2 technical mock interviews"
      ]
    },
    {
      week: 2,
      focus: "Communication Skills",
      tasks: [
        "Record and analyze your speech patterns",
        "Practice answering common behavioral questions",
        "Focus on reducing filler words"
      ]
    },
    {
      week: 3,
      focus: "Confidence Building",
      tasks: [
        "Practice maintaining eye contact",
        "Work on speaking pace and tone",
        "Complete 3 full mock interviews"
      ]
    },
    {
      week: 4,
      focus: "Integration & Refinement",
      tasks: [
        "Combine all skills in practice interviews",
        "Get feedback from peers or mentors",
        "Final preparation and mindset"
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Improvement Plan
      </h3>

      {/* Priority Suggestions */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <span>Priority Areas for Improvement</span>
        </h4>
        <div className="space-y-3">
          {improvementSuggestions.slice(0, 5).map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4-Week Plan */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>4-Week Practice Plan</span>
        </h4>
        <div className="space-y-4">
          {weeklyPlan.map((week) => (
            <div key={week.week} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-900">
                  Week {week.week}: {week.focus}
                </h5>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>~5 hours/week</span>
                </div>
              </div>
              <ul className="space-y-2">
                {week.tasks.map((task, taskIndex) => (
                  <li key={taskIndex} className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
        <h4 className="font-semibold mb-2">Ready to Improve?</h4>
        <p className="text-sm opacity-90 mb-3">
          Start your next practice interview to apply these improvements.
        </p>
        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
          Start New Practice Interview
        </button>
      </div>
    </div>
  );
};

export default ImprovementPlan;