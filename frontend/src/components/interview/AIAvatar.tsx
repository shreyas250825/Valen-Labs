// src/components/interview/AIAvatar.tsx
import React from 'react';
import { Mic, Bot } from 'lucide-react';

interface AIAvatarProps {
  isSpeaking: boolean;
  currentQuestion: string | null;
}

const AIAvatar: React.FC<AIAvatarProps> = ({ isSpeaking, currentQuestion }) => {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center h-96">
      {/* Avatar Container */}
      <div className="relative mb-6">
        {/* Avatar */}
        <div className={`w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 ${
          isSpeaking ? 'scale-110 ring-4 ring-blue-400' : 'scale-100'
        }`}>
          <Bot className="w-16 h-16 text-white" />
        </div>
        
        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute -top-2 -right-2">
            <div className="flex space-x-1">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="text-center mb-4">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
          isSpeaking ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          <Mic className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isSpeaking ? 'Speaking...' : 'Ready to ask'}
          </span>
        </div>
      </div>

      {/* Question Preview */}
      {currentQuestion && (
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Current Question:</p>
          <p className="text-lg text-gray-200 line-clamp-3">
            {currentQuestion}
          </p>
        </div>
      )}

      {/* Instructions */}
      {!currentQuestion && (
        <div className="text-center text-gray-400">
          <p>Waiting for the first question...</p>
          <p className="text-sm mt-2">Make sure your microphone and camera are enabled</p>
        </div>
      )}
    </div>
  );
};

export default AIAvatar;