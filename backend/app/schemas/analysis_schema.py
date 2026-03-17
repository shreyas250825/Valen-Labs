# backend/app/schemas/analysis_schema.py
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class AnswerSubmission(BaseModel):
    session_id: str
    question_index: int
    answer_text: str
    behavioral_metrics: Optional[Dict[str, Any]] = None  # From frontend analysis

class AnalysisResult(BaseModel):
    technical_score: float
    communication_score: float 
    confidence_score: float
    overall_score: float
    feedback: str
    detailed_analysis: Dict[str, Any]

class ReportResponse(BaseModel):
    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    question_analysis: List[Dict[str, Any]]
    behavioral_insights: Dict[str, Any]
    improvement_suggestions: List[str]

# ============================================================================
# NEW SCHEMAS: APTITUDE & LOGICAL REASONING ASSESSMENT
# ============================================================================

from pydantic import Field
from datetime import datetime

class AptitudeQuestionRequest(BaseModel):
    """Request for generating aptitude questions"""
    difficulty: str = Field(default="medium", description="Question difficulty: easy, medium, hard")
    count: int = Field(default=5, ge=1, le=20, description="Number of questions to generate")
    question_types: Optional[List[str]] = Field(
        default=None, 
        description="Specific question types: quantitative, logical, analytical, pattern, verbal"
    )


class AptitudeAnswerSubmission(BaseModel):
    """Submission of aptitude question answer"""
    question_id: str = Field(description="Unique question identifier")
    user_answer: str = Field(description="User's answer to the question")
    difficulty: Optional[str] = Field(default="medium", description="Question difficulty level")
    time_taken: Optional[int] = Field(default=None, description="Time taken in seconds")


class AptitudeResult(BaseModel):
    """Result of aptitude question evaluation"""
    question_id: str
    correct: bool = Field(description="Whether the answer is correct")
    score: int = Field(ge=0, le=100, description="Score for this question (0-100)")
    user_answer: str = Field(description="User's submitted answer")
    correct_answer: str = Field(description="The correct answer")
    explanation: str = Field(description="Explanation of the correct answer")
    time_taken: Optional[int] = Field(default=None, description="Time taken in seconds")


class AptitudeBatchResult(BaseModel):
    """Results for multiple aptitude questions"""
    results: List[AptitudeResult]
    overall_score: float = Field(ge=0, le=100, description="Overall aptitude score")
    total_questions: int = Field(description="Total number of questions")
    correct_answers: int = Field(description="Number of correct answers")
    time_taken: Optional[int] = Field(default=None, description="Total time taken")
    performance_analysis: Dict[str, Any] = Field(description="Detailed performance breakdown")


# ============================================================================
# NEW SCHEMAS: JOB FIT & ROLE MATCHING
# ============================================================================

class JobDescription(BaseModel):
    """Job description for fit analysis"""
    title: str = Field(description="Job title")
    company: Optional[str] = Field(default=None, description="Company name")
    required_skills: List[str] = Field(description="Required skills for the role")
    preferred_skills: Optional[List[str]] = Field(default=[], description="Preferred/nice-to-have skills")
    required_experience_years: int = Field(ge=0, description="Required years of experience")
    education_requirements: Optional[Dict[str, str]] = Field(
        default={}, 
        description="Education requirements (degree, field, etc.)"
    )
    location: Optional[str] = Field(default=None, description="Job location")
    description: Optional[str] = Field(default=None, description="Detailed job description")


class CandidateProfile(BaseModel):
    """Candidate profile for job matching"""
    role: str = Field(description="Current/target role")
    skills: List[str] = Field(description="Candidate's skills")
    experience_years: int = Field(ge=0, description="Years of experience")
    experience_level: Optional[str] = Field(default="Mid-Level", description="Experience level")
    education: Optional[Dict[str, str]] = Field(default={}, description="Education details")
    projects: Optional[List[Dict[str, Any]]] = Field(default=[], description="Project experience")
    certifications: Optional[List[str]] = Field(default=[], description="Professional certifications")
    industries: Optional[List[str]] = Field(default=[], description="Industry experience")


class JobFitRequest(BaseModel):
    """Request for job fit analysis"""
    resume_data: CandidateProfile = Field(description="Parsed candidate profile/resume data")
    job_description: JobDescription = Field(description="Target job description")
    analysis_depth: Optional[str] = Field(
        default="standard", 
        description="Analysis depth: basic, standard, comprehensive"
    )


