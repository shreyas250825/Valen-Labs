#!/usr/bin/env python3
"""Simple AI System Test"""

import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
backend_dir = Path(__file__).parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(env_file)

sys.path.append(str(backend_dir))

try:
    from app.ai_engines.engine_router import ai_engine_router
    
    print("🔍 Simple AI System Test")
    print("=" * 30)
    
    # Test health check
    health = ai_engine_router.health_check()
    
    print("Engine Status:")
    print(f"  Ollama: {'✅ Available' if health['ollama']['available'] else '❌ Unavailable'}")
    print(f"  Gemini: {'✅ Available' if health['gemini']['available'] else '❌ Unavailable'}")
    
    # Test basic functionality
    if health['ollama']['available'] or health['gemini']['available']:
        print("\n🧪 Testing basic functionality...")
        
        # Simple context extraction test
        resume_data = {
            "skills": ["Python", "JavaScript"],
            "experience_years": 3
        }
        
        context = ai_engine_router.extract_candidate_context(
            resume_data, "Software Engineer", "technical"
        )
        
        if context and "role" in context:
            print(f"✅ Context extraction works: {context['experience_level']} {context['role']}")
        else:
            print("❌ Context extraction failed")
        
        # Test question generation
        question = ai_engine_router.generate_first_question(context)
        if question and "text" in question:
            print(f"✅ Question generation works")
        else:
            print("❌ Question generation failed")
        
        print("\n🎉 Basic AI system is functional!")
    else:
        print("\n❌ No AI engines available")
        
except Exception as e:
    print(f"❌ Test failed: {e}")
    import traceback
    traceback.print_exc()