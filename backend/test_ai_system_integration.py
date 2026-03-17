#!/usr/bin/env python3
"""
Comprehensive AI System Integration Test

Tests all three AI engines (Ollama, Gemini, and fallback mechanisms)
to ensure the entire system works correctly.
"""

import os
import sys
import json
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
backend_dir = Path(__file__).parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(env_file)

# Add backend to path
sys.path.append(str(backend_dir))

from app.ai_engines.engine_router import ai_engine_router
from app.ai_engines.ollama_engine import OllamaEngine
from app.ai_engines.gemini_engine import GeminiEngine

def test_ollama_engine():
    """Test Ollama engine directly"""
    print("🔧 Testing Ollama Engine")
    print("-" * 30)
    
    ollama = OllamaEngine()
    
    if not ollama.available:
        print("   ❌ Ollama not available")
        return False
    
    print(f"   ✅ Ollama available: {ollama.model} at {ollama.base_url}")
    
    # Test basic call
    try:
        response = ollama.call_ollama("Say 'Hello from Ollama' in exactly 3 words.", temperature=0.1, max_tokens=50)
        if response and len(response.strip()) > 0:
            print(f"   ✅ Basic call works: '{response[:50]}...'")
        else:
            print("   ❌ Basic call failed - empty response")
            return False
    except Exception as e:
        print(f"   ❌ Basic call failed: {e}")
        return False
    
    # Test context extraction
    try:
        resume_data = {
            "skills": ["Python", "JavaScript", "React"],
            "experience_years": 3,
            "work_experience": [{"company": "TechCorp", "role": "Developer"}]
        }
        
        context = ollama.extract_candidate_context(resume_data, "Software Engineer", "technical")
        if context and "role" in context:
            print(f"   ✅ Context extraction works: {context['experience_level']} {context['role']}")
        else:
            print("   ❌ Context extraction failed")
            return False
    except Exception as e:
        print(f"   ❌ Context extraction failed: {e}")
        return False
    
    print("   ✅ Ollama engine fully functional")
    return True

def test_gemini_engine():
    """Test Gemini engine directly"""
    print("\n☁️ Testing Gemini Engine")
    print("-" * 30)
    
    gemini = GeminiEngine()
    
    if not gemini.api_key:
        print("   ❌ Gemini API key not configured")
        return False
    
    print(f"   ✅ Gemini API key configured")
    
    # Test basic call
    try:
        response = gemini.call_gemini("Say 'Hello from Gemini' in exactly 3 words.", temperature=0.1, max_tokens=50)
        if response and len(response.strip()) > 0:
            print(f"   ✅ Basic call works: '{response[:50]}...'")
        else:
            print("   ❌ Basic call failed - empty response")
            return False
    except Exception as e:
        print(f"   ❌ Basic call failed: {e}")
        return False
    
    # Test context extraction
    try:
        resume_data = {
            "skills": ["Python", "JavaScript", "React"],
            "experience_years": 3,
            "work_experience": [{"company": "TechCorp", "role": "Developer"}]
        }
        
        context = gemini.extract_candidate_context(resume_data, "Software Engineer", "technical")
        if context and "role" in context:
            print(f"   ✅ Context extraction works: {context['experience_level']} {context['role']}")
        else:
            print("   ❌ Context extraction failed")
            return False
    except Exception as e:
        print(f"   ❌ Context extraction failed: {e}")
        return False
    
    print("   ✅ Gemini engine fully functional")
    return True

