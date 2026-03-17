"""
AI Engine Router - Intelligent switching between Ollama and Gemini engines

Provides automatic fallback from Ollama to Gemini when local processing is unavailable.
Maintains consistent API interface regardless of underlying engine.
"""

import os
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

from app.ai_engines.ollama_engine import OllamaEngine
from app.ai_engines.gemini_engine import GeminiEngine

logger = logging.getLogger(__name__)

# Configuration
PREFER_OLLAMA = os.getenv("PREFER_OLLAMA", "true").lower() == "true"
FALLBACK_TO_GEMINI = os.getenv("FALLBACK_TO_GEMINI", "true").lower() == "true"

class AIEngineRouter:
    """
    Intelligent router that selects between Ollama and Gemini engines.
    
    Features:
    - Automatic engine selection based on availability
    - Seamless fallback from Ollama to Gemini
    - Consistent API interface
    - Performance monitoring and logging
    """
    
    def __init__(self):
        self.ollama_engine = OllamaEngine()
        self.gemini_engine = GeminiEngine()
        self.prefer_ollama = PREFER_OLLAMA
        self.fallback_enabled = FALLBACK_TO_GEMINI
        
        # Track engine usage statistics
        self.stats = {
            "ollama_requests": 0,
            "gemini_requests": 0,
            "fallback_count": 0,
            "last_engine_used": None
        }
        
        logger.info(f"🔀 AI Engine Router initialized - Prefer Ollama: {self.prefer_ollama}, Fallback: {self.fallback_enabled}")
    
    def _select_engine(self, operation: str = "general") -> tuple:
        """
        Select the appropriate engine based on availability and preferences.
        
        Args:
            operation: Type of operation (for future optimization)
            
        Returns:
            (engine, engine_name) tuple
        """
        if self.prefer_ollama and self.ollama_engine.available:
            self.stats["ollama_requests"] += 1
            self.stats["last_engine_used"] = "ollama"
            return self.ollama_engine, "ollama"
        elif self.fallback_enabled:
            self.stats["gemini_requests"] += 1
            self.stats["last_engine_used"] = "gemini"
            if self.prefer_ollama:
                self.stats["fallback_count"] += 1
                logger.warning(f"🔄 Falling back to Gemini for {operation}")
            return self.gemini_engine, "gemini"
        else:
            # No fallback, force Ollama even if unavailable
            self.stats["ollama_requests"] += 1
            self.stats["last_engine_used"] = "ollama"
            return self.ollama_engine, "ollama"
    
    def _execute_with_fallback(self, operation_name: str, primary_func, fallback_func, *args, **kwargs):
        """
        Execute operation with automatic fallback on failure.
        
        Args:
            operation_name: Name of the operation for logging
            primary_func: Primary engine function to try
            fallback_func: Fallback engine function
            *args, **kwargs: Arguments to pass to the functions
            
        Returns:
            Result from successful engine
        """
        try:
            result = primary_func(*args, **kwargs)
            # Check if result is valid (not empty for string results, not empty dict for dict results)
            if result and (not isinstance(result, (str, dict, list)) or result):
                return result
            else:
                raise Exception("Empty or invalid result from primary engine")
        except Exception as e:
            logger.warning(f"⚠️ Primary engine failed for {operation_name}: {e}")
            if self.fallback_enabled and fallback_func:
                try:
                    self.stats["fallback_count"] += 1
                    logger.info(f"🔄 Using fallback engine for {operation_name}")
                    return fallback_func(*args, **kwargs)
                except Exception as fallback_error:
                    logger.error(f"❌ Fallback engine also failed for {operation_name}: {fallback_error}")
                    raise fallback_error
            else:
                raise e

    # ============================================================================
    # LAYER 1: CONTEXT INTELLIGENCE (PROFILE UNDERSTANDING)
    # ============================================================================

    def extract_candidate_context(self, resume_data: Dict[str, Any], role: str, interview_type: str) -> Dict[str, Any]:
        """
        Layer 1: Extract skills, experience level, and domain signals from resume.
        """
        engine, engine_name = self._select_engine("context_extraction")
        
        if engine_name == "ollama" and self.fallback_enabled:
            return self._execute_with_fallback(
                "extract_candidate_context",
                self.ollama_engine.extract_candidate_context,
                self.gemini_engine.extract_candidate_context,
                resume_data, role, interview_type
            )
        else:
            return engine.extract_candidate_context(resume_data, role, interview_type)

    # ============================================================================
    # LAYER 2: CONVERSATIONAL INTERVIEW INTELLIGENCE
    # ============================================================================

    def generate_first_question(self, candidate_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Layer 2: Generate first general question based on candidate context.
        """
        engine, engine_name = self._select_engine("question_generation")
        
        if engine_name == "ollama" and self.fallback_enabled:
            return self._execute_with_fallback(
                "generate_first_question",
                self.ollama_engine.generate_first_question,
                self.gemini_engine.generate_first_question,
                candidate_context
            )
        else:
            return engine.generate_first_question(candidate_context)

    def generate_next_question(self, candidate_context: Dict[str, Any], conversation_history: List[Dict[str, Any]], question_number: int) -> Dict[str, Any]:
        """
        Layer 2: Generate adaptive conversational questions (2-8) based on previous answers.
        """
        engine, engine_name = self._select_engine("question_generation")
        
        if engine_name == "ollama" and self.fallback_enabled:
            return self._execute_with_fallback(
                "generate_next_question",
                self.ollama_engine.generate_next_question,
                self.gemini_engine.generate_next_question,
                candidate_context, conversation_history, question_number
            )
        else:
            return engine.generate_next_question(candidate_context, conversation_history, question_number)

    # ============================================================================
    # LAYER 3: EVALUATION & JOB INTELLIGENCE
    # ============================================================================

    def evaluate_answer(self, question_text: str, answer: str, candidate_context: Dict[str, Any], conversation_history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Layer 3: Evaluate candidate's answer for technical depth, communication, and relevance.
        """
        engine, engine_name = self._select_engine("answer_evaluation")
        
        if engine_name == "ollama" and self.fallback_enabled:
            return self._execute_with_fallback(
                "evaluate_answer",
                self.ollama_engine.evaluate_answer,
                self.gemini_engine.evaluate_answer,
                question_text, answer, candidate_context, conversation_history
            )
        else:
            return engine.evaluate_answer(question_text, answer, candidate_context, conversation_history)

    def generate_final_report(self, candidate_context: Dict[str, Any], conversation_history: List[Dict[str, Any]], evaluations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Layer 3: Generate comprehensive final report with scores and analysis.
        """
        engine, engine_name = self._select_engine("report_generation")
        
        if engine_name == "ollama" and self.fallback_enabled:
            return self._execute_with_fallback(
                "generate_final_report",
                self.ollama_engine.generate_final_report,
                self.gemini_engine.generate_final_report,
                candidate_context, conversation_history, evaluations
            )
        else:
            return engine.generate_final_report(candidate_context, conversation_history, evaluations)

    def generate_ideal_answer(self, question_text: str, candidate_context: Dict[str, Any]) -> str:
        """
        Generate a model ("perfect") answer for a question.
        Prefer Ollama first, then fall back to Gemini when needed.
        """
        engine, engine_name = self._select_engine("ideal_answer")
        if engine_name == "ollama" and self.fallback_enabled:
            return self._execute_with_fallback(
                "generate_ideal_answer",
                self.ollama_engine.generate_ideal_answer,
                self.gemini_engine.generate_ideal_answer if self.gemini_engine.api_key else None,
                question_text,
                candidate_context,
            )
        return engine.generate_ideal_answer(question_text, candidate_context)

    def calculate_job_fit(self, candidate_context: Dict[str, Any], job_description: Dict[str, Any]) -> Dict[str, Any]:
        """
        Layer 3: AI-Based Job Fit & Role Matching analysis.
        """
        engine, engine_name = self._select_engine("job_fit_analysis")
        
        if engine_name == "ollama" and self.fallback_enabled:
            return self._execute_with_fallback(
                "calculate_job_fit",
                self.ollama_engine.calculate_job_fit,
                self.gemini_engine.calculate_job_fit,
                candidate_context, job_description
            )
        else:
            return engine.calculate_job_fit(candidate_context, job_description)

    def generate_aptitude_questions(self, difficulty: str = "medium", count: int = 10) -> List[Dict[str, Any]]:
        """
        Layer 3: Generate aptitude and logical reasoning questions for assessment.
        """
        engine, engine_name = self._select_engine("aptitude_generation")
        
        if engine_name == "ollama" and self.fallback_enabled:
            return self._execute_with_fallback(
                "generate_aptitude_questions",
                self.ollama_engine.generate_aptitude_questions,
                self.gemini_engine.generate_aptitude_questions,
                difficulty, count
            )
        else:
            return engine.generate_aptitude_questions(difficulty, count)

    def evaluate_aptitude_answer(self, question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
        """
        Evaluate aptitude question answer with exact matching.
        """
        # This doesn't require AI, so we can use either engine
        engine, engine_name = self._select_engine("aptitude_evaluation")
        return engine.evaluate_aptitude_answer(question, user_answer)

    # ============================================================================
    # UTILITY METHODS
    # ============================================================================

    def get_engine_stats(self) -> Dict[str, Any]:
        """Get engine usage statistics."""
        return {
            **self.stats,
            "ollama_available": self.ollama_engine.available,
            "gemini_available": bool(self.gemini_engine.api_key),
            "current_preference": "ollama" if self.prefer_ollama else "gemini",
            "fallback_enabled": self.fallback_enabled
        }

    def force_engine(self, engine_name: str) -> bool:
        """
        Force the router to use a specific engine.
        
        Args:
            engine_name: "ollama" or "gemini"
            
        Returns:
            True if successful, False if engine not available
        """
        if engine_name.lower() == "ollama":
            if self.ollama_engine.available:
                self.prefer_ollama = True
                logger.info("🔀 Forced engine selection: Ollama")
                return True
            else:
                logger.warning("⚠️ Cannot force Ollama - not available")
                return False
        elif engine_name.lower() == "gemini":
            if self.gemini_engine.api_key:
                self.prefer_ollama = False
                logger.info("🔀 Forced engine selection: Gemini")
                return True
            else:
                logger.warning("⚠️ Cannot force Gemini - API key not available")
                return False
        else:
            logger.error(f"❌ Unknown engine: {engine_name}")
            return False

    def reset_preferences(self):
        """Reset engine preferences to default configuration."""
        self.prefer_ollama = PREFER_OLLAMA
        self.fallback_enabled = FALLBACK_TO_GEMINI
        logger.info("🔀 Engine preferences reset to defaults")

    def health_check(self) -> Dict[str, Any]:
        """Perform health check on both engines."""
        return {
            "ollama": {
                "available": self.ollama_engine.available,
                "model": self.ollama_engine.model,
                "base_url": self.ollama_engine.base_url
            },
            "gemini": {
                "available": bool(self.gemini_engine.api_key),
                "api_configured": bool(self.gemini_engine.api_key)
            },
            "router": {
                "prefer_ollama": self.prefer_ollama,
                "fallback_enabled": self.fallback_enabled,
                "stats": self.stats
            }
        }


# Global router instance
ai_engine_router = AIEngineRouter()