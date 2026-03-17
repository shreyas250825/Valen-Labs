# backend/app/routes/interview_routes.py
from typing import Any, Dict, List, Optional
from datetime import datetime
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid

from app.ai_engines.engine_router import ai_engine_router
from app.services.supabase_client import (
  get_interview_session_by_external_id,
  get_interview_report_for_session,
  get_interview_questions_for_session,
)

logger = logging.getLogger(__name__)
router = APIRouter()


class StartReq(BaseModel):
  profile: Dict[str, Any]
  role: Optional[str] = None
  interview_type: Optional[str] = "mixed"


class StartRes(BaseModel):
  session_id: str
  question: Dict[str, Any]


class AnswerReq(BaseModel):
  session_id: str
  question_id: str
  transcript: str
  metrics: Dict[str, Any]


class AnswerRes(BaseModel):
  evaluation: Dict[str, Any]
  next_question: Optional[Dict[str, Any]] = None


class ReportRes(BaseModel):
  session_id: str
  questions: List[Dict[str, Any]]
  evaluations: List[Dict[str, Any]]
  answers: List[Dict[str, Any]]
  summary: str
  interview_type: Optional[str] = None
  created_at: Optional[str] = None
  role: Optional[str] = None


class ReportListItem(BaseModel):
  session_id: str
  role: str
  interview_type: str
  created_at: str
  overall_score: float
  technical_score: float
  communication_score: float
  questions_count: int


class ReportListRes(BaseModel):
  reports: List[ReportListItem]


# In-memory session storage
SESSIONS: Dict[str, Dict[str, Any]] = {}


@router.post("/interview/start", response_model=StartRes)
def start(req: StartReq) -> StartRes:
  """
  Start interview with three-layer intelligence architecture:
  Layer 1: Extract candidate context from resume
  Layer 2: Generate first question based on context
  """
  session_id = str(uuid.uuid4())

  # Use role from request or profile
  role = req.role or req.profile.get("role") or req.profile.get("estimated_role") or "Software Engineer"
  interview_type = req.interview_type or "mixed"
  
  # LAYER 1: CONTEXT INTELLIGENCE - Extract candidate context
  candidate_context = ai_engine_router.extract_candidate_context(
      resume_data=req.profile,
      role=role,
      interview_type=interview_type
  )

  # LAYER 2: CONVERSATIONAL INTELLIGENCE - Generate first question
  first_question = ai_engine_router.generate_first_question(candidate_context)

  # Store session with candidate context
  SESSIONS[session_id] = {
    "candidate_context": candidate_context,
    "conversation_history": [],
    "current_question_number": 1,
    "answers": [],
    "evaluations": [],
    "created_at": datetime.utcnow().isoformat(),
    "started_at": datetime.utcnow().isoformat(),
  }

  return StartRes(session_id=session_id, question=first_question)


@router.post("/interview/answer", response_model=AnswerRes)
def answer(req: AnswerReq) -> AnswerRes:
  """
  Process answer with three-layer intelligence:
  Layer 2: Store answer and generate next adaptive question
  Layer 3: Evaluate answer quality
  """
  session = SESSIONS.get(req.session_id)
  if not session:
    raise HTTPException(status_code=404, detail="Session not found")

  candidate_context = session.get("candidate_context", {})
  
  # Get current question text from conversation history
  question_text = ""
  if session["conversation_history"]:
    for entry in reversed(session["conversation_history"]):
      if entry["type"] == "question":
        question_text = entry["content"]
        break
  
  if not question_text:
    question_text = "Please tell me about your experience."

  # LAYER 3: EVALUATION INTELLIGENCE - Evaluate answer
  evaluation = ai_engine_router.evaluate_answer(
      question_text=question_text,
      answer=req.transcript,
      candidate_context=candidate_context,
      conversation_history=session.get("conversation_history", [])
  )

  # Add question and answer to conversation history
  session["conversation_history"].extend([
    {
      "type": "question",
      "content": question_text,
      "question_number": session["current_question_number"]
    },
    {
      "type": "answer", 
      "content": req.transcript,
      "question_number": session["current_question_number"],
      "evaluation": evaluation
    }
  ])

  session["answers"].append({
    "question_id": req.question_id,
    "question": question_text,
    "transcript": req.transcript,
    "metrics": req.metrics,
    "evaluation": evaluation,
  })
  session["evaluations"].append(evaluation)

  # LAYER 2: CONVERSATIONAL INTELLIGENCE - Generate next adaptive question
  next_question: Optional[Dict[str, Any]] = None
  if session["current_question_number"] < 8:
    session["current_question_number"] += 1
    next_question = ai_engine_router.generate_next_question(
        candidate_context=candidate_context,
        conversation_history=session["conversation_history"],
        question_number=session["current_question_number"]
    )

  return AnswerRes(evaluation=evaluation, next_question=next_question)


@router.get("/interview/report/{session_id}", response_model=ReportRes)
def report(session_id: str) -> ReportRes:
  """
  Generate final report using Layer 3: Evaluation & Job Intelligence
  """
  session = SESSIONS.get(session_id)
  if not session:
    # Fallback: backend restarted → in-memory sessions lost.
    # Rehydrate a minimal report from Supabase persistence.
    try:
      sess_row = get_interview_session_by_external_id(session_id)
      if not sess_row:
        raise HTTPException(status_code=404, detail="Session not found")

      supa_session_id = sess_row.get("id")
      q_items = get_interview_questions_for_session(supa_session_id) if supa_session_id else []
      rep = get_interview_report_for_session(supa_session_id) if supa_session_id else None

      questions = []
      answers = []
      evaluations = []
      for idx, item in enumerate(q_items):
        q_text = item.get("question") if isinstance(item, dict) else None
        if not q_text:
          continue
        questions.append({
          "id": f"q{idx+1}",
          "text": q_text,
          "type": "conversational",
          "difficulty": "adaptive",
        })
        answers.append({
          "question_id": f"q{idx+1}",
          "question": q_text,
          "transcript": (item.get("user_answer") if isinstance(item, dict) else None) or "",
          "improved": "",
        })
        per_score = item.get("score") if isinstance(item, dict) else None
        s = int(per_score) if isinstance(per_score, (int, float)) else 0
        evaluations.append({
          "technical": s,
          "communication": s,
          "relevance": s,
          "expected_answer": "",
          "notes": item.get("ai_feedback") if isinstance(item, dict) else "",
        })

      summary = ""
      if rep:
        strengths = rep.get("strengths") or []
        weaknesses = rep.get("weaknesses") or []
        improvement = rep.get("improvement_suggestions") or ""
        summary = improvement or ""
        if not summary and (strengths or weaknesses):
          summary = f"Strengths: {', '.join(strengths[:5])}. Weaknesses: {', '.join(weaknesses[:5])}."
      if not summary:
        summary = "Report loaded from Supabase persistence."

      return ReportRes(
        session_id=session_id,
        questions=questions,
        evaluations=evaluations,
        answers=answers,
        summary=summary,
        interview_type=None,
        created_at=sess_row.get("started_at"),
        role=sess_row.get("job_role"),
      )
    except HTTPException:
      raise
    except Exception as e:
      raise HTTPException(status_code=500, detail=f"Failed to load report: {str(e)}")

  candidate_context = session.get("candidate_context", {})
  conversation_history = session.get("conversation_history", [])
  evaluations = session.get("evaluations", [])
  
  # LAYER 3: EVALUATION INTELLIGENCE - Generate final report
  try:
    report_data = ai_engine_router.generate_final_report(
        candidate_context=candidate_context,
        conversation_history=conversation_history,
        evaluations=evaluations
    )
    summary = report_data.get("overall_summary", "")
  except Exception as e:
    logger.error(f"Error generating final report: {e}")
    # Fallback summary
    if evaluations:
      tech = sum(e.get("technical", 0) for e in evaluations) / len(evaluations)
      comm = sum(e.get("communication", 0) for e in evaluations) / len(evaluations)
      rel = sum(e.get("relevance", 0) for e in evaluations) / len(evaluations)
      summary = f"Average scores: Technical {tech:.1f}%, Communication {comm:.1f}%, Relevance {rel:.1f}%."
    else:
      summary = "No answers recorded for this session."

  # Convert conversation history to questions format
  questions = []
  for entry in conversation_history:
    if entry["type"] == "question":
      questions.append({
        "id": f"q{entry['question_number']}",
        "text": entry["content"],
        "type": "conversational",
        "difficulty": "adaptive"
      })

  # Generate "perfect" model answers (expected_answer) for the output screen.
  # This uses Gemini when GEMINI_API_KEY is configured, otherwise Ollama.
  answers = session.get("answers", [])
  for idx, ans in enumerate(answers):
    try:
      q_text = ans.get("question") or ""
      if not q_text:
        continue
      ideal = ai_engine_router.generate_ideal_answer(q_text, candidate_context).strip()
      if ideal:
        # Report UI reads `evaluation.expected_answer` and also checks `answer.improved`.
        if idx < len(evaluations) and isinstance(evaluations[idx], dict):
          evaluations[idx]["expected_answer"] = ideal
        ans["improved"] = ideal
    except Exception as e:
      logger.warning(f"Failed to generate ideal answer for q{idx+1}: {e}")

  return ReportRes(
    session_id=session_id,
    questions=questions,
    evaluations=evaluations,
    answers=answers,
    summary=summary,
    interview_type=candidate_context.get("interview_type"),
    created_at=session.get("created_at"),
    role=candidate_context.get("role"),
  )


@router.get("/interview/reports", response_model=ReportListRes)
def list_reports() -> ReportListRes:
  """List all interview sessions with metadata"""
  reports = []
  
  for session_id, session in SESSIONS.items():
    evaluations = session.get("evaluations", [])
    candidate_context = session.get("candidate_context", {})
    
    if evaluations:
      tech = sum(e.get("technical", 0) for e in evaluations) / len(evaluations)
      comm = sum(e.get("communication", 0) for e in evaluations) / len(evaluations)
      rel = sum(e.get("relevance", 0) for e in evaluations) / len(evaluations)
      overall = (tech + comm + rel) / 3
    else:
      tech = comm = rel = overall = 0.0
    
    # Count questions from conversation history
    question_count = len([entry for entry in session.get("conversation_history", []) if entry["type"] == "question"])
    
    reports.append(ReportListItem(
      session_id=session_id,
      role=candidate_context.get("role", "Software Engineer"),
      interview_type=candidate_context.get("interview_type", "mixed"),
      created_at=session.get("created_at", datetime.utcnow().isoformat()),
      overall_score=overall,
      technical_score=tech,
      communication_score=comm,
      questions_count=question_count
    ))
  
  # Sort by created_at descending
  reports.sort(key=lambda x: x.created_at, reverse=True)
  
  return ReportListRes(reports=reports)