# backend/app/services/interview_service.py
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from app.models.interview import Interview
from app.models.response import Response
from app.models.report import Report
from app.schemas.interview_schema import InterviewCreate
from app.schemas.analysis_schema import AnswerSubmission, AnalysisResult
from app.ai_engines.gemini_engine import GeminiEngine
from app.services.question_service import get_question_service

class InterviewService:
    def __init__(self, db: Session):
        self.db = db
        self.gemini_engine = GeminiEngine()

    def create_interview(self, interview_data: InterviewCreate):
        """Create a new interview session"""
        session_id = str(uuid.uuid4())

        # Generate questions for this interview
        question_service_instance = get_question_service(self.db)
        questions = question_service_instance.get_questions_for_interview(
            role=interview_data.role,
            interview_type=interview_data.interview_type,
            count=5  # Default number of questions
        )

        interview = Interview(
            session_id=session_id,
            role=interview_data.role,
            interview_type=interview_data.interview_type,
            round_type=interview_data.round_type,
            questions=questions,
            answers=[]
        )

        self.db.add(interview)
        self.db.commit()
        self.db.refresh(interview)

        return interview
    
    def analyze_answer(self, answer_data: AnswerSubmission):
        """Analyze a submitted answer"""
        # Get interview
        interview = self.db.query(Interview).filter(
            Interview.session_id == answer_data.session_id
        ).first()
        
        if not interview:
            raise Exception("Interview not found")
        
        # Get current question
        current_question = interview.questions[answer_data.question_index]
        
        # Analyze with AI engines
        technical_analysis = self.scoring_engine.analyze_technical(
            current_question, answer_data.answer_text
        )
        
        behavioral_analysis = self.behavioral_engine.analyze_behavioral(
            answer_data.behavioral_metrics or {}
        )
        
        # Calculate scores
        technical_score = technical_analysis.get('score', 0)
        communication_score = behavioral_analysis.get('communication_score', 0)
        confidence_score = behavioral_analysis.get('confidence_score', 0)
        
        overall_score = (
            technical_score * 0.4 +
            communication_score * 0.35 + 
            confidence_score * 0.25
        )
        
        # Generate interviewer response
        interviewer_response = self._generate_interviewer_response(
            current_question, answer_data.answer_text, interview
        )

        # Save response
        response = Response(
            interview_id=interview.id,
            question_index=answer_data.question_index,
            question=current_question,
            answer_text=answer_data.answer_text,
            technical_score=technical_score,
            communication_score=communication_score,
            confidence_score=confidence_score,
            overall_score=overall_score,
            analysis_data={
                "technical_analysis": technical_analysis,
                "behavioral_analysis": behavioral_analysis,
                "interviewer_response": interviewer_response
            }
        )

        self.db.add(response)
        interview.current_question_index += 1
        self.db.commit()

        return AnalysisResult(
            technical_score=technical_score,
            communication_score=communication_score,
            confidence_score=confidence_score,
            overall_score=overall_score,
            feedback=technical_analysis.get('feedback', ''),
            interviewer_response=interviewer_response,
            detailed_analysis={
                "technical": technical_analysis,
                "behavioral": behavioral_analysis
            }
        )
    
    def complete_interview(self, session_id: str):
        """Complete interview and generate final report"""
        interview = self.db.query(Interview).filter(
            Interview.session_id == session_id
        ).first()
        
        if not interview:
            raise Exception("Interview not found")
        
        # Calculate overall scores
        responses = self.db.query(Response).filter(
            Response.interview_id == interview.id
        ).all()
        
        if not responses:
            raise Exception("No responses found")
        
        overall_score = sum(r.overall_score for r in responses) / len(responses)
        technical_score = sum(r.technical_score for r in responses) / len(responses)
        communication_score = sum(r.communication_score for r in responses) / len(responses)
        confidence_score = sum(r.confidence_score for r in responses) / len(responses)
        
        # Generate report
        report = Report(
            interview_id=interview.id,
            overall_score=overall_score,
            technical_score=technical_score,
            communication_score=communication_score,
            confidence_score=confidence_score,
            report_data={
                "question_analysis": [
                    {
                        "question": r.question,
                        "answer": r.answer_text,
                        "scores": {
                            "technical": r.technical_score,
                            "communication": r.communication_score,
                            "confidence": r.confidence_score,
                            "overall": r.overall_score
                        },
                        "feedback": r.analysis_data.get('technical_analysis', {}).get('feedback', '')
                    }
                    for r in responses
                ],
                "behavioral_insights": {},
                "improvement_suggestions": self._generate_improvement_suggestions(responses)
            }
        )
        
        interview.completed_at = datetime.utcnow()
        
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        
        return report
    
    def _generate_improvement_suggestions(self, responses):
        """Generate improvement suggestions based on response analysis"""
        suggestions = []
        
        avg_tech_score = sum(r.technical_score for r in responses) / len(responses)
        avg_comm_score = sum(r.communication_score for r in responses) / len(responses)
        avg_conf_score = sum(r.confidence_score for r in responses) / len(responses)
        
        if avg_tech_score < 70:
            suggestions.append("Focus on strengthening technical fundamentals in your field")
        
        if avg_comm_score < 70:
            suggestions.append("Practice structuring your answers more clearly")
        
        if avg_conf_score < 70:
            suggestions.append("Work on speaking with more confidence and reducing filler words")
        
        return suggestions

    def _generate_interviewer_response(self, question: str, answer: str, interview):
        """Generate interviewer-like response based on candidate's answer"""
        try:
            # Build conversation history from previous responses
            responses = self.db.query(Response).filter(
                Response.interview_id == interview.id
            ).order_by(Response.question_index).all()

            conversation_history = []
            for resp in responses[-3:]:  # Last 3 exchanges
                conversation_history.append((resp.question, resp.answer_text))

            # Generate interviewer response using Gemini
            interviewer_response = self.gemini_engine.call_gemini(
                f"Generate a brief professional interviewer response to this answer: {answer}",
                temperature=0.3,
                max_tokens=100
            )

            return interviewer_response

        except Exception as e:
            return "Thank you for your answer. Let's continue with the next question."
