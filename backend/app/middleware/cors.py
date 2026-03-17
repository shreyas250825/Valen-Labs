# backend/app/middleware/cors.py
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

def setup_cors(app):
    """Setup CORS middleware"""
    settings = get_settings()

    # Parse FRONTEND_URL which can be comma-separated
    configured_origins = [origin.strip() for origin in (settings.FRONTEND_URL or "").split(",") if origin.strip()]

    # Default origins for development and production
    origins = [
        # Local development
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        
        # Render backend
        "https://iit-b-finals.onrender.com",
        "https://iit-b-finals.onrender.com/",
        
        # Vercel frontend
        "https://intervize.vercel.app",
        "https://intervize.vercel.app/",
    ] + configured_origins
    
    # Remove duplicates and empty strings
    origins = list(dict.fromkeys([o for o in origins if o]))

    # Add CORS middleware with the configured origins
    origins = list(set([origin for origin in origins if origin]))
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )