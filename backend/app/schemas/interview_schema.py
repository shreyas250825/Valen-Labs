# backend/app/schemas/interview_schema.py
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.constants import InterviewType, InterviewRound, Roles

class InterviewCreate(BaseModel):
    role: str
    interview_type: str
    round_type: str
    resume_data: Optional[Dict[str, Any]] = None

    @validator('role')
    def validate_role(cls, v):
        if v not in [role.value for role in Roles]:
            raise ValueError(f'Invalid role. Must be one of: {[role.value for role in Roles]}')
        return v

    @validator('interview_type')
    def validate_interview_type(cls, v):
        if v not in [it.value for it in InterviewType]:
            raise ValueError(f'Invalid interview_type. Must be one of: {[it.value for it in InterviewType]}')
        return v

    @validator('round_type')
    def validate_round_type(cls, v):
        if v not in [rt.value for rt in InterviewRound]:
            raise ValueError(f'Invalid round_type. Must be one of: {[rt.value for rt in InterviewRound]}')
        return v

class InterviewResponse(BaseModel):
    id: int
    session_id: str
    role: str
    interview_type: str
    round_type: str
    current_question_index: int
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    question: str
    question_index: int
    session_id: str