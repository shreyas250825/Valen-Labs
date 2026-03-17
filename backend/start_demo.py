#!/usr/bin/env python3
"""
Start GenAI Career Platform in Demo Mode
No dependencies required - works out of the box!
"""

import subprocess
import sys
import os
import time

def check_dependencies():
    """Check if optional dependencies are available"""
    deps_status = {}
    
    try:
        import boto3
        deps_status['boto3'] = True
    except ImportError:
        deps_status['boto3'] = False
    
    try:
        import pymongo
        deps_status['pymongo'] = True
    except ImportError:
        deps_status['pymongo'] = False
    
    return deps_status

def start_server():
    """Start the FastAPI server"""
    print("\n" + "="*80)
    print("🚀 GenAI Career Intelligence Platform - AWS ImpactX Challenge")
    print("="*80)
    
    # Check dependencies
    deps = check_dependencies()
    
    print("📦 Dependency Status:")
    for dep, available in deps.items():
        status = "✅ Available" if available else "⚠️ Not installed (using demo mode)"
        print(f"   • {dep}: {status}")
    
    print("\n🎭 Demo Mode: Enabled (works without AWS/MongoDB)")
    print("🔧 Server: Starting on http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("🎯 Demo: http://localhost:8000/api/v1/demo/status")
    print("\n" + "="*80)
    
    # Start the server
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server failed to start: {e}")
        print("\n💡 Try running: uvicorn app.main:app --reload")

if __name__ == "__main__":
    start_server()