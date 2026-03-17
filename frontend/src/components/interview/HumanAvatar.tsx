// src/components/interview/HumanAvatar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface HumanAvatarProps {
  isSpeaking: boolean;
  currentQuestion: string | null;
}

const HumanAvatar: React.FC<HumanAvatarProps> = ({ isSpeaking, currentQuestion }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Handle video playback based on speaking state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isSpeaking) {
      // When system starts speaking, play the video from start
      video.currentTime = 0;
      video.play().catch(e => console.error('Error playing video:', e));
    } else {
      // When system stops speaking, pause the video
      video.pause();
      video.currentTime = 0;
    }

    return () => {
      // Cleanup
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, [isSpeaking]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Avatar Container */}
      <div className="relative">
        {/* Glow Effect */}
        {isSpeaking && (
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full blur-2xl opacity-50 animate-pulse" />
        )}

        {/* Video Avatar */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden bg-slate-800">
        <video
          ref={videoRef}
          src="/assets/Avatar Video/Female Interviewer.mp4"
          muted
          loop={false}
          className="w-full h-full object-cover"
          onCanPlay={() => setIsVideoReady(true)}
          onEnded={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
            }
          }}
        />
        {!isVideoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-sky-400 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute -top-2 -right-2 flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-green-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm border transition-all duration-300 ${
            isSpeaking
              ? 'bg-green-500/20 border-green-400 text-green-300'
              : 'bg-sky-500/20 border-sky-400 text-sky-300'
          }`}
        >
          {isSpeaking ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isSpeaking ? 'Speaking...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Question Text Overlay */}
      {currentQuestion && (
        <div className="absolute -bottom-20 left-0 right-0">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-h-32 overflow-y-auto">
            <p className="text-sm text-gray-300 text-center leading-relaxed">
              {currentQuestion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HumanAvatar;

