#!/usr/bin/env python3
"""
Test interview start with Ollama integration
"""

import requests
import json

def test_interview_start():
    """Test interview start endpoint with Ollama"""
    
    payload = {
        'profile': {
            'skills': ['Python', 'JavaScript', 'React'],
            'experience_years': 3,
            'role': 'Software Engineer'
        },
        'role': 'Software Engineer',
        'interview_type': 'technical'
    }
    
    try:
        print("🧪 Testing interview start with Ollama...")
        response = requests.post('http://localhost:8000/api/interview/start', json=payload, timeout=30)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            question = data.get('question', {})
            session_id = data.get('session_id', 'Unknown')
            
            print(f"✅ Interview started successfully!")
            print(f"📝 Session ID: {session_id}")
            print(f"🎯 Question Generated: {question.get('text', 'No text')[:100]}...")
            print(f"🏷️ Question Type: {question.get('type', 'Unknown')}")
            print(f"🔧 Question ID: {question.get('id', 'Unknown')}")
            print("🎉 Ollama is now generating questions!")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_interview_start()