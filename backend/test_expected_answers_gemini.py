#!/usr/bin/env python3
"""
Test Expected Answers with Gemini Engine (Fallback)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ai_engines.gemini_engine import GeminiEngine

def test_gemini_expected_answers():
    """Test that Gemini engine generates expected answers in evaluations"""
    
    print("🧪 Testing Expected Answers with Gemini Engine")
    print("=" * 60)
    
    # Initialize Gemini engine
    gemini = GeminiEngine()
    
    print(f"✅ Gemini engine initialized")
    
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
    print("\n🔄 Evaluating answer with Gemini...")
    try:
        evaluation = gemini.evaluate_answer(
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
            print("📋 Full evaluation response:")
            for key, value in evaluation.items():
                print(f"   {key}: {value}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error during evaluation: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Expected Answers with Gemini (Fallback)")
    print("=" * 80)
    
    # Run test
    test_passed = test_gemini_expected_answers()
    
    print("\n" + "=" * 80)
    print("📊 Test Results Summary:")
    print(f"   ✅ Gemini Expected Answer Test: {'PASSED' if test_passed else 'FAILED'}")
    
    if test_passed:
        print("\n🎉 Expected answers are working with Gemini!")
        print("💡 The interview reports will show expected answer guidance.")
    else:
        print("\n⚠️ Expected answers may need to be added to Gemini engine.")
        print("💡 Check the evaluate_answer method in gemini_engine.py")