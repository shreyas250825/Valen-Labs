# backend/app/routes/__init__.py
from .health_check import router as health_router
from .interview_routes import router as interview_router
from .resume_routes import router as resume_router
from .report_routes import router as report_router
from .supabase_routes import router as supabase_router

__all__ = ["health_router", "interview_router", "resume_router", "report_router", "supabase_router"]

