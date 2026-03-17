# backend/app/config.py
from pydantic import BaseSettings
from typing import Optional
import os
from pathlib import Path
from dotenv import load_dotenv

# Get the project root directory (parent of backend/)
BACKEND_DIR = Path(__file__).parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
ENV_FILE_ROOT = PROJECT_ROOT / ".env"
ENV_FILE_BACKEND = BACKEND_DIR / ".env"

# Explicitly load .env file from project root first, then backend
if ENV_FILE_ROOT.exists():
    load_dotenv(ENV_FILE_ROOT, override=False)
elif ENV_FILE_BACKEND.exists():
    load_dotenv(ENV_FILE_BACKEND, override=False)
else:
    # Fallback to current directory
    load_dotenv()

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AI Mock Interview Simulator"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # Database
    DATABASE_URL: str = "sqlite:///./interview.db"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # AI Models - Gemini
    GEMINI_API_KEY: Optional[str] = None
    
    # Legacy - kept for backward compatibility
    HUGGINGFACE_API_KEY: Optional[str] = None
    
    class Config:
        # .env file is already loaded by dotenv above
        # This tells pydantic to also check environment variables
        env_file = ".env"  # Will be loaded by dotenv if exists
        env_file_encoding = 'utf-8'

def get_settings():
    return Settings()