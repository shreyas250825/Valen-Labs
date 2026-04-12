from typing import List, Optional

from fastapi import APIRouter, Body, Header, HTTPException
from pydantic import BaseModel

from app.services.firebase_admin import verify_bearer_token
from app.services.supabase_client import (
    get_session,
    insert_interview_question,
    insert_interview_report,
    insert_interview_session,
    insert_skill_analysis,
    get_skill_analysis_for_user,
    insert_resume,
    insert_resume_parsed_data,
    set_resume_parsed,
    upsert_job_fit_result,
    upsert_aptitude_result,
    get_user_row,
    list_resumes,
    list_resume_parsed_data,
    list_interview_sessions,
    list_interview_reports,
    list_interview_questions,
    get_job_fit_result,
    get_aptitude_result,
    upsert_user,
    upsert_resume_builder_draft,
    get_resume_builder_draft,
)

router = APIRouter(prefix="/api/v1/supabase", tags=["Supabase"])


def firebase_uid_from_auth(authorization: str) -> str:
    try:
        decoded = verify_bearer_token(authorization)
        return decoded["uid"]
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


class SyncUserBody(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None


@router.post("/sync-user")
def sync_user(body: SyncUserBody, authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)
    try:
        upsert_user(firebase_uid=uid, email=body.email, name=body.name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True}


class CreateSessionBody(BaseModel):
    resume_id: Optional[str] = None
    job_role: Optional[str] = None
    difficulty: Optional[str] = None
    external_session_id: Optional[str] = None


@router.post("/interview/session")
def create_session(body: CreateSessionBody, authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)

    payload = {
        "firebase_uid": uid,
        "resume_id": body.resume_id,
        "job_role": body.job_role,
        "difficulty": body.difficulty,
        "external_session_id": body.external_session_id,
    }

    try:
        row = insert_interview_session(payload)
        return {"ok": True, "id": row.get("id")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class LogQuestionBody(BaseModel):
    session_id: str
    question: str
    user_answer: Optional[str] = None
    ai_feedback: Optional[str] = None
    score: Optional[int] = None


@router.post("/interview/question")
def log_question(body: LogQuestionBody, authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)

    sess = get_session(firebase_uid=uid, session_id=body.session_id)
    if not sess:
        raise HTTPException(status_code=403, detail="Invalid session")

    payload = {
        "session_id": body.session_id,
        "firebase_uid": uid,
        "question": body.question,
        "user_answer": body.user_answer,
        "ai_feedback": body.ai_feedback,
        "score": body.score,
    }
    try:
        insert_interview_question(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True}


class LogReportBody(BaseModel):
    session_id: str
    overall_score: Optional[int] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    improvement_suggestions: Optional[str] = None


@router.post("/interview/report")
def log_report(body: LogReportBody, authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)

    sess = get_session(firebase_uid=uid, session_id=body.session_id)
    if not sess:
        raise HTTPException(status_code=403, detail="Invalid session")

    payload = {
        "session_id": body.session_id,
        "overall_score": body.overall_score,
        "strengths": body.strengths,
        "weaknesses": body.weaknesses,
        "improvement_suggestions": body.improvement_suggestions,
    }
    try:
        insert_interview_report(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True}


class SkillAnalysisBody(BaseModel):
    skill: str
    proficiency_score: int


@router.post("/skill-analysis")
def log_skill(body: SkillAnalysisBody, authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)
    try:
        insert_skill_analysis(firebase_uid=uid, skill=body.skill, proficiency_score=body.proficiency_score)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True}


@router.get("/skill-analysis")
def get_skills(authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)
    try:
        rows = get_skill_analysis_for_user(firebase_uid=uid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return rows


class ResumeBody(BaseModel):
    resume_name: str


@router.post("/resume")
def log_resume(body: ResumeBody, authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)
    try:
        row = insert_resume(firebase_uid=uid, resume_name=body.resume_name, parsed=False)
        return {"ok": True, "id": row.get("id")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class ResumeParsedBody(BaseModel):
    resume_id: str
    full_name: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    projects: Optional[List[str]] = None
    certifications: Optional[List[str]] = None


@router.post("/resume/parsed")
def log_resume_parsed(body: ResumeParsedBody, authorization: str = Header(default="")):
    # Just verify the token; firebase uid is already tied to the resume row.
    firebase_uid_from_auth(authorization)
    try:
        insert_resume_parsed_data(
            {
                "resume_id": body.resume_id,
                "full_name": body.full_name,
                "skills": body.skills,
                "education": body.education,
                "experience": body.experience,
                "projects": body.projects,
                "certifications": body.certifications,
            }
        )
        set_resume_parsed(body.resume_id, parsed=True)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class JobFitResultBody(BaseModel):
    role: Optional[str] = None
    overall_fit_score: Optional[int] = None
    skill_match_percentage: Optional[int] = None
    experience_match_percentage: Optional[int] = None
    matched_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    recommendation: Optional[str] = None
    next_steps: Optional[List[str]] = None
    full_result: Optional[dict] = None


@router.post("/job-fit/result")
def log_job_fit_result(body: JobFitResultBody, authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)
    try:
        upsert_job_fit_result(
            firebase_uid=uid,
            payload={
                # Match your Supabase schema:
                # job_fit_results(firebase_uid PK, job_role, score, results, full_result, updated_at)
                "job_role": body.role,
                "score": body.overall_fit_score,
                "results": {
                    "skill_match_percentage": body.skill_match_percentage,
                    "experience_match_percentage": body.experience_match_percentage,
                    "matched_skills": body.matched_skills,
                    "missing_skills": body.missing_skills,
                    "recommendation": body.recommendation,
                    "next_steps": body.next_steps,
                },
                "full_result": body.full_result,
            },
        )
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class AptitudeResultBody(BaseModel):
    overall_score: Optional[int] = None
    correct_answers: Optional[int] = None
    total_questions: Optional[int] = None
    duration_seconds: Optional[int] = None
    results: Optional[list] = None


@router.post("/aptitude/result")
def log_aptitude_result(body: AptitudeResultBody, authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)
    try:
        upsert_aptitude_result(
            firebase_uid=uid,
            payload={
                # Match your Supabase schema:
                # aptitude_results(firebase_uid PK, score, results, full_result, updated_at)
                "score": body.overall_score,
                "results": body.results,
                "full_result": {
                    "overall_score": body.overall_score,
                    "correct_answers": body.correct_answers,
                    "total_questions": body.total_questions,
                    "duration_seconds": body.duration_seconds,
                    "results": body.results,
                },
            },
        )
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/resume-builder")
def save_resume_builder_draft(body: dict = Body(...), authorization: str = Header(default="")):
    """Persist structured resume builder JSON (one row per user, upsert)."""
    uid = firebase_uid_from_auth(authorization)
    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="Body must be a JSON object")
    try:
        import json

        raw = json.dumps(body)
        if len(raw) > 900_000:
            raise HTTPException(status_code=400, detail="Payload too large")
        upsert_resume_builder_draft(uid, body)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True}


@router.get("/resume-builder")
def load_resume_builder_draft(authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)
    try:
        row = get_resume_builder_draft(uid)
        if not row:
            return {"draft": None}
        return {"draft": row.get("payload"), "updated_at": row.get("updated_at")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/dashboard")
def get_dashboard(authorization: str = Header(default="")):
    uid = firebase_uid_from_auth(authorization)
    try:
        user_row = get_user_row(uid)
        resumes = list_resumes(uid)
        resume_ids = [r.get("id") for r in resumes if r.get("id")]
        parsed_resumes = list_resume_parsed_data(resume_ids)

        sessions = list_interview_sessions(uid, limit=50)
        session_ids = [s.get("id") for s in sessions if s.get("id")]
        reports = list_interview_reports(session_ids)
        # NOTE: interview_questions can be large; dashboard UI doesn't need it.

        job_fit = get_job_fit_result(uid)
        aptitude = get_aptitude_result(uid)
        skills = get_skill_analysis_for_user(uid)
        try:
            resume_builder = get_resume_builder_draft(uid)
        except Exception:
            resume_builder = None

        return {
            "user": user_row,
            "resumes": resumes,
            "resume_parsed_data": parsed_resumes,
            "interview_sessions": sessions,
            "interview_reports": reports,
            "job_fit_result": job_fit,
            "aptitude_result": aptitude,
            "skill_analysis": skills,
            "resume_builder_draft": resume_builder,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/reports")
def list_user_reports(authorization: str = Header(default="")):
    """
    Supabase-backed report list for the Reports screen.
    Returns interview sessions + latest report score for each session.
    """
    uid = firebase_uid_from_auth(authorization)
    try:
        sessions = list_interview_sessions(uid, limit=100)
        session_ids = [s.get("id") for s in sessions if s.get("id")]
        reports = list_interview_reports(session_ids)

        report_by_session: dict[str, dict] = {}
        for r in reports:
            sid = r.get("session_id")
            if sid and sid not in report_by_session:
                report_by_session[sid] = r

        out = []
        for s in sessions:
            sid = s.get("id")
            if not sid:
                continue
            rep = report_by_session.get(sid) or {}
            overall = rep.get("overall_score") or 0
            out.append(
                {
                    "session_id": s.get("external_session_id") or sid,
                    "supabase_session_id": sid,
                    "role": s.get("job_role") or "Software Engineer",
                    "interview_type": "mixed",
                    "created_at": s.get("started_at"),
                    "overall_score": overall,
                    "technical_score": overall,
                    "communication_score": overall,
                    "confidence_score": overall,
                    "questions_count": 0,
                }
            )

        return {"reports": out}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

