#!/usr/bin/env python3
"""
Simple Gemini Integration Test

Tests basic Gemini functionality without hitting rate limits.
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
    print(f"📁 Loaded .env from: {env_file}")

# Add backend to path
sys.path.append(str(backend_dir))

from app.ai_engines.gemini_engine import GeminiEngine
from app.ai_engines.engine_router import ai_engine_router

def test_gemini_basic():
    """Test basic Gemini functionality"""
    print("🔑 Testing Gemini Basic Functionality...")
    
    gemini_engine = GeminiEngine()
    
    if not gemini_engine.api_key:
        print(" Gemini API key not found")
        return False
    
    print(f"Gemini API key loaded: {gemini_engine.api_key[:20]}...")
    
    # Test with a simple, low-cost request
    print("Making simple API call...")
    response = gemini_engine.call_gemini("Hello", temperature=0.1, max_tokens=10)
    
    if response:
        print(f"✅ Gemini API working: {response}")
        return True
    else:
        print("❌ Gemini API call failed")
        return False

def test_engine_router_health():
    """Test engine router health without making AI calls"""
    print("\n🔍 Testing Engine Router Health...")
    
    # Get health status
    health = ai_engine_router.health_check()
    
    print("Engine Health Status:")
    print(f"  Ollama Available: {health['ollama']['available']}")
    print(f"  Gemini Available: {health['gemini']['available']}")
    print(f"  Prefer Ollama: {health['router']['prefer_ollama']}")
    print(f"  Fallback Enabled: {health['router']['fallback_enabled']}")
    
    return health['gemini']['available']

def test_engine_switching():
    """Test engine switching without heavy AI operations"""
    print("\n🔀 Testing Engine Switching...")
    
    # Check initial state
    stats = ai_engine_router.get_engine_stats()
    print(f"Initial preference: {stats['current_preference']}")
    
    # Try to switch to Gemini
    success = ai_engine_router.force_engine("gemini")
    if success:
        print("✅ Successfully switched to Gemini")
        
        # Check new state
        new_stats = ai_engine_router.get_engine_stats()
        print(f"New preference: {new_stats['current_preference']}")
        
        # Switch back to Ollama
        ai_engine_router.force_engine("ollama")
        print("✅ Switched back to Ollama")
        
        return True
    else:
        print("❌ Failed to switch to Gemini")
        return False

def test_fallback_configuration():
    """Test fallback system configuration"""
    print("\n🔄 Testing Fallback Configuration...")
    
    # Get current configuration
    stats = ai_engine_router.get_engine_stats()
    
    print("Fallback System Status:")
    print(f"  Ollama Available: {stats['ollama_available']}")
    print(f"  Gemini Available: {stats['gemini_available']}")
    print(f"  Fallback Enabled: {stats['fallback_enabled']}")
    print(f"  Current Preference: {stats['current_preference']}")
    
    # Check if both engines are available for fallback
    both_available = stats['ollama_available'] and stats['gemini_available']
    
    if both_available:
        print("✅ Both engines available - fallback system ready")
        return True
    elif stats['gemini_available']:
        print("✅ Gemini available as fallback")
        return True
    else:
        print("⚠️ Only Ollama available - no fallback")
        return False

def main():
    """Run simple Gemini integration tests"""
    print("🚀 Simple Gemini Integration Test")
    print("=" * 40)
    
    results = {}
    
    # Test 1: Basic Gemini functionality
    results['gemini_basic'] = test_gemini_basic()
    
    # Wait a bit to avoid rate limits
    time.sleep(2)
    
    # Test 2: Engine router health
    results['router_health'] = test_engine_router_health()
    
    # Test 3: Engine switching
    results['switching'] = test_engine_switching()
    
    # Test 4: Fallback configuration
    results['fallback_config'] = test_fallback_configuration()
    
    # Summary
    print("\n" + "=" * 40)
    print("🎉 Test Results Summary")
    print("=" * 40)
    
    print(f"✅ Gemini Basic: {'PASS' if results['gemini_basic'] else 'FAIL'}")
    print(f"✅ Router Health: {'PASS' if results['router_health'] else 'FAIL'}")
    print(f"✅ Engine Switching: {'PASS' if results['switching'] else 'FAIL'}")
    print(f"✅ Fallback Config: {'PASS' if results['fallback_config'] else 'FAIL'}")
    
    # Overall status
    all_pass = all(results.values())
    
    if all_pass:
        print("\n🎯 GEMINI INTEGRATION: FULLY OPERATIONAL")
        print("✅ Gemini API key working")
        print("✅ Engine router functional")
        print("✅ Switching mechanism working")
        print("✅ Fallback system ready")
        print("\n💡 The system will now:")
        print("   • Use Ollama for local AI processing (primary)")
        print("   • Automatically fallback to Gemini when Ollama fails")
        print("   • Allow manual switching between engines")
        print("   • Track usage statistics and health")
    else:
        print("\n⚠️ GEMINI INTEGRATION: PARTIAL SUCCESS")
        failed_tests = [test for test, result in results.items() if not result]
        print(f"❌ Failed tests: {', '.join(failed_tests)}")
    
    return all_pass

if __name__ == "__main__":
    main()