class JobFitResult(BaseModel):
    """Result of job fit analysis"""
    overall_fit_score: float = Field(ge=0, le=100, description="Overall job fit score (0-100)")
    skill_match_percentage: float = Field(ge=0, le=100, description="Skill match percentage")
    experience_match_percentage: float = Field(ge=0, le=100, description="Experience match percentage")
    missing_required_skills: List[str] = Field(description="Required skills the candidate lacks")
    missing_preferred_skills: List[str] = Field(description="Preferred skills the candidate lacks")
    matched_skills: List[str] = Field(description="Skills that match job requirements")
    role_suitability: str = Field(description="Overall role suitability assessment")
    recommendations: List[str] = Field(description="Personalized recommendations for improvement")
    detailed_analysis: Optional[Dict[str, Any]] = Field(
        default={}, 
        description="Detailed breakdown of analysis"
    )
    confidence_score: Optional[float] = Field(
        default=None, 
        ge=0, le=100, 
        description="Confidence in the analysis results"
    )


class RoleMatchingRequest(BaseModel):
    """Request for finding matching roles"""
    candidate_profile: CandidateProfile = Field(description="Candidate's profile")
    preferred_locations: Optional[List[str]] = Field(default=[], description="Preferred job locations")
    salary_range: Optional[Dict[str, int]] = Field(
        default={}, 
        description="Salary preferences (min, max)"
    )
    job_types: Optional[List[str]] = Field(
        default=[], 
        description="Preferred job types (full-time, contract, remote, etc.)"
    )
    max_results: Optional[int] = Field(default=10, ge=1, le=50, description="Maximum number of results")


class RoleMatch(BaseModel):
    """Individual role match result"""
    job_description: JobDescription
    fit_score: float = Field(ge=0, le=100, description="Job fit score")
    skill_match: float = Field(ge=0, le=100, description="Skill match percentage")
    experience_match: float = Field(ge=0, le=100, description="Experience match percentage")
    suitability: str = Field(description="Role suitability assessment")
    missing_skills: List[str] = Field(description="Key missing skills")
    recommendations: List[str] = Field(description="Recommendations for this role")
    match_reasons: List[str] = Field(description="Why this role is a good match")


class RoleMatchingResult(BaseModel):
    """Result of role matching analysis"""
    matches: List[RoleMatch] = Field(description="List of matching roles, sorted by fit score")
    total_analyzed: int = Field(description="Total number of roles analyzed")
    best_fit_score: float = Field(ge=0, le=100, description="Highest fit score found")
    average_fit_score: float = Field(ge=0, le=100, description="Average fit score across all matches")
    candidate_strengths: List[str] = Field(description="Candidate's key strengths")
    improvement_areas: List[str] = Field(description="Areas for skill development")


# ============================================================================
# ENHANCED INTERVIEW SCHEMAS
# ============================================================================

class EnhancedInterviewRequest(BaseModel):
    """Enhanced interview request with new assessment types"""
    role: str
    interview_type: str = Field(description="technical, behavioral, mixed, aptitude")
    round_type: Optional[str] = Field(default="round1")
    include_aptitude: bool = Field(default=False, description="Include aptitude questions")
    aptitude_difficulty: Optional[str] = Field(default="medium")
    candidate_profile: Optional[CandidateProfile] = Field(default=None)
    target_job: Optional[JobDescription] = Field(default=None, description="For job-fit analysis")


class EnhancedAnalysisResult(AnalysisResult):
    """Enhanced analysis result with aptitude and job fit data"""
    aptitude_score: Optional[float] = Field(default=None, ge=0, le=100)
    job_fit_score: Optional[float] = Field(default=None, ge=0, le=100)
    skill_gaps: Optional[List[str]] = Field(default=[])
    learning_recommendations: Optional[List[str]] = Field(default=[])


# ============================================================================
# COMPREHENSIVE REPORT SCHEMAS
# ============================================================================

class ComprehensiveReport(BaseModel):
    """Comprehensive interview and assessment report"""
    session_id: str
    candidate_profile: CandidateProfile
    interview_results: AnalysisResult
    aptitude_results: Optional[AptitudeBatchResult] = None
    job_fit_results: Optional[JobFitResult] = None
    overall_assessment: Dict[str, Any] = Field(description="Overall candidate assessment")
    recommendations: List[str] = Field(description="Comprehensive recommendations")
    next_steps: List[str] = Field(description="Suggested next steps")
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class ReportSummary(BaseModel):
    """Summary view of comprehensive report"""
    session_id: str
    overall_score: float = Field(ge=0, le=100)
    technical_score: float = Field(ge=0, le=100)
    communication_score: float = Field(ge=0, le=100)
    aptitude_score: Optional[float] = Field(default=None, ge=0, le=100)
    job_fit_score: Optional[float] = Field(default=None, ge=0, le=100)
    readiness_level: str = Field(description="Interview readiness level")
    top_strengths: List[str] = Field(description="Top 3 strengths")
    priority_improvements: List[str] = Field(description="Top 3 areas to improve")
    generated_at: datetime