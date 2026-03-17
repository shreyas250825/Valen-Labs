"""
Aptitude & Logical Reasoning Assessment Routes

NEW FEATURE: Provides endpoints for aptitude testing and evaluation.
Integrates with the three-level intelligence architecture.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import logging

from app.database import get_db
from app.ai_engines.gemini_engine import GeminiEngine
from app.schemas.analysis_schema import AptitudeQuestionRequest, AptitudeAnswerSubmission, AptitudeResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/aptitude", tags=["aptitude"])

# Initialize Gemini engine
gemini_engine = GeminiEngine()


@router.post("/generate", response_model=List[Dict[str, Any]])
async def generate_aptitude_test(
    request: AptitudeQuestionRequest
):
    """
    Generate aptitude and logical reasoning questions.
    
    Features:
    - Quantitative aptitude
    - Logical reasoning  
    - Analytical thinking
    - Pattern recognition
    - Verbal reasoning
    """
    try:
        logger.info(f"Generating {request.count} aptitude questions (difficulty: {request.difficulty})")
        
        questions = gemini_engine.generate_aptitude_questions(
            difficulty=request.difficulty,
            count=request.count
        )
        
        # Remove correct answers from response (send separately for evaluation)
        public_questions = []
        for q in questions:
            public_q = q.copy()
            # Keep correct_answer and explanation for server-side evaluation only
            if 'correct_answer' in public_q:
                del public_q['correct_answer']
            if 'explanation' in public_q:
                del public_q['explanation']
            public_questions.append(public_q)
        
        return public_questions
        
    except Exception as e:
        logger.error(f"Error generating aptitude questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate aptitude questions")


@router.post("/evaluate", response_model=AptitudeResult)
async def evaluate_aptitude_answer(
    submission: AptitudeAnswerSubmission
):
    """
    Evaluate a single aptitude question answer.
    
    Returns:
    - Correct/incorrect status
    - Score (0-100)
    - Correct answer
    - Explanation
    """
    try:
        logger.info(f"Evaluating aptitude answer for question {submission.question_id}")
        
        # For this demo, we'll regenerate the question to get the correct answer
        # In production, you'd store questions in database with correct answers
        all_questions = gemini_engine.generate_aptitude_questions(
            difficulty=submission.difficulty or "medium",
            count=10  # Generate more to find the matching question
        )
        
        # Find the matching question by ID or content
        target_question = None
        for q in all_questions:
            if q.get('id') == submission.question_id:
                target_question = q
                break
        
        if not target_question:
            # If we can't find the exact question, create a mock evaluation
            target_question = {
                'id': submission.question_id,
                'correct_answer': 'Unknown',
                'explanation': 'Question not found in current session'
            }
        
        result = gemini_engine.evaluate_aptitude_answer(target_question, submission.user_answer)
        
        return AptitudeResult(
            question_id=submission.question_id,
            correct=result['correct'],
            score=result['score'],
            user_answer=result['user_answer'],
            correct_answer=result['correct_answer'],
            explanation=result['explanation']
        )
        
    except Exception as e:
        logger.error(f"Error evaluating aptitude answer: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate aptitude answer")


@router.post("/batch-evaluate", response_model=List[AptitudeResult])
async def evaluate_aptitude_batch(
    submissions: List[AptitudeAnswerSubmission]
):
    """
    Evaluate multiple aptitude answers in batch.
    
    Useful for completing an entire aptitude test session.
    """
    try:
        logger.info(f"Batch evaluating {len(submissions)} aptitude answers")
        
        results = []
        
        # Generate questions to get correct answers
        all_questions = gemini_engine.generate_aptitude_questions(difficulty="medium", count=20)
        question_lookup = {q['id']: q for q in all_questions}
        
        for submission in submissions:
            target_question = question_lookup.get(submission.question_id)
            
            if not target_question:
                # Create mock question if not found
                target_question = {
                    'id': submission.question_id,
                    'correct_answer': 'Unknown',
                    'explanation': 'Question not found'
                }
            
            result = gemini_engine.evaluate_aptitude_answer(target_question, submission.user_answer)
            
            results.append(AptitudeResult(
                question_id=submission.question_id,
                correct=result['correct'],
                score=result['score'],
                user_answer=result['user_answer'],
                correct_answer=result['correct_answer'],
                explanation=result['explanation']
            ))
        
        return results
        
    except Exception as e:
        logger.error(f"Error in batch aptitude evaluation: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate aptitude answers")


@router.get("/sample", response_model=List[Dict[str, Any]])
async def get_sample_questions():
    """
    Get sample aptitude questions for demonstration.
    
    Returns a few example questions to show the format and types available.
    """
    try:
        sample_questions = gemini_engine.generate_aptitude_questions(difficulty="easy", count=3)
        
        # Remove correct answers for public display
        public_samples = []
        for q in sample_questions:
            public_q = {
                'id': q['id'],
                'type': q['type'],
                'difficulty': q['difficulty'],
                'text': q['text'],
                'options': q.get('options', [])
            }
            public_samples.append(public_q)
        
        return public_samples
        
    except Exception as e:
        logger.error(f"Error generating sample questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate sample questions")


@router.get("/types")
async def get_question_types():
    """
    Get available aptitude question types and their descriptions.
    """
    return {
        "question_types": [
            {
                "type": "quantitative",
                "name": "Quantitative Aptitude",
                "description": "Mathematical problems, percentages, ratios, and numerical reasoning"
            },
            {
                "type": "logical",
                "name": "Logical Reasoning", 
                "description": "Logical deduction, syllogisms, and reasoning patterns"
            },
            {
                "type": "analytical",
                "name": "Analytical Thinking",
                "description": "Problem analysis, data interpretation, and critical thinking"
            },
            {
                "type": "pattern",
                "name": "Pattern Recognition",
                "description": "Number sequences, visual patterns, and series completion"
            },
            {
                "type": "verbal",
                "name": "Verbal Reasoning",
                "description": "Reading comprehension, analogies, and language skills"
            }
        ],
        "difficulty_levels": ["easy", "medium", "hard"],
        "recommended_count": {
            "quick_assessment": 5,
            "standard_test": 10,
            "comprehensive_test": 20
        }
    }