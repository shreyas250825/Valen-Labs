"""
DEPRECATED: Old Three-Level Intelligence Architecture

This file is deprecated in favor of the new Gemini-powered three-layer system.
The new architecture is implemented directly in gemini_engine.py with:

Layer 1: Context Intelligence (Profile Understanding)
Layer 2: Conversational Interview Intelligence  
Layer 3: Evaluation & Job Intelligence

This file is kept for backward compatibility only.
"""

import json
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class IntelligenceEngine:
    """
    DEPRECATED: Legacy three-level intelligence system.
    Use GeminiEngine instead for new implementations.
    """
    
    def __init__(self):
        logger.warning("IntelligenceEngine is deprecated. Use GeminiEngine instead.")
        self.level_1_enabled = True
        self.level_2_enabled = False
        self.level_3_enabled = False

    def generate_questions(self, profile: Dict[str, Any], interview_type: str, count: int = 7) -> List[Dict[str, Any]]:
        """DEPRECATED: Use GeminiEngine.generate_first_question and generate_next_question instead"""
        logger.warning("IntelligenceEngine.generate_questions is deprecated")
        return []

    def evaluate_answer(self, question: str, answer: str, expected_keywords: List[str], profile: Dict[str, Any]) -> Dict[str, Any]:
        """DEPRECATED: Use GeminiEngine.evaluate_answer instead"""
        logger.warning("IntelligenceEngine.evaluate_answer is deprecated")
        return {"technical": 0, "communication": 0, "relevance": 0}

    def generate_aptitude_questions(self, difficulty: str = "medium", count: int = 5) -> List[Dict[str, Any]]:
        """DEPRECATED: Use GeminiEngine.generate_aptitude_questions instead"""
        logger.warning("IntelligenceEngine.generate_aptitude_questions is deprecated")
        return []

    def evaluate_aptitude_answer(self, question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
        """DEPRECATED: Use GeminiEngine.evaluate_aptitude_answer instead"""
        logger.warning("IntelligenceEngine.evaluate_aptitude_answer is deprecated")
        return {"correct": False, "score": 0, "correct_answer": "", "explanation": "", "user_answer": user_answer}

    def calculate_job_fit(self, resume_data: Dict[str, Any], job_description: Dict[str, Any]) -> Dict[str, Any]:
        """DEPRECATED: Use GeminiEngine.calculate_job_fit instead"""
        logger.warning("IntelligenceEngine.calculate_job_fit is deprecated")
        return {"overall_fit_score": 0, "skill_match_percentage": 0, "experience_match_percentage": 0}


# Global instance for backward compatibility
intelligence_engine = IntelligenceEngine()

