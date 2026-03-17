# backend/app/services/report_service.py
from sqlalchemy.orm import Session
from app.models.report import Report
from app.models.interview import Interview
from app.models.response import Response

class ReportService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_comprehensive_report(self, interview_id: int) -> dict:
        """Generate a comprehensive report for an interview"""
        interview = self.db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            raise Exception("Interview not found")
        
        responses = self.db.query(Response).filter(Response.interview_id == interview_id).all()
        
        if not responses:
            raise Exception("No responses found for this interview")
        
        # Calculate scores
        overall_score = sum(r.overall_score for r in responses) / len(responses)
        technical_score = sum(r.technical_score for r in responses) / len(responses)
        communication_score = sum(r.communication_score for r in responses) / len(responses)
        confidence_score = sum(r.confidence_score for r in responses) / len(responses)
        
        # Generate detailed analysis
        question_analysis = []
        for response in responses:
            analysis_data = response.analysis_data or {}
            question_analysis.append({
                "question": response.question,
                "answer": response.answer_text,
                "scores": {
                    "technical": response.technical_score,
                    "communication": response.communication_score,
                    "confidence": response.confidence_score,
                    "overall": response.overall_score
                },
                "technical_feedback": analysis_data.get('technical_analysis', {}).get('feedback', ''),
                "behavioral_feedback": analysis_data.get('behavioral_analysis', {}).get('feedback', '')
            })
        
        # Generate behavioral insights
        behavioral_insights = self._generate_behavioral_insights(responses)
        
        # Generate improvement suggestions
        improvement_suggestions = self._generate_improvement_suggestions(responses)
        
        return {
            "overall_score": round(overall_score, 2),
            "technical_score": round(technical_score, 2),
            "communication_score": round(communication_score, 2),
            "confidence_score": round(confidence_score, 2),
            "question_analysis": question_analysis,
            "behavioral_insights": behavioral_insights,
            "improvement_suggestions": improvement_suggestions,
            "interview_metadata": {
                "role": interview.role,
                "interview_type": interview.interview_type,
                "round_type": interview.round_type,
                "total_questions": len(responses),
                "completion_date": interview.completed_at.isoformat() if interview.completed_at else None
            }
        }
    
    def _generate_behavioral_insights(self, responses):
        """Generate behavioral insights from responses"""
        avg_confidence = sum(r.confidence_score for r in responses) / len(responses)
        avg_communication = sum(r.communication_score for r in responses) / len(responses)
        
        insights = {
            "confidence_trend": "stable" if avg_confidence > 70 else "needs_improvement",
            "communication_consistency": "consistent" if avg_communication > 70 else "variable",
            "performance_summary": self._get_performance_summary(avg_confidence, avg_communication)
        }
        
        return insights
    
    def _generate_improvement_suggestions(self, responses):
        """Generate personalized improvement suggestions"""
        suggestions = []
        
        avg_tech = sum(r.technical_score for r in responses) / len(responses)
        avg_comm = sum(r.communication_score for r in responses) / len(responses)
        avg_conf = sum(r.confidence_score for r in responses) / len(responses)
        
        if avg_tech < 70:
            suggestions.extend([
                "Practice explaining technical concepts in simple terms",
                "Work on providing specific examples from your experience",
                "Review fundamental concepts in your field"
            ])
        
        if avg_comm < 70:
            suggestions.extend([
                "Practice structuring answers with clear beginning, middle, and end",
                "Work on reducing filler words and speaking more fluently",
                "Record yourself answering questions to identify areas for improvement"
            ])
        
        if avg_conf < 70:
            suggestions.extend([
                "Practice maintaining eye contact during speaking",
                "Work on speaking with a confident tone and pace",
                "Prepare answers to common interview questions to build confidence"
            ])
        
        # Add general suggestions if we don't have enough specific ones
        if len(suggestions) < 3:
            suggestions.extend([
                "Practice with more mock interviews to build experience",
                "Research the company and role to provide more targeted answers",
                "Prepare questions to ask the interviewer to show engagement"
            ])
        
        return suggestions[:5]  # Return top 5 suggestions
    
    def _get_performance_summary(self, confidence: float, communication: float) -> str:
        """Generate performance summary based on scores"""
        if confidence >= 80 and communication >= 80:
            return "Excellent performance with strong technical knowledge and communication skills."
        elif confidence >= 70 and communication >= 70:
            return "Good overall performance with solid fundamentals."
        elif confidence >= 60 or communication >= 60:
            return "Adequate performance with some areas needing improvement."
        else:
            return "Needs significant improvement in both technical and communication areas."