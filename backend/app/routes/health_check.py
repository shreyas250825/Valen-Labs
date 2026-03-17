# backend/app/routes/health_check.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Mock Interview Simulator API"
    }

@router.get("/ping")
async def ping():
    return {"message": "pong"}