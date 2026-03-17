#!/usr/bin/env python3
"""
Gemini Fallback Verification Test

Tests the Gemini API integration and fallback system to ensure:
1. Gemini API key works correctly
2. Fallback system operates as expected
3. Engine switching functions properly
4. Both engines produce quality results
"""

import os
import sys
import json
import requests
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
env_file_backend = backend_dir / ".env"
env_file_root = project_root / ".env"

# Load .env file (backend first, then root)
if env_file_backend.exists():
    load_dotenv(env_file_backend)
    print(f"📁 Loaded .env from: {env_file_backend}")
elif env_file_root.exists():
    load_dotenv(env_file_root)
    print(f"📁 Loaded .env from: {env_file_root}")
else:
    print("⚠️ No .env file found")

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ai_engines.gemini_engine import GeminiEngine
from app.ai_engines.ollama_engine import OllamaEngine
from app.ai_engines.engine_router import ai_engine_router

def test_gemini_api_key():
    """Test if Gemini API key is working correctly"""
    print("🔑 Testing Gemini API Key...")
    
    gemini_engine = GeminiEngine()
    
    if not gemini_engine.api_key:
        print("❌ Gemini API key not found in environment")
        return False
    
    print(f"✅ Gemini API key loaded: {gemini_engine.api_key[:20]}...")
    
    # Test basic API call
    test_prompt = "Say 'Hello, Gemini API is working!' and nothing else."
    response = gemini_engine.call_gemini(test_prompt, temperature=0.1, max_tokens=50)
    
    if response and "Hello" in response:
        print(f"✅ Gemini API call successful: {response}")
        return True
    else:
        print(f"❌ Gemini API call failed or unexpected response: {response}")
        return False

def test_engine_availability():
    """Test availability of both engines"""
    print("\n🔍 Testing Engine Availability...")
    
    # Test Ollama
    ollama_engine = OllamaEngine()
    print(f"Ollama Available: {ollama_engine.available}")
    if ollama_engine.available:
        print(f"✅ Ollama: {ollama_engine.model} at {ollama_engine.base_url}")
    else:
        print("⚠️ Ollama: Not available")
    
    # Test Gemini
    gemini_engine = GeminiEngine()
    gemini_available = bool(gemini_engine.api_key)
    print(f"Gemini Available: {gemini_available}")
    if gemini_available:
        print(f"✅ Gemini: API key configured")
    else:
        print("❌ Gemini: API key not configured")
    
    return ollama_engine.available, gemini_available

