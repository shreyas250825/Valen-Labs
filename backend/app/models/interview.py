# backend/app/models/interview.py
from sqlalchemy import Column, Integer, String, DateTime, JSON, Float
from sqlalchemy.sql import func
from app.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    
    # Interview configuration
    role = Column(String, nullable=False)
    interview_type = Column(String, nullable=False)
    round_type = Column(String, nullable=False)
    
    # Session data
    current_question_index = Column(Integer, default=0)
    questions = Column(JSON, default=list)  # List of questions asked
    answers = Column(JSON, default=list)    # List of answers given
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)