# backend/app/routes/report_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.report import Report
from app.models.interview import Interview
from app.schemas.analysis_schema import ReportResponse

router = APIRouter()

@router.get("/{session_id}", response_model=ReportResponse)
async def get_interview_report(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get final report for an interview session"""
    try:
        # Get interview
        interview = db.query(Interview).filter(
            Interview.session_id == session_id
        ).first()
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Get report
        report = db.query(Report).filter(
            Report.interview_id == interview.id
        ).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return ReportResponse(
            overall_score=report.overall_score,
            technical_score=report.technical_score,
            communication_score=report.communication_score,
            confidence_score=report.confidence_score,
            question_analysis=report.report_data.get("question_analysis", []),
            behavioral_insights=report.report_data.get("behavioral_insights", {}),
            improvement_suggestions=report.report_data.get("improvement_suggestions", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get report: {str(e)}")

@router.get("/")
async def list_reports(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """List all interview reports"""
    try:
        reports = db.query(Report).offset(skip).limit(limit).all()
        
        result = []
        for report in reports:
            interview = db.query(Interview).filter(
                Interview.id == report.interview_id
            ).first()
            
            result.append({
                "session_id": interview.session_id if interview else "Unknown",
                "role": interview.role if interview else "Unknown",
                "overall_score": report.overall_score,
                "technical_score": report.technical_score,
                "communication_score": report.communication_score,
                "created_at": report.created_at.isoformat() if report.created_at else None
            })
        
        return {
            "reports": result,
            "total": len(result),
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list reports: {str(e)}")