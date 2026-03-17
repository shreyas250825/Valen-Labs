#!/usr/bin/env python3
"""
Test script to verify that resume experience parsing defaults to 12 months (1 year)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.resume_service import ResumeService
from app.database import get_db

def test_experience_default():
    """Test that experience defaults to 1 year (12 months) when no experience is found"""
    
    print("🧪 Testing Experience Default Value")
    print("=" * 50)
    
    # Create a mock database session
    db = next(get_db())
    resume_service = ResumeService(db)
    
    # Test with a resume that has no explicit experience mentioned
    test_resume_text = """
    John Doe
    Software Developer
    
    Skills:
    - Python
    - JavaScript
    - React
    - SQL
    
    Education:
    Bachelor of Computer Science
    University of Technology
    
    Projects:
    - Built a web application using React and Node.js
    - Developed a machine learning model for data analysis
    """
    
    print("📄 Testing resume with no explicit experience...")
    parsed_data = resume_service._extract_resume_data(test_resume_text)
    
    experience_years = parsed_data.get('experience_years', 0)
    experience_level = parsed_data.get('experience', {}).get('level', 'Unknown')
    
    print(f"   📅 Experience Years: {experience_years}")
    print(f"   🏆 Experience Level: {experience_level}")
    
    # Verify the default is 1.0 (12 months)
    if experience_years == 1.0:
        print("   ✅ Default experience correctly set to 1 year (12 months)")
    else:
        print(f"   ❌ Expected 1.0 years, got {experience_years}")
        return False
    
    # Test with explicit months
    test_resume_with_months = """
    Jane Smith
    Junior Developer
    
    Experience: 6 months of software development
    
    Skills:
    - Python
    - Django
    - PostgreSQL
    """
    
    print("\n📄 Testing resume with 6 months experience...")
    parsed_data_months = resume_service._extract_resume_data(test_resume_with_months)
    
    experience_years_months = parsed_data_months.get('experience_years', 0)
    experience_level_months = parsed_data_months.get('experience', {}).get('level', 'Unknown')
    
    print(f"   📅 Experience Years: {experience_years_months}")
    print(f"   🏆 Experience Level: {experience_level_months}")
    
    # Verify 6 months = 0.5 years
    expected_years = 6 / 12.0  # 0.5
    if abs(experience_years_months - expected_years) < 0.1:
        print("   ✅ 6 months correctly converted to 0.5 years")
    else:
        print(f"   ❌ Expected {expected_years} years, got {experience_years_months}")
        return False
    
    # Test with explicit years
    test_resume_with_years = """
    Bob Johnson
    Senior Developer
    
    5 years of experience in software development
    
    Skills:
    - Java
    - Spring Boot
    - MySQL
    """
    
    print("\n📄 Testing resume with 5 years experience...")
    parsed_data_years = resume_service._extract_resume_data(test_resume_with_years)
    
    experience_years_explicit = parsed_data_years.get('experience_years', 0)
    experience_level_explicit = parsed_data_years.get('experience', {}).get('level', 'Unknown')
    
    print(f"   📅 Experience Years: {experience_years_explicit}")
    print(f"   🏆 Experience Level: {experience_level_explicit}")
    
    # Verify 5 years is parsed correctly
    if experience_years_explicit == 5:
        print("   ✅ 5 years experience correctly parsed")
    else:
        print(f"   ❌ Expected 5 years, got {experience_years_explicit}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All Experience Default Tests Passed!")
    print("✅ Default experience: 1 year (12 months)")
    print("✅ Months parsing: Working correctly")
    print("✅ Years parsing: Working correctly")
    
    return True

if __name__ == "__main__":
    try:
        success = test_experience_default()
        if success:
            print("\n🚀 Experience Default Test: SUCCESS")
            sys.exit(0)
        else:
            print("\n❌ Experience Default Test: FAILED")
            sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test failed with error: {e}")
        sys.exit(1)