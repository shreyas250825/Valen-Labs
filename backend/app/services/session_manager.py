# backend/app/services/session_manager.py
from sqlalchemy.orm import Session
from app.models.interview import Interview
import uuid
from datetime import datetime

class SessionManager:
    def __init__(self, db: Session):
        self.db = db
    
    def create_session(self, role: str, interview_type: str, round_type: str):
        """Create a new interview session"""
        session_id = str(uuid.uuid4())
        
        interview = Interview(
            session_id=session_id,
            role=role,
            interview_type=interview_type,
            round_type=round_type,
            questions=[],
            answers=[],
            current_question_index=0
        )
        
        self.db.add(interview)
        self.db.commit()
        self.db.refresh(interview)
        
        return interview
    
    def get_session(self, session_id: str):
        """Get interview session by ID"""
        return self.db.query(Interview).filter(Interview.session_id == session_id).first()
    
    def update_session_progress(self, session_id: str, question: str, answer: str = None):
        """Update session progress with new question/answer"""
        interview = self.get_session(session_id)
        if not interview:
            raise Exception("Session not found")
        
        if question and question not in interview.questions:
            interview.questions.append(question)
        
        if answer:
            interview.answers.append(answer)
        
        interview.current_question_index += 1
        self.db.commit()
        
        return interview
    
    def complete_session(self, session_id: str):
        """Mark session as completed"""
        interview = self.get_session(session_id)
        if not interview:
            raise Exception("Session not found")
        
        interview.completed_at = datetime.utcnow()
        self.db.commit()
        
        return interview
    
    def get_session_state(self, session_id: str):
        """Get current state of session"""
        interview = self.get_session(session_id)
        if not interview:
            return None
        
        return {
            "session_id": interview.session_id,
            "current_question_index": interview.current_question_index,
            "total_questions": len(interview.questions),
            "is_completed": interview.completed_at is not None,
            "role": interview.role,
            "interview_type": interview.interview_type
        }