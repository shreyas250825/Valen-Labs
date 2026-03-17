import React from 'react';
import { Sparkles, Zap, Brain } from 'lucide-react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; text?: string }> = ({ size = 'lg', text = 'Loading...' }) => {
  const sizes = {
    sm: { container: 'w-16 h-16', icon: 'w-8 h-8' },
    md: { container: 'w-24 h-24', icon: 'w-12 h-12' },
    lg: { container: 'w-40 h-40', icon: 'w-20 h-20' },
    xl: { container: 'w-56 h-56', icon: 'w-28 h-28' }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] relative">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Spinner Container */}
      <div className="relative">
        {/* Outer Rotating Ring */}
        <div className={`${sizes[size].container} relative animate-spin`}>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-sky-500"></div>
        </div>

        {/* Middle Rotating Ring - Opposite Direction */}
        <div className={`${sizes[size].container} absolute inset-0 animate-spin-reverse`}>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-sky-500 border-l-purple-400"></div>
        </div>

        {/* Inner Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-4 bg-gradient-to-r from-purple-500/20 to-sky-500/20 rounded-full blur-xl animate-pulse"></div>
        </div>

        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-sky-500 rounded-2xl blur-lg opacity-75 shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div>
            <div className="relative bg-gradient-to-br from-purple-600 to-sky-600 p-3 rounded-2xl animate-pulse">
              <Brain className={`${sizes[size].icon} text-white`} />
            </div>
          </div>
        </div>

        {/* Orbiting Particles */}
        <div className={`${sizes[size].container} absolute inset-0 animate-spin-slow`}>
          <Sparkles className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
        </div>
        <div className={`${sizes[size].container} absolute inset-0 animate-spin-slow-reverse`}>
          <Zap className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 text-yellow-400" />
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <div className="mt-12 text-center relative z-10 px-4">
          <p className="text-2xl md:text-4xl font-black tracking-tighter uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-6">
            {text}
          </p>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}


    </div>
  );
};

export default LoadingSpinner;

