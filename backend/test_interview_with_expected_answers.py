#!/usr/bin/env python3
"""
Test Complete Interview Flow with Expected Answers
"""

import requests
import json
import time

def test_interview_flow():
    """Test complete interview flow to verify expected answers appear in reports"""
    
    print("🎯 Testing Complete Interview Flow with Expected Answers")
    print("=" * 80)
    
    base_url = "http://localhost:8000"
    
    # Test server health
    try:
        health_response = requests.get(f"{base_url}/health")
        if health_response.status_code != 200:
            print("❌ Server not responding")
            return False
        print("✅ Server is running")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
        return False
    
    # Mock resume profile
    profile = {
        "skills": ["Python", "JavaScript", "React", "Node.js", "MongoDB"],
        "experience_years": 4,
        "work_experience": [
            {
                "title": "Software Developer",
                "company": "Tech Corp",
                "duration": "2 years",
                "description": "Built web applications using React and Node.js"
            }
        ],
        "education": [
            {
                "degree": "Bachelor of Computer Science",
                "institution": "University",
                "year": "2020"
            }
        ]
    }
    
    # Start interview
    print("\n🚀 Starting interview...")
    start_payload = {
        "profile": profile,
        "role": "Full Stack Developer",
        "interview_type": "technical"
    }
    
    try:
        start_response = requests.post(f"{base_url}/api/interview/start", json=start_payload)
        start_response.raise_for_status()
        start_data = start_response.json()
        
        session_id = start_data["session_id"]
        first_question = start_data["question"]
        
        print(f"✅ Interview started - Session ID: {session_id}")
        print(f"📝 First Question: {first_question.get('text', 'No question text')}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to start interview: {e}")
        return False
    
    # Answer the first question
    print("\n💬 Answering first question...")
    answer_payload = {
        "session_id": session_id,
        "question_id": first_question.get("id", "q1"),
        "transcript": "I'm a full stack developer with 4 years of experience. I specialize in JavaScript technologies like React for frontend and Node.js for backend. I've worked on several web applications including e-commerce platforms and content management systems. I enjoy solving complex problems and learning new technologies.",
        "metrics": {
            "duration": 45,
            "confidence": 85,
            "clarity": 90
        }
    }
    
    try:
        answer_response = requests.post(f"{base_url}/api/interview/answer", json=answer_payload)
        answer_response.raise_for_status()
        answer_data = answer_response.json()
        
        evaluation = answer_data.get("evaluation", {})
        print(f"✅ Answer evaluated:")
        print(f"   Technical: {evaluation.get('technical', 0)}")
        print(f"   Communication: {evaluation.get('communication', 0)}")
        print(f"   Relevance: {evaluation.get('relevance', 0)}")
        
        # Check if expected answer is present
        expected_answer = evaluation.get('expected_answer', '')
        if expected_answer:
            print(f"✅ Expected Answer: {expected_answer}")
        else:
            print("⚠️ No expected answer in evaluation")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to submit answer: {e}")
        return False
    
    # Answer a second question if available
    next_question = answer_data.get("next_question")
    if next_question:
        print(f"\n📝 Second Question: {next_question.get('text', 'No question text')}")
        
        answer_payload2 = {
            "session_id": session_id,
            "question_id": next_question.get("id", "q2"),
            "transcript": "In my recent project, I used Python with Django to build a REST API that handles user authentication and data management. I implemented JWT tokens for security and used PostgreSQL for the database. The API serves a React frontend and handles about 1000 requests per minute.",
            "metrics": {
                "duration": 60,
                "confidence": 88,
                "clarity": 85
            }
        }
        
        try:
            answer_response2 = requests.post(f"{base_url}/api/interview/answer", json=answer_payload2)
            answer_response2.raise_for_status()
            answer_data2 = answer_response2.json()
            
            evaluation2 = answer_data2.get("evaluation", {})
            print(f"✅ Second answer evaluated:")
            print(f"   Technical: {evaluation2.get('technical', 0)}")
            print(f"   Communication: {evaluation2.get('communication', 0)}")
            print(f"   Relevance: {evaluation2.get('relevance', 0)}")
            
            expected_answer2 = evaluation2.get('expected_answer', '')
            if expected_answer2:
                print(f"✅ Expected Answer: {expected_answer2}")
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to submit second answer: {e}")
    
    # Get final report
    print(f"\n📋 Generating final report...")
    try:
        report_response = requests.get(f"{base_url}/api/interview/report/{session_id}")
        report_response.raise_for_status()
        report_data = report_response.json()
        
        print(f"✅ Report generated successfully")
        print(f"   Session ID: {report_data.get('session_id')}")
        print(f"   Questions: {len(report_data.get('questions', []))}")
        print(f"   Evaluations: {len(report_data.get('evaluations', []))}")
        print(f"   Answers: {len(report_data.get('answers', []))}")
        
        # Check if evaluations contain expected answers
        evaluations = report_data.get('evaluations', [])
        expected_answers_found = 0
        
        for i, evaluation in enumerate(evaluations):
            expected_answer = evaluation.get('expected_answer', '')
            if expected_answer:
                expected_answers_found += 1
                print(f"   ✅ Question {i+1} has expected answer: {expected_answer[:100]}...")
        
        print(f"\n📊 Expected Answers Summary:")
        print(f"   Total Questions: {len(evaluations)}")
        print(f"   With Expected Answers: {expected_answers_found}")
        
        if expected_answers_found > 0:
            print("🎉 Expected answers are working in the complete flow!")
            return True
        else:
            print("⚠️ No expected answers found in report")
            return False
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to get report: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Interview Flow with Expected Answers")
    print("=" * 80)
    
    success = test_interview_flow()
    
    print("\n" + "=" * 80)
    if success:
        print("🎉 SUCCESS: Expected answers are working in interview reports!")
        print("💡 Frontend will now display expected answer guidance for each question.")
    else:
        print("❌ FAILED: Expected answers not working properly")
        print("💡 Check server logs and AI engine configuration")