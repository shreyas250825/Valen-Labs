# backend/app/models/resume.py
from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    
    # File info
    file_name = Column(String)
    file_path = Column(String)
    
    # Extracted data
    extracted_text = Column(Text)
    parsed_data = Column(JSON, default=dict)  # Skills, experience, education, etc.
    
    # Timestamps
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())