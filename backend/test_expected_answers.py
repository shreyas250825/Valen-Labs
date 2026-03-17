#!/usr/bin/env python3
"""
Test Expected Answers with Ollama Engine
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ai_engines.ollama_engine import OllamaEngine

def test_expected_answers():
    """Test that Ollama engine generates expected answers in evaluations"""
    
    print("🧪 Testing Expected Answers with Ollama Engine")
    print("=" * 60)
    
    # Initialize Ollama engine
    ollama = OllamaEngine()
    
    if not ollama.available:
        print("❌ Ollama not available - skipping test")
        print("💡 Make sure Ollama is running: ollama serve")
        return False
    
    print(f"✅ Ollama available: {ollama.model}")
    
    # Test candidate context
    candidate_context = {
        "role": "Software Engineer",
        "experience_level": "Mid-Level",
        "skills": ["Python", "JavaScript", "React"],
        "domain_analysis": {
            "primary_domain": "fullstack",
            "technical_depth": "intermediate"
        }
    }
    
    # Test question and answer
    question = "Can you describe your experience with Python and how you've used it in recent projects?"
    answer = "I have been working with Python for about 3 years. I mainly use it for backend development with Flask and Django. Recently I built a REST API for a web application."
    
    print(f"\n📝 Test Question: {question}")
    print(f"💬 Test Answer: {answer}")
    
    # Evaluate the answer
    print("\n🔄 Evaluating answer with Ollama...")
    evaluation = ollama.evaluate_answer(
        question_text=question,
        answer=answer,
        candidate_context=candidate_context
    )
    
    print("\n📊 Evaluation Results:")
    print(f"   Technical Score: {evaluation.get('technical', 0)}")
    print(f"   Communication Score: {evaluation.get('communication', 0)}")
    print(f"   Relevance Score: {evaluation.get('relevance', 0)}")
    
    # Check if expected answer is present
    expected_answer = evaluation.get('expected_answer', '')
    if expected_answer:
        print(f"\n✅ Expected Answer Generated:")
        print(f"   {expected_answer}")
        return True
    else:
        print("\n❌ No expected answer found in evaluation")
        return False

def test_interview_flow():
    """Test a complete interview flow to see expected answers in context"""
    
    print("\n\n🎯 Testing Complete Interview Flow")
    print("=" * 60)
    
    ollama = OllamaEngine()
    
    if not ollama.available:
        print("❌ Ollama not available - skipping test")
        return False
    
    # Mock resume data
    resume_data = {
        "skills": ["Python", "JavaScript", "React", "Node.js", "MongoDB"],
        "experience_years": 4,
        "work_experience": [
            {
                "title": "Software Developer",
                "company": "Tech Corp",
                "duration": "2 years",
                "description": "Built web applications using React and Node.js"
            }
        ]
    }
    
    # Extract candidate context
    print("🧠 Extracting candidate context...")
    candidate_context = ollama.extract_candidate_context(
        resume_data=resume_data,
        role="Full Stack Developer",
        interview_type="technical"
    )
    
    # Generate first question
    print("❓ Generating first question...")
    first_question = ollama.generate_first_question(candidate_context)
    print(f"   Q1: {first_question.get('text', 'No question generated')}")
    
    # Simulate answer and evaluation
    mock_answer = "I'm a full stack developer with 4 years of experience. I specialize in JavaScript technologies like React for frontend and Node.js for backend. I've worked on several web applications and enjoy solving complex problems."
    
    print(f"\n💬 Mock Answer: {mock_answer}")
    
    # Evaluate the answer
    print("📊 Evaluating answer...")
    evaluation = ollama.evaluate_answer(
        question_text=first_question.get('text', ''),
        answer=mock_answer,
        candidate_context=candidate_context
    )
    
    # Display results including expected answer
    print("\n📋 Complete Evaluation:")
    print(f"   Technical: {evaluation.get('technical', 0)}/100")
    print(f"   Communication: {evaluation.get('communication', 0)}/100")
    print(f"   Relevance: {evaluation.get('relevance', 0)}/100")
    
    expected_answer = evaluation.get('expected_answer', '')
    if expected_answer:
        print(f"\n💡 Expected Answer Guidance:")
        print(f"   {expected_answer}")
        return True
    else:
        print("\n❌ No expected answer guidance provided")
        return False

if __name__ == "__main__":
    print("🚀 Starting Expected Answers Test Suite")
    print("=" * 80)
    
    # Run tests
    test1_passed = test_expected_answers()
    test2_passed = test_interview_flow()
    
    print("\n" + "=" * 80)
    print("📊 Test Results Summary:")
    print(f"   ✅ Basic Expected Answer Test: {'PASSED' if test1_passed else 'FAILED'}")
    print(f"   ✅ Interview Flow Test: {'PASSED' if test2_passed else 'FAILED'}")
    
    if test1_passed and test2_passed:
        print("\n🎉 All tests passed! Expected answers are working with Ollama.")
        print("💡 The interview reports will now show expected answer guidance.")
    else:
        print("\n⚠️ Some tests failed. Check Ollama configuration.")
        print("💡 Make sure Ollama is running: ollama serve")
        print("💡 And a model is available: ollama pull llama3.1:8b")