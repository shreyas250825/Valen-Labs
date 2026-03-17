// src/components/interview/InterviewInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, Square, Send, StopCircle } from 'lucide-react';
import { useWebcam } from '../../hooks/useWebcam';
import { useSpeechRecognition } from '../../hooks/useSpeech';
import { useFaceTracking } from '../../hooks/useFaceTracking';
import HumanAvatar from './HumanAvatar';
import LoadingSpinner from '../common/LoadingSpinner';
import { getReportSimple, startInterviewSimple, submitAnswerSimple } from '../../services/api';
import { getSupabaseSessionIdForExternalSession, logInterviewQuestionToBackend } from '../../services/backendSupabase';

const InterviewInterface: React.FC = () => {
  const navigate = useNavigate();

  // Interview state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('q1');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStage, setInterviewStage] = useState<'not-started' | 'question' | 'answering' | 'analysis'>('not-started');
  const [isLoading, setIsLoading] = useState(false);
  const [showEndTestConfirm, setShowEndTestConfirm] = useState(false);

  // Media state
  const [isMediaEnabled, setIsMediaEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastMetricsRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Webcam, speech, and face tracking hooks
  const { videoRef, startWebcam, stopWebcam, isActive: webcamActive } = useWebcam();
  const speech = useSpeechRecognition();

  useFaceTracking(videoRef, (metrics) => {
    lastMetricsRef.current = metrics;
  });

  // Text-to-speech for questions
  const speakQuestion = React.useCallback((text: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Reset speaking state
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      
      // Small delay to ensure clean state
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.85;
          utterance.pitch = 1.2;
          utterance.volume = 1.0;

          // Set a female voice if available
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            const femaleVoice = voices.find((voice) =>
              voice.name.toLowerCase().includes('zira') ||
              voice.name.toLowerCase().includes('samantha') ||
              voice.name.toLowerCase().includes('karen') ||
              voice.name.toLowerCase().includes('victoria') ||
              voice.name.toLowerCase().includes('susan') ||
              voice.name.toLowerCase().includes('hazel') ||
              voice.name.toLowerCase().includes('female')
            );
            if (femaleVoice) utterance.voice = femaleVoice;
          }

          // When speech starts
          utterance.onstart = () => {
            isSpeakingRef.current = true;
            setIsSpeaking(true);
            
            // Small delay to ensure video starts playing
            setTimeout(() => {
              if (!isSpeakingRef.current) {
                isSpeakingRef.current = true;
                setIsSpeaking(true);
              }
            }, 50);
          };

          // When speech ends
          utterance.onend = () => {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
          };

          // Handle errors
          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
          };

          // Store the utterance reference
          speechSynthesisRef.current = utterance;

          // Start speaking
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            // Small delay to ensure clean state before speaking again
            setTimeout(() => {
              window.speechSynthesis.speak(utterance);
            }, 100);
          } else {
            window.speechSynthesis.speak(utterance);
          }
        } catch (err) {
          console.error('Failed to create utterance:', err);
          isSpeakingRef.current = false;
          setIsSpeaking(false);
        }
      }, 300);
    } catch {
      // ignore
    }
  }, []);

  // Ensure video plays when stream is ready
  useEffect(() => {
    if (videoRef.current && (isMediaEnabled || webcamActive)) {
      const video = videoRef.current;
      if (video.srcObject && video.paused) {
        video.play().catch(() => {
          setTimeout(() => {
            video.play().catch(() => {});
          }, 100);
        });
      }
    }
  }, [isMediaEnabled, webcamActive, videoRef]);

  // Load voices once
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const firstArg = args[0];
      if (
        (typeof firstArg === 'string' &&
          (firstArg.includes('Speech synthesis') || firstArg.includes('SpeechSynthesisErrorEvent'))) ||
        firstArg?.constructor?.name === 'SpeechSynthesisErrorEvent' ||
        args[1]?.constructor?.name === 'SpeechSynthesisErrorEvent'
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      console.error = originalError;
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Start interview on mount
  useEffect(() => {
    const profileRaw = localStorage.getItem('interviewProfile');
    if (!profileRaw) {
      navigate('/setup');
      return;
    }

    const start = async () => {
      try {
        setIsLoading(true);
        const profile = JSON.parse(profileRaw);
        const role = profile.role || profile.estimated_role;
        const interviewType = profile.interviewType || profile.interview_type || 'mixed';
        const persona = profile.persona || 'male';

        const res = await startInterviewSimple(profile, role, interviewType, persona);
        setSessionId(res.session_id);
        const q = res.question;
        const questionText = q.text || q.question || 'Tell me about yourself';
        setCurrentQuestion(questionText);
        setCurrentQuestionId(q.id || 'q1');
        setCurrentQuestionIndex(0);
        setInterviewStage('question');

        const sessionData = {
          session_id: res.session_id,
          role: role || 'Software Engineer',
          interview_type: interviewType,
          persona,
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
        };

        const history = localStorage.getItem('interviewHistory');
        const historyArray = history ? JSON.parse(history) : [];
        const existingIndex = historyArray.findIndex((h: any) => h.session_id === res.session_id);
        if (existingIndex >= 0) {
          historyArray[existingIndex] = { ...historyArray[existingIndex], ...sessionData };
        } else {
          historyArray.unshift(sessionData);
        }
        localStorage.setItem('interviewHistory', JSON.stringify(historyArray));

        setTimeout(() => {
          speakQuestion(questionText);
        }, 1200);
      } catch (err) {
        console.error('Failed to start interview:', err);
      } finally {
        setIsLoading(false);
      }
    };

    start();

    return () => {
      try {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
        speechSynthesisRef.current = null;
      } catch {
        /* ignore */
      }
      stopWebcam();
    };
  }, [navigate, stopWebcam, speakQuestion]);

  // Toggle video + audio
  const toggleMedia = async () => {
    if (isMediaEnabled) {
      stopWebcam();
      speech.stop();
      setIsMediaEnabled(false);
      setIsRecording(false);
      setTranscript('');
    } else {
      try {
        await startWebcam({ video: true, audio: true });
        setIsMediaEnabled(true);
      } catch (err) {
        console.error('Failed to start media:', err);
        alert('Please allow camera and microphone permissions');
      }
    }
  };

  // Start recording
  const startAnswering = () => {
    if (!isMediaEnabled && !webcamActive) {
      alert('Please enable camera and microphone first');
      return;
    }

    setInterviewStage('answering');
    setTranscript('');
    setIsRecording(true);

    if (speech.supported) {
      if ('reset' in speech && typeof speech.reset === 'function') {
        speech.reset();
      } else {
        speech.stop();
      }

      setTimeout(() => {
        speech.start((text) => setTranscript(text));
      }, 200);
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!sessionId || !transcript.trim()) {
      alert('Please provide an answer before submitting');
      return;
    }

    setIsRecording(false);
    speech.stop();
    setInterviewStage('analysis');
    setIsLoading(true);

    try {
      const res = await submitAnswerSimple({
        session_id: sessionId,
        question_id: currentQuestionId,
        transcript,
        metrics: lastMetricsRef.current || { eyeContact: null },
      });

      // Non-blocking: persist Q/A + evaluation to Supabase via backend
      try {
        const supabaseSessionId = getSupabaseSessionIdForExternalSession(sessionId);
        if (supabaseSessionId && currentQuestion) {
          const evaluation = res?.evaluation ?? null;
          const scoreKeys = ["technical", "communication", "relevance"];
          const numericScores = scoreKeys
            .map((k) => Number(evaluation?.[k]))
            .filter((n) => Number.isFinite(n)) as number[];
          const score =
            numericScores.length > 0
              ? Math.round(numericScores.reduce((a, b) => a + b, 0) / numericScores.length)
              : null;
          logInterviewQuestionToBackend({
            session_id: supabaseSessionId,
            question: currentQuestion,
            user_answer: transcript,
            ai_feedback: evaluation ? JSON.stringify(evaluation) : null,
            score,
          }).catch((e) => console.error("Failed to persist interview question:", e));
        }
      } catch {
        // ignore
      }

      if (res.next_question) {
        const q = res.next_question;
        const questionText = q.text || q.question || '';
        setCurrentQuestion(questionText);
        setCurrentQuestionId(q.id || `q${currentQuestionIndex + 2}`);
        setCurrentQuestionIndex((prev) => prev + 1);
        setInterviewStage('question');
        setTranscript('');
        speech.stop();

        setTimeout(() => speakQuestion(questionText), 800);
      } else {
        try {
          const reportData = await getReportSimple(sessionId);
          const history = localStorage.getItem('interviewHistory');
          const historyArray = history ? JSON.parse(history) : [];
          const sessionIndex = historyArray.findIndex((h: any) => h.session_id === sessionId);

          if (sessionIndex >= 0 && reportData.evaluations && reportData.evaluations.length > 0) {
            const evals = reportData.evaluations;
            const tech = evals.reduce((sum: number, e: any) => sum + (e.technical || 0), 0) / evals.length;
            const comm = evals.reduce((sum: number, e: any) => sum + (e.communication || 0), 0) / evals.length;
            const conf = evals.reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / evals.length;
            const overall = (tech + comm + conf) / 3;

            historyArray[sessionIndex] = {
              ...historyArray[sessionIndex],
              overall_score: overall,
              technical_score: tech,
              communication_score: comm,
              confidence_score: conf,
              questions_count: evals.length,
              completed_at: new Date().toISOString(),
            };
            localStorage.setItem('interviewHistory', JSON.stringify(historyArray));
          }
        } catch (err) {
          console.error('Failed to fetch report:', err);
        }

        navigate(`/report?sessionId=${sessionId}`);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setInterviewStage('question');
    } finally {
      setIsLoading(false);
    }
  };

  // End test early - finish interview with current answers
  const endTestEarly = async () => {
    if (!sessionId) return;

    setShowEndTestConfirm(false);
    setIsRecording(false);
    speech.stop();
    setInterviewStage('analysis');
    setIsLoading(true);

    try {
      // If user is currently answering, submit the current answer first
      if (interviewStage === 'answering' && transcript.trim()) {
        await submitAnswerSimple({
          session_id: sessionId,
          question_id: currentQuestionId,
          transcript,
          metrics: lastMetricsRef.current || { eyeContact: null },
        });
      }

      // Get the report with current answers
      try {
        const reportData = await getReportSimple(sessionId);
        const history = localStorage.getItem('interviewHistory');
        const historyArray = history ? JSON.parse(history) : [];
        const sessionIndex = historyArray.findIndex((h: any) => h.session_id === sessionId);

        if (sessionIndex >= 0 && reportData.evaluations && reportData.evaluations.length > 0) {
          const evals = reportData.evaluations;
          const tech = evals.reduce((sum: number, e: any) => sum + (e.technical || 0), 0) / evals.length;
          const comm = evals.reduce((sum: number, e: any) => sum + (e.communication || 0), 0) / evals.length;
          const conf = evals.reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / evals.length;
          const overall = (tech + comm + conf) / 3;

          historyArray[sessionIndex] = {
            ...historyArray[sessionIndex],
            overall_score: overall,
            technical_score: tech,
            communication_score: comm,
            confidence_score: conf,
            questions_count: evals.length,
            completed_at: new Date().toISOString(),
            ended_early: true, // Mark as ended early
          };
          localStorage.setItem('interviewHistory', JSON.stringify(historyArray));
        }
      } catch (err) {
        console.error('Failed to fetch report:', err);
      }

      // Navigate to report
      navigate(`/report?sessionId=${sessionId}`);
    } catch (err) {
      console.error('Failed to end test early:', err);
      setInterviewStage('question');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && interviewStage === 'not-started') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900">
        <LoadingSpinner size="lg" text="Starting your interview..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* End Test Confirmation Dialog */}
      {showEndTestConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-6">
            <div className="mb-4 text-center">
              <StopCircle className="mx-auto mb-3 h-12 w-12 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">End Interview Early?</h3>
              <p className="mt-2 text-sm text-gray-400">
                You've answered {currentQuestionIndex + (interviewStage === 'answering' && transcript.trim() ? 1 : 0)} question(s) so far. 
                Your evaluation will be based on the questions you've completed.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndTestConfirm(false)}
                className="flex-1 rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-slate-800/70 transition"
              >
                Continue Interview
              </button>
              <button
                onClick={endTestEarly}
                className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-red-600 transition"
              >
                End & Get Results
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8">
        {/* Header with End Test Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Interview Session</h1>
            <p className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} • {interviewStage === 'question' ? 'Listening' : interviewStage === 'answering' ? 'Recording' : 'Processing'}
            </p>
          </div>
          {(interviewStage === 'question' || interviewStage === 'answering') && currentQuestionIndex > 0 && (
            <button
              onClick={() => setShowEndTestConfirm(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-400/40 bg-orange-500/15 px-4 py-2 text-sm font-medium text-orange-200 hover:bg-orange-500/25 transition"
            >
              <StopCircle className="h-4 w-4" />
              <span>End Test</span>
            </button>
          )}
        </div>

        {/* Main 2-column layout – equal ratio, full height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 items-stretch">
          {/* LEFT: Interviewer avatar + question */}
          <div className="flex h-full flex-col rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-6 md:p-8">
            {/* Top: avatar centered */}
            <div className="flex-1 flex items-center justify-center">
              <HumanAvatar
                isSpeaking={isSpeaking || interviewStage === 'question'}
                currentQuestion={null} // Remove question text from avatar to prevent overlap
              />
            </div>

            {/* Bottom: status + question bar (no absolute, no overlap) */}
            <div className="mt-6 space-y-3">
              {/* Status line */}
              <div className="text-center text-xs md:text-sm text-gray-400">
                {interviewStage === 'question' && '🎧 Listen to the question, then get ready to answer.'}
                {interviewStage === 'answering' && '🎤 Your turn — answer naturally and confidently.'}
                {interviewStage === 'analysis' && '⏳ Analyzing your response…'}
              </div>

              {/* Question pill */}
              <div className="rounded-2xl bg-slate-800/80 border border-white/10 px-4 py-3 md:px-6 md:py-4">
                <p className="text-xs uppercase tracking-wide text-sky-300 mb-1">Current Question</p>
                <p className="text-sm md:text-base text-gray-100">
                  {currentQuestion || 'Tell me about yourself and your background.'}
                </p>
              </div>

              {/* Play question button */}
              {interviewStage === 'question' && currentQuestion && (
                <div className="flex justify-center">
                  <button
                    onClick={() => speakQuestion(currentQuestion)}
                    className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-500/15 px-4 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/25 transition"
                  >
                    🔊 Play Question Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: User video + transcript + camera button */}
          <div className="flex h-full flex-col rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-6 md:p-7">
            {/* Header row */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg md:text-xl font-semibold text-white">Your Video</h3>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                {isMediaEnabled || webcamActive ? (
                  <Video className="h-4 w-4 text-emerald-400" />
                ) : (
                  <VideoOff className="h-4 w-4 text-red-400" />
                )}
                <span className={isMediaEnabled || webcamActive ? 'text-emerald-300' : 'text-red-300'}>
                  {isMediaEnabled || webcamActive ? 'Camera On' : 'Camera Off'}
                </span>
              </div>
            </div>

            {/* Video box (kept 16:9, equal card height due to flex) */}
            <div className="relative mb-4 flex-1 rounded-2xl bg-black overflow-hidden flex items-center justify-center">
              {isMediaEnabled || webcamActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  controls={false}
                  className="h-full w-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.play().catch(() => {
                        setTimeout(() => video.play().catch(() => {}), 100);
                      });
                    }
                  }}
                  onCanPlay={(e) => {
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.play().catch(() => {});
                    }
                  }}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <VideoOff className="mx-auto mb-4 h-14 w-14" />
                  <p className="text-sm">Enable camera to start your interview.</p>
                </div>
              )}

              {/* Recording badge */}
              {isRecording && (
                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-red-500/95 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  RECORDING
                </div>
              )}
            </div>

            {/* Transcript box */}
            {transcript && (
              <div className="mb-3 max-h-28 overflow-y-auto rounded-2xl bg-slate-800/70 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sky-300 mb-1">
                  Live Transcript
                </p>
                <p className="text-sm text-gray-100 whitespace-pre-wrap">{transcript}</p>
              </div>
            )}

            {/* Camera toggle button */}
            <button
              onClick={toggleMedia}
              className={`mt-1 w-full rounded-2xl px-6 py-3 text-sm md:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                isMediaEnabled || webcamActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white'
              }`}
            >
              {isMediaEnabled || webcamActive ? (
                <>
                  <VideoOff className="h-4 w-4" />
                  <span>Turn Off Camera &amp; Audio</span>
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  <span>Turn On Camera &amp; Audio</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom controls row – full width, no overlap */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl px-4 py-4 md:px-6 md:py-5">
          {interviewStage === 'question' && (
            <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
              <p className="text-center text-xs md:text-sm text-gray-300 max-w-xl">
                Listen to the question first, then enable your camera and microphone and click{' '}
                <span className="font-semibold text-sky-300">Start Answering</span> when you are ready.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={() => setShowEndTestConfirm(true)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/40 bg-orange-500/15 px-4 py-2.5 text-sm font-medium text-orange-200 hover:bg-orange-500/25 transition"
                  >
                    <StopCircle className="h-4 w-4" />
                    <span>End Test</span>
                  </button>
                )}
                <button
                  onClick={startAnswering}
                  disabled={!isMediaEnabled && !webcamActive}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3 text-sm font-semibold transition-all duration-300 ${
                    isMediaEnabled || webcamActive
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                  <span>Start Answering</span>
                </button>
              </div>
            </div>
          )}

          {interviewStage === 'answering' && (
            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <div className="flex items-center gap-2 text-sm text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Recording your answer… speak naturally.</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowEndTestConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>End Test</span>
                </button>
                <button
                  onClick={() => {
                    setIsRecording(false);
                    speech.stop();
                    setInterviewStage('question');
                    setTranscript('');
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  <Square className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={!transcript.trim()}
                  className={`inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    transcript.trim()
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white shadow-lg shadow-sky-500/30'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Answer</span>
                </button>
              </div>

              {!speech.supported && (
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Type your answer here..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-800/80 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              )}
            </div>
          )}

          {interviewStage === 'analysis' && (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="flex items-center gap-3 text-sky-300">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                <span className="text-sm md:text-base font-semibold">Analyzing your response…</span>
              </div>
              <p className="text-xs md:text-sm text-gray-400">This may take a few seconds.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewInterface;
