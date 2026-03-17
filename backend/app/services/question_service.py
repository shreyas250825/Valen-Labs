# backend/app/services/question_service.py
from sqlalchemy.orm import Session
import random
from app.models.interview import Interview
from app.constants import QUESTION_BANK, Roles, InterviewType
from app.ai_engines.gemini_engine import GeminiEngine

# Global question service instance
question_service = None

def get_question_service(db: Session = None):
    """Get or create global question service instance"""
    global question_service
    if question_service is None:
        question_service = QuestionService(db)
    return question_service

class QuestionService:
    def __init__(self, db: Session):
        self.db = db

    def get_questions_for_interview(self, role, interview_type, count: int = 5):
        """Generate questions for a new interview"""
        try:
            # Use LLM to generate dynamic questions
            questions = self._generate_dynamic_questions(role, interview_type, count)
            return questions
        except Exception as e:
            print(f"Error generating dynamic questions: {e}")
            # Fallback to static questions
            return self._get_static_questions(role, interview_type, count)

    def _generate_dynamic_questions(self, role, interview_type, count: int):
        """Generate questions using the three-level intelligence architecture"""
        role_name = role.value if hasattr(role, 'value') else str(role)
        interview_type_name = interview_type.value if hasattr(interview_type, 'value') else str(interview_type)

        # Create a profile for the intelligence engine
        profile = {
            "role": role_name,
            "experience_level": "mid",  # Default assumption
            "skills": [],  # Could be enhanced with actual profile data
            "experience_years": 3,  # Default assumption
            "industry": "technology"  # Default assumption
        }

        try:
            # Use the new three-level intelligence engine
            from app.ai_engines.intelligence_engine import intelligence_engine
            
            questions_data = intelligence_engine.generate_questions(
                profile=profile,
                interview_type=interview_type_name,
                count=count
            )

            # Extract question texts from the structured response
            questions = []
            for q in questions_data:
                if isinstance(q, dict) and "text" in q:
                    questions.append(q["text"])
                elif isinstance(q, str):
                    questions.append(q)

            # Ensure we have the right number of questions
            if len(questions) >= count:
                return questions[:count]
            else:
                # Pad with static questions if needed
                static_questions = self._get_static_questions(role, interview_type, count - len(questions))
                return questions + static_questions

        except Exception as e:
            print(f"Intelligence engine question generation failed: {e}")
            return self._get_static_questions(role, interview_type, count)

    def _get_static_questions(self, role, interview_type, count: int):
        """Fallback to static questions from QUESTION_BANK"""
        role_enum = role if isinstance(role, Roles) else Roles(role)
        interview_type_enum = interview_type if isinstance(interview_type, InterviewType) else InterviewType(interview_type)

        role_questions = QUESTION_BANK.get(role_enum, QUESTION_BANK[Roles.SOFTWARE_ENGINEER])

        if interview_type_enum == InterviewType.TECHNICAL:
            question_pool = role_questions[InterviewType.TECHNICAL]
        elif interview_type_enum == InterviewType.BEHAVIORAL:
            question_pool = role_questions[InterviewType.BEHAVIORAL]
        else:  # MIXED
            tech_questions = role_questions[InterviewType.TECHNICAL]
            behavioral_questions = role_questions[InterviewType.BEHAVIORAL]
            question_pool = tech_questions + behavioral_questions

        # Randomly select questions
        selected_questions = random.sample(question_pool, min(count, len(question_pool)))

        # Pad if needed
        while len(selected_questions) < count:
            selected_questions.extend(random.sample(question_pool, min(count - len(selected_questions), len(question_pool))))

        return selected_questions[:count]

    def get_next_question(self, questions_list: list, current_index: int):
        """Get next question from pre-generated list"""
        if current_index < len(questions_list):
            return questions_list[current_index]
        else:
            # If we've exhausted the list, return a generic follow-up question
            return "Can you elaborate on your previous answer or tell me about a challenging project you've worked on?"

    def get_next_question_old(self, session_id: str):
        """Legacy method - Get the next question for the interview session"""
        interview = self.db.query(Interview).filter(
            Interview.session_id == session_id
        ).first()

        if not interview:
            raise Exception("Interview session not found")

        # Get role-specific questions
        role_questions = QUESTION_BANK.get(
            Roles(interview.role),
            QUESTION_BANK[Roles.SOFTWARE_ENGINEER]
        )

        # Determine question type based on interview type
        if interview.interview_type == InterviewType.TECHNICAL.value:
            question_pool = role_questions[InterviewType.TECHNICAL]
        elif interview.interview_type == InterviewType.BEHAVIORAL.value:
            question_pool = role_questions[InterviewType.BEHAVIORAL]
        else:  # MIXED
            # Alternate between technical and behavioral
            if interview.current_question_index % 2 == 0:
                question_pool = role_questions[InterviewType.TECHNICAL]
            else:
                question_pool = role_questions[InterviewType.BEHAVIORAL]

        # Filter out already asked questions
        asked_questions = interview.questions
        available_questions = [q for q in question_pool if q not in asked_questions]

        # If no more questions, reuse from asked questions
        if not available_questions:
            available_questions = question_pool

        # Select random question
        next_question = random.choice(available_questions)

        # Update interview with new question
        interview.questions.append(next_question)
        self.db.commit()

        return {
            "question": next_question,
            "question_index": interview.current_question_index,
            "session_id": session_id
        }
