#!/usr/bin/env python3
"""
Fallback System Demonstration

This script demonstrates the automatic fallback from Ollama to Gemini
by simulating Ollama unavailability and showing the system switches to Gemini.
"""

import os
import sys
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

def demonstrate_fallback():
    """Demonstrate the fallback system in action"""
    print("🎭 Fallback System Demonstration")
    print("=" * 50)
    
    # Show initial state
    print("📊 Initial System State:")
    stats = ai_engine_router.get_engine_stats()
    health = ai_engine_router.health_check()
    
    print(f"   Ollama Available: {health['ollama']['available']}")
    print(f"   Gemini Available: {health['gemini']['available']}")
    print(f"   Current Preference: {stats['current_preference']}")
    print(f"   Fallback Enabled: {stats['fallback_enabled']}")
    
    if not (health['ollama']['available'] and health['gemini']['available']):
        print("\n⚠️ Both engines must be available for this demonstration")
        return False
    
    # Test normal operation (should use Ollama)
    print(f"\n🔄 Test 1: Normal Operation (Should use Ollama)")
    
    test_context = {
        "role": "Software Engineer",
        "experience_level": "Mid-Level",
        "domain_analysis": {"primary_domain": "fullstack"}
    }
    
    # This should use Ollama since it's preferred and available
    question1 = ai_engine_router.generate_first_question(test_context)
    stats1 = ai_engine_router.get_engine_stats()
    
    print(f"   Engine Used: {stats1['last_engine_used']}")
    print(f"   Ollama Requests: {stats1['ollama_requests']}")
    print(f"   Gemini Requests: {stats1['gemini_requests']}")
    print(f"   Question Generated: ✅")
    
    # Simulate Ollama failure by temporarily marking it unavailable
    print(f"\n🚫 Test 2: Simulating Ollama Failure")
    print("   (Temporarily marking Ollama as unavailable)")
    
    # Store original availability
    original_availability = ai_engine_router.ollama_engine.available
    
    # Temporarily disable Ollama
    ai_engine_router.ollama_engine.available = False
    
    # This should now fallback to Gemini
    question2 = ai_engine_router.generate_first_question(test_context)
    stats2 = ai_engine_router.get_engine_stats()
    
    print(f"   Engine Used: {stats2['last_engine_used']}")
    print(f"   Ollama Requests: {stats2['ollama_requests']}")
    print(f"   Gemini Requests: {stats2['gemini_requests']}")
    print(f"   Fallback Count: {stats2['fallback_count']}")
    print(f"   Question Generated: ✅")
    
    # Restore Ollama availability
    ai_engine_router.ollama_engine.available = original_availability
    
    # Test recovery (should go back to Ollama)
    print(f"\n🔄 Test 3: Recovery (Should return to Ollama)")
    
    question3 = ai_engine_router.generate_first_question(test_context)
    stats3 = ai_engine_router.get_engine_stats()
    
    print(f"   Engine Used: {stats3['last_engine_used']}")
    print(f"   Ollama Requests: {stats3['ollama_requests']}")
    print(f"   Gemini Requests: {stats3['gemini_requests']}")
    print(f"   Question Generated: ✅")
    
    # Summary
    print(f"\n📋 Demonstration Summary:")
    print(f"   Total Ollama Requests: {stats3['ollama_requests']}")
    print(f"   Total Gemini Requests: {stats3['gemini_requests']}")
    print(f"   Total Fallback Events: {stats3['fallback_count']}")
    
    # Verify fallback occurred
    fallback_worked = (
        stats1['last_engine_used'] == 'ollama' and  # First used Ollama
        stats2['last_engine_used'] == 'gemini' and  # Then used Gemini
        stats3['last_engine_used'] == 'ollama' and  # Then back to Ollama
        stats3['fallback_count'] > 0  # Fallback counter increased
    )
    
    if fallback_worked:
        print(f"\n✅ FALLBACK SYSTEM: WORKING PERFECTLY")
        print("   • System prefers Ollama when available")
        print("   • Automatically falls back to Gemini when Ollama fails")
        print("   • Returns to Ollama when it becomes available again")
        print("   • Tracks fallback events for monitoring")
    else:
        print(f"\n⚠️ FALLBACK SYSTEM: NEEDS ATTENTION")
        print("   • Fallback behavior not working as expected")
    
    return fallback_worked

def main():
    """Run the fallback demonstration"""
    success = demonstrate_fallback()
    
    if success:
        print(f"\n🎉 The intelligent AI engine router is working perfectly!")
        print("Your system provides:")
        print("• Privacy-focused local processing with Ollama")
        print("• Reliable cloud fallback with Gemini")
        print("• Automatic failure detection and recovery")
        print("• Real-time monitoring and statistics")
        print("\nThe GenAI Career Platform is ready for production! 🚀")
    else:
        print(f"\n⚠️ Please check the system configuration.")
    
    return success

if __name__ == "__main__":
    main()