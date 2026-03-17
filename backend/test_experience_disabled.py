#!/usr/bin/env python3
"""
Test script to verify experience parsing is disabled
This ensures no "8 months = 8 years" issues during AWS ImpactX Challenge
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.resume_service import ResumeService
from unittest.mock import Mock

def test_experience_parsing_disabled():
    """Test that experience parsing returns safe defaults"""
    
    # Create mock database session
    mock_db = Mock()
    service = ResumeService(mock_db)
    
    # Test with various problematic texts that previously caused issues
    test_cases = [
        "I have 8 months of experience in Python development",
        "Working for 6 months at Google as Software Engineer", 
        "Experience: 10 months in machine learning",
        "2 years and 4 months of professional experience",
        "Started working 3 months ago at Microsoft"
    ]
    
    print("🧪 Testing Experience Parsing (Should be DISABLED)")
    print("=" * 60)
    
    all_passed = True
    
    for i, test_text in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test_text[:50]}...")
        
        # Extract experience
        result = service._extract_experience(test_text)
        
        # Check that it returns safe defaults
        expected_years = 2.0
        expected_level = "Mid-Level"
        
        if result["years_experience"] == expected_years:
            print(f"✅ Years: {result['years_experience']} (Safe default)")
        else:
            print(f"❌ Years: {result['years_experience']} (Expected: {expected_years})")
            all_passed = False
        
        if result["level"] == expected_level:
            print(f"✅ Level: {result['level']} (Safe default)")
        else:
            print(f"❌ Level: {result['level']} (Expected: {expected_level})")
            all_passed = False
        
        if len(result["companies"]) == 0 and len(result["positions"]) == 0:
            print("✅ No parsing of companies/positions (Safe)")
        else:
            print(f"❌ Still parsing companies/positions: {result['companies']}, {result['positions']}")
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎯 SUCCESS: Experience parsing is properly DISABLED")
        print("✅ Safe for AWS ImpactX Challenge presentation!")
    else:
        print("❌ FAILURE: Experience parsing is still active")
        print("⚠️ Risk of embarrassing parsing errors during presentation!")
    
    print("\n📋 Summary:")
    print("• Experience parsing: DISABLED")
    print("• Default experience: 2.0 years")
    print("• Default level: Mid-Level") 
    print("• Company/position parsing: DISABLED")
    print("• Safe for demo: ✅")
    
    return all_passed

if __name__ == "__main__":
    success = test_experience_parsing_disabled()
    sys.exit(0 if success else 1)