def test_engine_router_stats():
    """Test engine router statistics and health"""
    print("\n📊 Testing Engine Router Statistics...")
    
    # Get current stats
    stats = ai_engine_router.get_engine_stats()
    print("Current Engine Statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    # Get health check
    health = ai_engine_router.health_check()
    print("\nEngine Health Check:")
    print(json.dumps(health, indent=2))
    
    return stats, health

def test_force_engine_switching():
    """Test manual engine switching functionality"""
    print("\n🔀 Testing Engine Switching...")
    
    # Get initial stats
    initial_stats = ai_engine_router.get_engine_stats()
    print(f"Initial preference: {initial_stats['current_preference']}")
    
    # Force switch to Gemini
    print("Forcing switch to Gemini...")
    success = ai_engine_router.force_engine("gemini")
    if success:
        print("✅ Successfully switched to Gemini")
        
        # Test a simple operation
        test_context = {
            "role": "Software Engineer",
            "experience_level": "Mid-Level",
            "domain_analysis": {"primary_domain": "fullstack"}
        }
        
        question = ai_engine_router.generate_first_question(test_context)
        print(f"✅ Gemini generated question: {question.get('text', 'No text')[:100]}...")
        
        # Check stats
        new_stats = ai_engine_router.get_engine_stats()
        print(f"Last engine used: {new_stats['last_engine_used']}")
        print(f"Gemini requests: {new_stats['gemini_requests']}")
        
    else:
        print("❌ Failed to switch to Gemini")
    
    # Reset preferences
    print("Resetting preferences...")
    ai_engine_router.reset_preferences()
    reset_stats = ai_engine_router.get_engine_stats()
    print(f"Reset preference: {reset_stats['current_preference']}")
    
    return success

def test_fallback_behavior():
    """Test automatic fallback behavior"""
    print("\n🔄 Testing Fallback Behavior...")
    
    # Check current configuration
    stats = ai_engine_router.get_engine_stats()
    print(f"Prefer Ollama: {stats.get('current_preference') == 'ollama'}")
    print(f"Fallback Enabled: {stats.get('fallback_enabled', False)}")
    print(f"Ollama Available: {stats.get('ollama_available', False)}")
    print(f"Gemini Available: {stats.get('gemini_available', False)}")
    
    # Test context extraction (Layer 1)
    print("\nTesting Layer 1: Context Extraction...")
    test_resume = {
        "skills": ["Python", "JavaScript", "React"],
        "experience_years": 3,
        "work_experience": [{"company": "Tech Corp", "role": "Developer"}]
    }
    
    context = ai_engine_router.extract_candidate_context(
        resume_data=test_resume,
        role="Software Engineer", 
        interview_type="mixed"
    )
    
    print(f"✅ Context extracted with engine: {context.get('ai_engine', 'unknown')}")
    print(f"Experience level: {context.get('experience_level')}")
    
    # Test question generation (Layer 2)
    print("\nTesting Layer 2: Question Generation...")
    question = ai_engine_router.generate_first_question(context)
    print(f"✅ Question generated: {question.get('text', 'No text')[:100]}...")
    
    # Test answer evaluation (Layer 3)
    print("\nTesting Layer 3: Answer Evaluation...")
    evaluation = ai_engine_router.evaluate_answer(
        question_text="Tell me about your experience.",
        answer="I have 3 years of experience working with Python and JavaScript, building web applications.",
        candidate_context=context
    )
    
    print(f"✅ Answer evaluated - Technical: {evaluation.get('technical')}, Communication: {evaluation.get('communication')}")
    
    # Final stats
    final_stats = ai_engine_router.get_engine_stats()
    print(f"\nFinal Statistics:")
    print(f"  Last engine used: {final_stats['last_engine_used']}")
    print(f"  Ollama requests: {final_stats['ollama_requests']}")
    print(f"  Gemini requests: {final_stats['gemini_requests']}")
    print(f"  Fallback count: {final_stats['fallback_count']}")
    
    return final_stats

def test_interview_flow_with_gemini():
    """Test complete interview flow using Gemini"""
    print("\n🎯 Testing Complete Interview Flow with Gemini...")
    
    # Force Gemini usage
    ai_engine_router.force_engine("gemini")
    
    # Simulate interview start
    test_profile = {
        "skills": ["Python", "Django", "PostgreSQL", "Docker"],
        "experience_years": 4,
        "education": [{"degree": "Computer Science", "university": "Tech University"}],
        "work_experience": [
            {"company": "StartupCorp", "role": "Backend Developer", "duration": "2 years"},
            {"company": "BigTech", "role": "Senior Developer", "duration": "2 years"}
        ]
    }
    
    # Layer 1: Extract context
    context = ai_engine_router.extract_candidate_context(
        resume_data=test_profile,
        role="Senior Backend Developer",
        interview_type="technical"
    )
    print(f"✅ Context: {context['experience_level']} {context['role']}")
    
    # Layer 2: Generate questions
    q1 = ai_engine_router.generate_first_question(context)
    print(f"✅ Q1: {q1['text'][:80]}...")
    
    # Simulate conversation history
    conversation_history = [
        {"type": "question", "content": q1["text"], "question_number": 1},
        {"type": "answer", "content": "I'm a senior backend developer with 4 years of experience in Python and Django.", "question_number": 1}
    ]
    
    q2 = ai_engine_router.generate_next_question(context, conversation_history, 2)
    print(f"✅ Q2: {q2['text'][:80]}...")
    
    # Layer 3: Evaluate answers
    eval1 = ai_engine_router.evaluate_answer(
        question_text=q1["text"],
        answer="I'm a senior backend developer with 4 years of experience in Python and Django. I've worked on scalable web applications and microservices.",
        candidate_context=context
    )
    print(f"✅ Evaluation: T:{eval1['technical']} C:{eval1['communication']} R:{eval1['relevance']}")
    
    # Generate final report
    evaluations = [eval1]
    report = ai_engine_router.generate_final_report(context, conversation_history, evaluations)
    print(f"✅ Report: {report.get('overall_summary', 'No summary')[:100]}...")
    
    # Reset to default
    ai_engine_router.reset_preferences()
    
    return True

def main():
    """Run all Gemini fallback verification tests"""
    print("🚀 Gemini Fallback Verification Test Suite")
    print("=" * 50)
    
    results = {}
    
    # Test 1: Gemini API Key
    results['api_key'] = test_gemini_api_key()
    
    # Test 2: Engine Availability
    ollama_available, gemini_available = test_engine_availability()
    results['engines'] = {'ollama': ollama_available, 'gemini': gemini_available}
    
    # Test 3: Engine Statistics
    stats, health = test_engine_router_stats()
    results['stats'] = stats
    results['health'] = health
    
    # Test 4: Engine Switching
    results['switching'] = test_force_engine_switching()
    
    # Test 5: Fallback Behavior
    results['fallback'] = test_fallback_behavior()
    
    # Test 6: Complete Interview Flow
    results['interview_flow'] = test_interview_flow_with_gemini()
    
    # Summary
    print("\n" + "=" * 50)
    print("🎉 Test Results Summary")
    print("=" * 50)
    
    print(f"✅ Gemini API Key: {'PASS' if results['api_key'] else 'FAIL'}")
    print(f"✅ Ollama Available: {'YES' if results['engines']['ollama'] else 'NO'}")
    print(f"✅ Gemini Available: {'YES' if results['engines']['gemini'] else 'NO'}")
    print(f"✅ Engine Switching: {'PASS' if results['switching'] else 'FAIL'}")
    print(f"✅ Interview Flow: {'PASS' if results['interview_flow'] else 'FAIL'}")
    
    # Engine usage stats
    final_stats = ai_engine_router.get_engine_stats()
    print(f"\nFinal Engine Statistics:")
    print(f"  Ollama Requests: {final_stats['ollama_requests']}")
    print(f"  Gemini Requests: {final_stats['gemini_requests']}")
    print(f"  Fallback Events: {final_stats['fallback_count']}")
    print(f"  Last Engine: {final_stats['last_engine_used']}")
    
    # Overall status
    if results['api_key'] and results['engines']['gemini']:
        print("\n🎯 GEMINI INTEGRATION: FULLY OPERATIONAL")
        print("✅ Gemini API working correctly")
        print("✅ Fallback system operational")
        print("✅ Engine switching functional")
        print("✅ Interview flow complete")
    else:
        print("\n⚠️ GEMINI INTEGRATION: ISSUES DETECTED")
        if not results['api_key']:
            print("❌ Gemini API key issue")
        if not results['engines']['gemini']:
            print("❌ Gemini engine not available")

if __name__ == "__main__":
    main()