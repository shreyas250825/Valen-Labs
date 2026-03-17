// src/hooks/useInterview.ts
import { useState, useCallback } from 'react';
import { interviewApi } from '../services/api';

// Type definitions
interface InterviewProfile {
  role: string;
  interview_type: string;
  round_type: string;
  resume_data?: any;
}

interface AnswerSubmission {
  session_id: string;
  question_index: number;
  answer_text: string;
  behavioral_metrics?: any;
}

interface AnalysisResult {
  technical_score: number;
  behavioral_score: number;
  feedback: string;
  suggestions: string[];
}

interface InterviewState {
  sessionId: string | null;
  currentQuestion: string | null;
  currentQuestionIndex: number;
  isInterviewActive: boolean;
  isInterviewCompleted: boolean;
  questions: string[];
  answers: string[];
  analysisResults: AnalysisResult[];
}

export const useInterview = () => {
  const [state, setState] = useState<InterviewState>({
    sessionId: null,
    currentQuestion: null,
    currentQuestionIndex: 0,
    isInterviewActive: false,
    isInterviewCompleted: false,
    questions: [],
    answers: [],
    analysisResults: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start a new interview
  const startInterview = useCallback(async (profile: InterviewProfile) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await interviewApi.startInterview(profile);
      
      setState(prev => ({
        ...prev,
        sessionId: response.session_id,
        isInterviewActive: true
      }));

      return response;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start interview');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get next question
  const getNextQuestion = useCallback(async () => {
    if (!state.sessionId) {
      throw new Error('No active interview session');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await interviewApi.getNextQuestion(state.sessionId);
      
      setState(prev => ({
        ...prev,
        currentQuestion: response.question,
        currentQuestionIndex: response.question_index,
        questions: [...prev.questions, response.question]
      }));

      return response;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get next question');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.sessionId]);

  // Submit answer
  const submitAnswer = useCallback(async (answerText: string, behavioralMetrics?: any) => {
    if (!state.sessionId) {
      throw new Error('No active question to answer');
    }

    setIsLoading(true);
    setError(null);

    try {
      const submission: AnswerSubmission = {
        session_id: state.sessionId,
        question_index: state.currentQuestionIndex,
        answer_text: answerText,
        behavioral_metrics: behavioralMetrics
      };

      const response = await interviewApi.submitAnswer(submission);
      
      setState(prev => ({
        ...prev,
        answers: [...prev.answers, answerText],
        analysisResults: [...prev.analysisResults, response]
      }));

      return response;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit answer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.sessionId, state.currentQuestionIndex]);

  // Complete interview
  const completeInterview = useCallback(async () => {
    if (!state.sessionId) {
      throw new Error('No active interview session');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await interviewApi.completeInterview(state.sessionId);
      
      setState(prev => ({
        ...prev,
        isInterviewActive: false,
        isInterviewCompleted: true
      }));

      return response;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete interview');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.sessionId]);

  // Reset interview
  const resetInterview = useCallback(() => {
    setState({
      sessionId: null,
      currentQuestion: null,
      currentQuestionIndex: 0,
      isInterviewActive: false,
      isInterviewCompleted: false,
      questions: [],
      answers: [],
      analysisResults: []
    });
    setError(null);
  }, []);

  return {
    // State
    ...state,
    isLoading,
    error,
    
    // Actions
    startInterview,
    getNextQuestion,
    submitAnswer,
    completeInterview,
    resetInterview
  };
};