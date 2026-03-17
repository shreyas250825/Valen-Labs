# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routes import health_check, interview_routes, resume_routes, report_routes
# Import new routes for enhanced features
from app.routes import aptitude_routes, job_fit_routes, ai_engine_routes, demo_routes, feedback_routes
from app.routes import supabase_routes
from app.middleware.cors import setup_cors
from app.config import get_settings

# Print startup message
try:
    print("\n" + "="*80)
    print("Valen Labs - Valen AI")
    print("="*80)
    print("Valen AI Backend server starting...")
    print(" Demo mode enabled - no dependencies required!")
    print("")
    print("Valen AI Access Points:")
    print("   • API Documentation: http://localhost:8000/docs")
    print("   • Demo Status: http://localhost:8000/api/v1/demo/status")
    print("   • Architecture: http://localhost:8000/api/v1/demo/architecture-overview")
    print("")
    print("Valen AI Ready for presentation!")
    print("="*80)
    print("")
except:
    pass

# Initialize settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
  title="Valen AI API",
  description="Valen AI with three-level AI architecture",
  version="2.0.0",
  docs_url="/docs",
  redoc_url="/redoc",
)

# Setup CORS middleware
setup_cors(app)

# Include existing routers
app.include_router(health_check.router, tags=["Health"])
# New simplified interview API lives under /api
app.include_router(interview_routes.router, prefix="/api", tags=["Interview"])
app.include_router(resume_routes.router, prefix="/api/v1/resume", tags=["Resume"])
# Also include resume routes under /api/resume for the new parse endpoint
app.include_router(resume_routes.router, prefix="/api/resume", tags=["Resume"])
app.include_router(report_routes.router, prefix="/api/v1/reports", tags=["Reports"])

# Supabase persistence endpoints (Render backend → Supabase)
app.include_router(supabase_routes.router)

# Include NEW FEATURE routers
app.include_router(aptitude_routes.router, tags=["Aptitude Assessment"])
app.include_router(job_fit_routes.router, tags=["Job Fit Analysis"])
app.include_router(ai_engine_routes.router, prefix="/api/v1", tags=["AI Engine Management"])
app.include_router(demo_routes.router, tags=["AWS ImpactX Demo"])
app.include_router(feedback_routes.router)


@app.get("/")
@app.head("/")
async def root():
  return {
    "message": "GenAI Career Intelligence Platform API",
    "status": "running",
    "version": "2.1.0",
    "features": [
      "Three-Layer Intelligence Architecture (Gemini + Ollama)",
      "Local AI Processing with Ollama",
      "Automatic Fallback System (Ollama → Gemini)",
      "Aptitude & Logical Reasoning Assessment", 
      "AI-Based Job Fit & Role Matching",
      "Enhanced Resume Parsing (Fixed Experience Calculation)",
      "Real-time AI Engine Switching"
    ],
    "ai_engines": {
      "primary": "Ollama (Local LLM)",
      "fallback": "Google Gemini (Cloud API)",
      "router": "Intelligent switching with health monitoring"
    }
  }


@app.get("/health")
@app.head("/health")
async def health():
  return {"status": "ok"}


@app.get("/api/intelligence-status")
async def intelligence_status():
  """
  Check the status of AI engines and router configuration.
  Useful for monitoring and debugging the AI system.
  """
  from app.ai_engines.cloud_llm_engine import get_ai_engine_health, get_ai_engine_stats
  
  try:
    health = get_ai_engine_health()
    stats = get_ai_engine_stats()
    
    return {
      "ai_engines": {
        "ollama": {
          "status": "available" if health["ollama"]["available"] else "unavailable",
          "model": health["ollama"].get("model", "N/A"),
          "base_url": health["ollama"].get("base_url", "N/A"),
          "description": "Local LLM processing"
        },
        "gemini": {
          "status": "available" if health["gemini"]["available"] else "unavailable",
          "api_configured": health["gemini"]["api_configured"],
          "description": "Google Gemini Cloud API"
        }
      },
      "router": {
        "prefer_ollama": stats.get("current_preference") == "ollama",
        "fallback_enabled": stats.get("fallback_enabled", True),
        "last_engine_used": stats.get("last_engine_used", "unknown"),
        "fallback_count": stats.get("fallback_count", 0),
        "total_requests": stats.get("ollama_requests", 0) + stats.get("gemini_requests", 0)
      },
      "current_primary": "ollama" if health["ollama"]["available"] else "gemini",
      "overall_status": "healthy" if (health["ollama"]["available"] or health["gemini"]["available"]) else "unhealthy"
    }
  except Exception as e:
    return {
      "error": f"Failed to get intelligence status: {str(e)}",
      "status": "error"
    }


if __name__ == "__main__":
  import uvicorn

  uvicorn.run(
    "app.main:app",
    host="0.0.0.0",
    port=8000,
    reload=settings.DEBUG,
  )

