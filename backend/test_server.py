#!/usr/bin/env python3
"""
Test script to verify the server starts without dependencies
"""

import requests
import time
import sys

def test_server():
    """Test if the server is running and responding"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing GenAI Career Platform Server...")
    print("=" * 50)
    
    # Test endpoints
    endpoints = [
        ("/", "Root endpoint"),
        ("/health", "Health check"),
        ("/docs", "API documentation"),
        ("/api/v1/demo/status", "Demo status"),
        ("/api/v1/demo/architecture-overview", "Architecture overview")
    ]
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {description}: OK")
            else:
                print(f"⚠️ {description}: HTTP {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {description}: Failed - {e}")
    
    print("\n🎯 Server test complete!")
    print("If all tests passed, the server is ready for demo!")

if __name__ == "__main__":
    test_server()