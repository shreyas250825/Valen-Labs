// src/components/interview/VideoRecorder.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Circle, Mic, Square } from 'lucide-react';
import { useWebcam } from '../../hooks/useWebcam';
import { useSpeechRecognition } from '../../hooks/useSpeech';
import { useFaceTracking } from '../../hooks/useFaceTracking';

interface VideoRecorderProps {
  onAnswerComplete: (payload: { transcript: string; metrics: any }) => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onAnswerComplete }) => {
  const { videoRef, startWebcam, stopWebcam } = useWebcam();
  const speech = useSpeechRecognition();
  const [isRecording, setIsRecording] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const lastMetricsRef = useRef<any | null>(null);

  useFaceTracking(videoRef, (m) => {
    lastMetricsRef.current = m;
  });

  useEffect(() => {
    // Start webcam on mount
    startWebcam({ video: true, audio: true })
      .then(() => setIsActive(true))
      .catch(() => setIsActive(false));

    return () => {
      stopWebcam();
    };
  }, [startWebcam, stopWebcam]);

  const handleStart = () => {
    setTranscript('');
    if (!speech.supported) {
      // No-op: user will type answer manually.
      setIsRecording(true);
      return;
    }
    speech.start((text) => {
      setTranscript((prev) => (prev ? `${prev} ${text}` : text));
    });
    setIsRecording(true);
  };

  const handleStop = () => {
    if (speech.supported) {
      speech.stop();
    }
    setIsRecording(false);
    onAnswerComplete({
      transcript,
      metrics: lastMetricsRef.current || { eyeContact: null },
    });
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 h-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Your Video</h3>
        <div className="flex items-center space-x-2">
          {isActive ? (
            <Video className="w-5 h-5 text-green-500" />
          ) : (
            <VideoOff className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm text-gray-400">
            {isActive ? 'Camera Active' : 'Camera Off'}
          </span>
        </div>
      </div>

      {/* Video Feed */}
      <div className="relative bg-black rounded-xl overflow-hidden h-64 flex items-center justify-center">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-gray-500">
            <VideoOff className="w-16 h-16 mx-auto mb-2" />
            <p>Camera not active</p>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 text-sm font-medium">REC</span>
          </div>
        )}

        {/* Status Overlay */}
        <div className="absolute bottom-4 left-4">
          <div
            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isRecording ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
          >
            <Circle className="w-3 h-3 fill-current" />
            <span>{isRecording ? 'Recording' : 'Ready'}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        {!isRecording ? (
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Mic className="w-4 h-4" />
            <span>Start Answer</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Square className="w-4 h-4" />
            <span>Stop Answer</span>
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-2 text-center text-sm text-gray-400">
        <p>
          {isRecording
            ? 'Speaking and recording in progress...'
            : 'Use Chrome, allow camera & mic, then click Start Answer to begin.'}
        </p>
        {!speech.supported && (
          <p className="mt-1 text-xs text-yellow-300">
            Your browser does not support speech recognition. Type your answer instead.
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;