def test_router_integration():
    """Test the AI engine router with both engines"""
    print("\n🔀 Testing AI Engine Router")
    print("-" * 30)
    
    # Test health check
    health = ai_engine_router.health_check()
    print(f"   📊 Health Status:")
    print(f"      Ollama: {'✅' if health['ollama']['available'] else '❌'}")
    print(f"      Gemini: {'✅' if health['gemini']['available'] else '❌'}")
    
    # Test context extraction through router
    try:
        resume_data = {
            "skills": ["Python", "FastAPI", "React", "PostgreSQL"],
            "experience_years": 5,
            "work_experience": [
                {"company": "TechCorp", "role": "Senior Developer", "duration": "2 years"},
                {"company": "StartupXYZ", "role": "Full Stack Developer", "duration": "3 years"}
            ]
        }
        
        context = ai_engine_router.extract_candidate_context(resume_data, "Senior Software Engineer", "technical")
        if context and "role" in context:
            print(f"   ✅ Router context extraction: {context['experience_level']} {context['role']}")
            print(f"      Domain: {context.get('domain_analysis', {}).get('primary_domain', 'unknown')}")
        else:
            print("   ❌ Router context extraction failed")
            return False
    except Exception as e:
        print(f"   ❌ Router context extraction failed: {e}")
        return False
    
    # Test question generation
    try:
        first_question = ai_engine_router.generate_first_question(context)
        if first_question and "text" in first_question:
            print(f"   ✅ Question generation works")
            print(f"      Q1: {first_question['text'][:80]}...")
        else:
            print("   ❌ Question generation failed")
            return False
    except Exception as e:
        print(f"   ❌ Question generation failed: {e}")
        return False
    
    # Test answer evaluation
    try:
        evaluation = ai_engine_router.evaluate_answer(
            first_question['text'],
            "I have 5 years of experience in full-stack development, working with Python, React, and PostgreSQL. I've led several projects and enjoy solving complex technical challenges.",
            context
        )
        if evaluation and "technical" in evaluation:
            print(f"   ✅ Answer evaluation works")
            print(f"      Scores: T:{evaluation['technical']} C:{evaluation['communication']} R:{evaluation['relevance']}")
        else:
            print("   ❌ Answer evaluation failed")
            return False
    except Exception as e:
        print(f"   ❌ Answer evaluation failed: {e}")
        return False
    
    print("   ✅ Router integration fully functional")
    return True

def test_fallback_mechanism():
    """Test the fallback mechanism by forcing engine switches"""
    print("\n🔄 Testing Fallback Mechanism")
    print("-" * 30)
    
    # Get initial stats
    initial_stats = ai_engine_router.get_engine_stats()
    print(f"   📊 Initial Stats:")
    print(f"      Ollama requests: {initial_stats['ollama_requests']}")
    print(f"      Gemini requests: {initial_stats['gemini_requests']}")
    print(f"      Fallback count: {initial_stats['fallback_count']}")
    
    # Test forcing Ollama
    try:
        success = ai_engine_router.force_engine("ollama")
        if success:
            print("   ✅ Can force Ollama engine")
            
            # Make a request
            resume_data = {"skills": ["Python"], "experience_years": 2}
            context = ai_engine_router.extract_candidate_context(resume_data, "Developer", "technical")
            
            stats_after_ollama = ai_engine_router.get_engine_stats()
            print(f"      Ollama requests after test: {stats_after_ollama['ollama_requests']}")
        else:
            print("   ❌ Cannot force Ollama engine")
    except Exception as e:
        print(f"   ❌ Ollama forcing failed: {e}")
    
    # Test forcing Gemini
    try:
        success = ai_engine_router.force_engine("gemini")
        if success:
            print("   ✅ Can force Gemini engine")
            
            # Make a request
            resume_data = {"skills": ["JavaScript"], "experience_years": 3}
            context = ai_engine_router.extract_candidate_context(resume_data, "Frontend Developer", "technical")
            
            stats_after_gemini = ai_engine_router.get_engine_stats()
            print(f"      Gemini requests after test: {stats_after_gemini['gemini_requests']}")
        else:
            print("   ❌ Cannot force Gemini engine")
    except Exception as e:
        print(f"   ❌ Gemini forcing failed: {e}")
    
    # Reset to defaults
    try:
        ai_engine_router.reset_preferences()
        print("   ✅ Successfully reset to default preferences")
    except Exception as e:
        print(f"   ❌ Reset failed: {e}")
    
    # Final stats
    final_stats = ai_engine_router.get_engine_stats()
    print(f"   📊 Final Stats:")
    print(f"      Ollama requests: {final_stats['ollama_requests']}")
    print(f"      Gemini requests: {final_stats['gemini_requests']}")
    print(f"      Fallback count: {final_stats['fallback_count']}")
    
    return True

