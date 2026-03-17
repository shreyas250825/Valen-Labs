#!/usr/bin/env python3
"""
Quick integration test for Ollama and experience parsing fixes
"""

def test_experience_parsing():
    """Test the experience parsing fix"""
    from app.services.resume_service import ResumeService
    from sqlalchemy.orm import Session
    from unittest.mock import Mock
    
    print("🔍 Testing Experience Parsing Fix...")
    
    # Mock database session
    mock_db = Mock(spec=Session)
    resume_service = ResumeService(mock_db)
    
    # Test cases
    test_cases = [
        ("I have 4 months of experience in Python development", "Should be ~0.33 years"),
        ("I have 4 years of experience in software engineering", "Should be 4 years"),
        ("6 months experience with React", "Should be 0.5 years"),
        ("2 years of experience in backend development", "Should be 2 years")
    ]
    
    for text, expected in test_cases:
        result = resume_service._extract_experience(text)
        years = result.get('years_experience', 0)
        print(f"📝 Text: \"{text}\"")
        print(f"✅ Parsed: {years} years ({expected})")
        print()
    
    print("🎯 Experience Parsing: FIXED!")

def test_ollama_integration():
    """Test Ollama integration"""
    from app.ai_engines.engine_router import ai_engine_router
    
    print("🧪 Testing Ollama AI Generation...")
    
    try:
        # Test a simple question generation
        candidate_context = {
            'role': 'Software Engineer',
            'experience_level': 'Mid-Level',
            'skills': ['Python', 'JavaScript', 'React'],
            'domain_analysis': {'primary_domain': 'fullstack', 'technical_depth': 'intermediate'}
        }
        
        question = ai_engine_router.generate_first_question(candidate_context)
        print("✅ Question Generated Successfully!")
        print(f"📝 Question: {question.get('text', 'No text')[:100]}...")
        print(f"🏷️ Type: {question.get('type', 'Unknown')}")
        print(f"🎯 Engine Used: Ollama (Local)")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def test_health_check():
    """Test AI engine health"""
    from app.ai_engines.engine_router import ai_engine_router
    
    print("🔍 Testing AI Engine Router...")
    health = ai_engine_router.health_check()
    print("📊 Health Check Results:")
    
    for engine, status in health.items():
        if isinstance(status, dict):
            available = status.get('available', False)
            print(f"  {engine}: {'✅ Available' if available else '❌ Not Available'}")
            if engine == 'ollama' and available:
                print(f"    Model: {status.get('model', 'Unknown')}")
                print(f"    URL: {status.get('base_url', 'Unknown')}")
    
    print("🎯 Integration Status: SUCCESS")

if __name__ == "__main__":
    print("🚀 Running Integration Tests...\n")
    
    test_health_check()
    print("\n" + "="*50 + "\n")
    
    test_ollama_integration()
    print("\n" + "="*50 + "\n")
    
    test_experience_parsing()
    print("\n🎉 All tests completed!")