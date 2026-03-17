"""
Cloud LLM Engine - Updated to use AI Engine Router with Ollama + Gemini
Maintains backward compatibility while leveraging the new router system.
"""
from typing import Any, Dict, List

# Import the new AI Engine Router
from app.ai_engines.engine_router import ai_engine_router

def generate_questions(profile: Dict[str, Any], interview_type: str, persona: str = "professional", round_name: str = "round1") -> List[Dict[str, Any]]:
    """
    Generate interview questions using the AI Engine Router (Ollama + Gemini).
    
    DEPRECATED: This function is kept for backward compatibility.
    Use ai_engine_router directly for new implementations.
    """
    # Extract candidate context (Layer 1)
    candidate_context = ai_engine_router.extract_candidate_context(
        resume_data=profile,
        role=profile.get("role", "Software Engineer"),
        interview_type=interview_type
    )
    
    # Generate first question (Layer 2)
    first_question = ai_engine_router.generate_first_question(candidate_context)
    
    # For backward compatibility, return a list with the first question
    # In the new system, subsequent questions are generated adaptively
    return [first_question]

def evaluate_answer(question: str, answer: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluate answer using the AI Engine Router (Ollama + Gemini).
    
    DEPRECATED: This function is kept for backward compatibility.
    Use ai_engine_router.evaluate_answer directly for new implementations.
    """
    # Extract expected_keywords from question if available
    question_text = ""
    
    if isinstance(question, dict):
        question_text = question.get("text", question.get("question", str(question)))
    else:
        question_text = str(question)
    
    # Create candidate context from profile
    candidate_context = ai_engine_router.extract_candidate_context(
        resume_data=profile,
        role=profile.get("role", "Software Engineer"),
        interview_type="mixed"
    )
    
    result = ai_engine_router.evaluate_answer(question_text, answer, candidate_context)
    
    # Ensure backward compatibility - add missing fields
    if "notes" not in result:
        result["notes"] = f"Technical: {result.get('technical', 0)}, Communication: {result.get('communication', 0)}, Relevance: {result.get('relevance', 0)}"
    
    return result


def improve_answer(question: str, answer: str, profile: Dict[str, Any]) -> str:
    """
    DEPRECATED: Answer improvement removed from new architecture.
    Returns original answer for backward compatibility.
    """
    return answer


def generate_final_report(session_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate final report using the AI Engine Router (Ollama + Gemini).
    
    DEPRECATED: This function is kept for backward compatibility.
    Use ai_engine_router.generate_final_report directly for new implementations.
    """
    candidate_context = session_data.get("candidate_context", {})
    conversation_history = session_data.get("conversation_history", [])
    evaluations = session_data.get("evaluations", [])
    
    return ai_engine_router.generate_final_report(candidate_context, conversation_history, evaluations)


def generate_interviewer_response(question: str, candidate_answer: str, conversation_history: list = None) -> str:
    """
    Generate interviewer response using AI Engine Router.
    """
    # For simple responses, we can use a basic prompt with either engine
    try:
        # Try to use the router's primary engine for a simple response
        engine_stats = ai_engine_router.get_engine_stats()
        if engine_stats.get("ollama_available"):
            response = ai_engine_router.ollama_engine.call_ollama(
                f"Generate a brief professional interviewer response to this answer: {candidate_answer}",
                temperature=0.3, max_tokens=100
            )
        else:
            response = ai_engine_router.gemini_engine.call_gemini(
                f"Generate a brief professional interviewer response to this answer: {candidate_answer}",
                temperature=0.3, max_tokens=100
            )
        
        if response and len(response.strip()) > 10:
            return response.strip()
    except Exception as e:
        pass
    
    # Fallback responses
    responses = [
        "Thank you for sharing that. Can you elaborate on the specific challenges you faced?",
        "That's interesting. How did you measure the success of that approach?",
        "Good point. What would you do differently if you encountered a similar situation again?",
        "I appreciate that example. Can you walk me through your decision-making process?",
        "That sounds like valuable experience. How did that project impact your team or organization?"
    ]
    import random
    return random.choice(responses)


# ============================================================================
# NEW FEATURES: APTITUDE & JOB FIT ASSESSMENT
# ============================================================================

def generate_aptitude_questions(difficulty: str = "medium", count: int = 5) -> List[Dict[str, Any]]:
    """
    Generate aptitude and logical reasoning questions using AI Engine Router.
    
    NEW FEATURE: Supports quantitative, logical, analytical, and pattern recognition questions.
    """
    return ai_engine_router.generate_aptitude_questions(difficulty, count)


def evaluate_aptitude_answer(question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
    """
    Evaluate aptitude question answer using AI Engine Router.
    
    NEW FEATURE: Provides correct/incorrect feedback with explanations.
    """
    return ai_engine_router.evaluate_aptitude_answer(question, user_answer)


def calculate_job_fit(resume_data: Dict[str, Any], job_description: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate job fit score and role matching analysis using AI Engine Router.
    
    NEW FEATURE: AI-based job fit analysis with skill matching and recommendations.
    
    Args:
        resume_data: Parsed resume data with skills, experience, etc.
        job_description: Job requirements with required/preferred skills
        
    Returns:
        Dict with overall_fit_score, skill_match_percentage, missing_skills, recommendations
    """
    # Create candidate context from resume data
    candidate_context = ai_engine_router.extract_candidate_context(
        resume_data=resume_data,
        role=job_description.get("title", "Software Engineer"),
        interview_type="mixed"
    )
    
    return ai_engine_router.calculate_job_fit(candidate_context, job_description)


# ============================================================================
# ROUTER UTILITIES
# ============================================================================

def get_ai_engine_stats() -> Dict[str, Any]:
    """Get AI engine usage statistics and health status."""
    return ai_engine_router.get_engine_stats()

def get_ai_engine_health() -> Dict[str, Any]:
    """Get AI engine health check results."""
    return ai_engine_router.health_check()

def force_ai_engine(engine_name: str) -> bool:
    """Force the router to use a specific engine."""
    return ai_engine_router.force_engine(engine_name)

def reset_ai_engine_preferences():
    """Reset AI engine preferences to defaults."""
    ai_engine_router.reset_preferences()


