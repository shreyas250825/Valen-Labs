# backend/app/models/response.py
from sqlalchemy import Column, Integer, String, DateTime, JSON, Float, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    question_index = Column(Integer)
    
    # Question and answer
    question = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=True)
    answer_audio_path = Column(String, nullable=True)
    answer_video_path = Column(String, nullable=True)
    
    # Analysis results
    technical_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)
    
    # Detailed analysis
    analysis_data = Column(JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    interview = relationship("Interview", backref="responses")