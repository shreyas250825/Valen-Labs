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
        
        # Render backend (current)
        "https://valen-labs.onrender.com",
        "https://valen-labs.onrender.com/",

        # Production frontend domains
        "https://valenlabs.in",
        "https://www.valenlabs.in",

        # Vercel frontend (main + previews)
        "https://valen-labs.vercel.app",
        "https://valen-labs.vercel.app/",
    ] + configured_origins
    
    # Remove duplicates and empty strings
    origins = list(dict.fromkeys([o for o in origins if o]))

    # Add CORS middleware with the configured origins
    origins = list(set([origin for origin in origins if origin]))
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        # Allow Vercel preview URLs like https://valen-labs-git-<branch>-<user>.vercel.app
        allow_origin_regex=r"^https://.*\\.vercel\\.app$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )