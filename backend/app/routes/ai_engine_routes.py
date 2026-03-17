"""
AI Engine Management Routes

Provides endpoints for monitoring and controlling AI engine selection
between Ollama (local) and Gemini (cloud) engines.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging

from app.ai_engines.cloud_llm_engine import (
    get_ai_engine_stats, 
    get_ai_engine_health, 
    force_ai_engine, 
    reset_ai_engine_preferences
)

logger = logging.getLogger(__name__)

router = APIRouter()

class EngineSelectionRequest(BaseModel):
    engine: str  # "ollama" or "gemini"

class EngineResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

@router.get("/ai-engine/status")
async def get_engine_status():
    """
    Get current AI engine status and usage statistics.
    
    Returns information about:
    - Which engines are available
    - Current engine preferences
    - Usage statistics
    - Health status
    """
    try:
        stats = get_ai_engine_stats()
        health = get_ai_engine_health()
        
        return EngineResponse(
            success=True,
            message="AI engine status retrieved successfully",
            data={
                "stats": stats,
                "health": health,
                "available_engines": {
                    "ollama": health["ollama"]["available"],
                    "gemini": health["gemini"]["available"]
                },
                "current_engine": stats.get("last_engine_used", "unknown"),
                "fallback_count": stats.get("fallback_count", 0)
            }
        )
    except Exception as e:
        logger.error(f"Failed to get engine status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get engine status: {str(e)}")

@router.post("/ai-engine/select")
async def select_engine(request: EngineSelectionRequest):
    """
    Force the AI engine router to use a specific engine.
    
    Args:
        engine: "ollama" for local processing, "gemini" for cloud processing
    """
    try:
        engine_name = request.engine.lower()
        
        if engine_name not in ["ollama", "gemini"]:
            raise HTTPException(
                status_code=400, 
                detail="Invalid engine. Must be 'ollama' or 'gemini'"
            )
        
        success = force_ai_engine(engine_name)
        
        if success:
            return EngineResponse(
                success=True,
                message=f"Successfully switched to {engine_name} engine",
                data={"selected_engine": engine_name}
            )
        else:
            return EngineResponse(
                success=False,
                message=f"Failed to switch to {engine_name} engine - not available",
                data={"selected_engine": None}
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to select engine: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to select engine: {str(e)}")

@router.post("/ai-engine/reset")
async def reset_engine_preferences():
    """
    Reset AI engine preferences to default configuration.
    
    This will restore the original settings from environment variables.
    """
    try:
        reset_ai_engine_preferences()
        
        return EngineResponse(
            success=True,
            message="AI engine preferences reset to defaults",
            data=get_ai_engine_stats()
        )
    except Exception as e:
        logger.error(f"Failed to reset engine preferences: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reset preferences: {str(e)}")

@router.get("/ai-engine/health")
async def health_check():
    """
    Perform comprehensive health check on all AI engines.
    
    Returns detailed status of:
    - Ollama availability and model status
    - Gemini API configuration
    - Router configuration
    """
    try:
        health = get_ai_engine_health()
        
        # Determine overall health
        ollama_healthy = health["ollama"]["available"]
        gemini_healthy = health["gemini"]["available"]
        
        overall_status = "healthy" if (ollama_healthy or gemini_healthy) else "unhealthy"
        
        return EngineResponse(
            success=True,
            message=f"Health check completed - status: {overall_status}",
            data={
                **health,
                "overall_status": overall_status,
                "recommendations": _get_health_recommendations(health)
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

def _get_health_recommendations(health: Dict[str, Any]) -> list:
    """Generate health recommendations based on engine status."""
    recommendations = []
    
    ollama_available = health["ollama"]["available"]
    gemini_available = health["gemini"]["available"]
    
    if not ollama_available and not gemini_available:
        recommendations.append("CRITICAL: No AI engines available. Check Ollama installation and Gemini API key.")
    elif not ollama_available:
        recommendations.append("Ollama not available. Install Ollama and pull a model for local processing.")
    elif not gemini_available:
        recommendations.append("Gemini not available. Set GEMINI_API_KEY environment variable for cloud fallback.")
    
    if ollama_available and gemini_available:
        recommendations.append("Both engines available. Optimal configuration for reliability.")
    
    router_config = health.get("router", {})
    if router_config.get("prefer_ollama") and not ollama_available:
        recommendations.append("Configured to prefer Ollama but it's not available. Consider switching preference.")
    
    return recommendations

@router.get("/ai-engine/models")
async def get_available_models():
    """
    Get information about available AI models.
    
    Returns details about:
    - Ollama models (if available)
    - Gemini model information
    """
    try:
        health = get_ai_engine_health()
        
        models_info = {
            "ollama": {
                "available": health["ollama"]["available"],
                "current_model": health["ollama"].get("model", "N/A"),
                "base_url": health["ollama"].get("base_url", "N/A")
            },
            "gemini": {
                "available": health["gemini"]["available"],
                "model": "gemini-2.0-flash",
                "api_configured": health["gemini"]["api_configured"]
            }
        }
        
        return EngineResponse(
            success=True,
            message="Available models retrieved successfully",
            data=models_info
        )
    except Exception as e:
        logger.error(f"Failed to get available models: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get models: {str(e)}")