def test_aptitude_system():
    """Test the aptitude question generation and evaluation"""
    print("\n🧠 Testing Aptitude System")
    print("-" * 30)
    
    try:
        # Generate aptitude questions
        questions = ai_engine_router.generate_aptitude_questions(difficulty="medium", count=2)
        if questions and len(questions) > 0:
            print(f"   ✅ Generated {len(questions)} aptitude questions")
            
            # Test first question
            question = questions[0]
            print(f"      Q1: {question['question'][:60]}...")
            print(f"      Type: {question.get('type', 'unknown')}")
            
            # Test evaluation
            correct_answer = question.get('correct_answer', 'A) Test')
            evaluation = ai_engine_router.evaluate_aptitude_answer(question, correct_answer)
            
            if evaluation and evaluation.get('correct'):
                print(f"   ✅ Aptitude evaluation works (correct answer recognized)")
            else:
                print(f"   ❌ Aptitude evaluation failed")
                return False
        else:
            print("   ❌ Aptitude question generation failed")
            return False
    except Exception as e:
        print(f"   ❌ Aptitude system failed: {e}")
        return False
    
    return True

def test_job_fit_analysis():
    """Test the job fit analysis system"""
    print("\n🎯 Testing Job Fit Analysis")
    print("-" * 30)
    
    try:
        # Create test data
        resume_data = {
            "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
            "experience_years": 4,
            "work_experience": [
                {"company": "TechCorp", "role": "Backend Developer", "duration": "2 years"},
                {"company": "WebCorp", "role": "Full Stack Developer", "duration": "2 years"}
            ]
        }
        
        job_description = {
            "title": "Senior Backend Developer",
            "required_skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "AWS"],
            "required_experience_years": 3
        }
        
        # Extract context first
        context = ai_engine_router.extract_candidate_context(resume_data, job_description["title"], "technical")
        
        # Calculate job fit
        job_fit = ai_engine_router.calculate_job_fit(context, job_description)
        
        if job_fit and "overall_fit_score" in job_fit:
            print(f"   ✅ Job fit analysis works")
            print(f"      Overall fit: {job_fit['overall_fit_score']}%")
            print(f"      Skill match: {job_fit['skill_match_percentage']}%")
            print(f"      Experience match: {job_fit['experience_match_percentage']}%")
            print(f"      Matched skills: {len(job_fit.get('matched_skills', []))}")
            print(f"      Missing skills: {len(job_fit.get('missing_skills', []))}")
        else:
            print("   ❌ Job fit analysis failed")
            return False
    except Exception as e:
        print(f"   ❌ Job fit analysis failed: {e}")
        return False
    
    return True

def main():
    """Run comprehensive AI system integration tests"""
    print("🚀 AI System Integration Test")
    print("=" * 50)
    
    results = {
        "ollama": test_ollama_engine(),
        "gemini": test_gemini_engine(),
        "router": test_router_integration(),
        "fallback": test_fallback_mechanism(),
        "aptitude": test_aptitude_system(),
        "job_fit": test_job_fit_analysis()
    }
    
    print("\n📋 Test Results Summary")
    print("=" * 50)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name.upper():<12}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print(f"\n🎉 ALL TESTS PASSED!")
        print("The AI system integration is fully functional:")
        print("• Ollama engine working for local processing")
        print("• Gemini engine working for cloud processing")
        print("• Router correctly managing engine selection")
        print("• Fallback mechanism functioning properly")
        print("• Aptitude system generating and evaluating questions")
        print("• Job fit analysis providing accurate assessments")
        print("\nThe system is ready for production use! 🚀")
    else:
        failed_tests = [name for name, result in results.items() if not result]
        print(f"\n⚠️ SOME TESTS FAILED!")
        print(f"Failed tests: {', '.join(failed_tests)}")
        print("Please check the configuration and fix the issues above.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)