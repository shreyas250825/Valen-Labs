#!/usr/bin/env python3
"""
Test script to verify that resume experience parsing is conservative and doesn't pick up incorrect dates
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.resume_service import ResumeService
from app.database import get_db

def test_conservative_parsing():
    """Test that experience parsing is conservative and doesn't pick up incorrect dates"""
    
    print("🧪 Testing Conservative Experience Parsing")
    print("=" * 60)
    
    # Create a mock database session
    db = next(get_db())
    resume_service = ResumeService(db)
    
    # Test 1: Resume with education dates but no work experience
    test_resume_education_dates = """
    John Doe
    Software Developer
    
    Education:
    Bachelor of Computer Science
    University of Technology
    2016 - 2020
    
    Master of Science in Computer Science  
    Tech University
    2020 - 2022
    
    Skills:
    - Python
    - JavaScript
    - React
    - SQL
    
    Projects:
    - Built a web application using React and Node.js (2023)
    - Developed a machine learning model for data analysis (2022-2023)
    """
    
    print("📄 Testing resume with education dates (2016-2020, 2020-2022) but no work experience...")
    parsed_data = resume_service._extract_resume_data(test_resume_education_dates)
    
    experience_years = parsed_data.get('experience_years', 0)
    experience_level = parsed_data.get('experience', {}).get('level', 'Unknown')
    
    print(f"   📅 Experience Years: {experience_years}")
    print(f"   🏆 Experience Level: {experience_level}")
    
    # Should default to 1.0 since no work experience is mentioned
    if experience_years == 1.0:
        print("   ✅ Correctly ignored education dates and used default (1 year)")
    else:
        print(f"   ❌ Expected 1.0 years (default), got {experience_years}")
        return False
    
    # Test 2: Resume with project dates but no work experience
    test_resume_project_dates = """
    Jane Smith
    Frontend Developer
    
    Skills:
    - React, Vue.js, Angular
    - HTML, CSS, JavaScript
    - Node.js, Express
    
    Projects:
    Personal Portfolio Website (2022 - 2024)
    - Built using React and TypeScript
    - Deployed on Vercel
    
    E-commerce Platform (2021 - 2023)  
    - Full-stack application with React frontend
    - Node.js backend with MongoDB
    
    Education:
    Bachelor of Engineering
    State University (2018-2022)
    """
    
    print("\n📄 Testing resume with project dates (2021-2024) but no work experience...")
    parsed_data_projects = resume_service._extract_resume_data(test_resume_project_dates)
    
    experience_years_projects = parsed_data_projects.get('experience_years', 0)
    experience_level_projects = parsed_data_projects.get('experience', {}).get('level', 'Unknown')
    
    print(f"   📅 Experience Years: {experience_years_projects}")
    print(f"   🏆 Experience Level: {experience_level_projects}")
    
    # Should default to 1.0 since no work experience is mentioned
    if experience_years_projects == 1.0:
        print("   ✅ Correctly ignored project dates and used default (1 year)")
    else:
        print(f"   ❌ Expected 1.0 years (default), got {experience_years_projects}")
        return False
    
    # Test 3: Resume with actual work experience section
    test_resume_work_experience = """
    Bob Johnson
    Senior Developer
    
    Work Experience:
    
    Senior Software Engineer
    TechCorp Inc.
    January 2020 - Present
    - Led development of microservices architecture
    - Mentored junior developers
    
    Software Engineer  
    StartupXYZ
    June 2018 - December 2019
    - Built REST APIs using Node.js
    - Implemented CI/CD pipelines
    
    Skills:
    - Java, Python, JavaScript
    - AWS, Docker, Kubernetes
    
    Education:
    Computer Science Degree (2014-2018)
    """
    
    print("\n📄 Testing resume with actual work experience section (2018-Present)...")
    parsed_data_work = resume_service._extract_resume_data(test_resume_work_experience)
    
    experience_years_work = parsed_data_work.get('experience_years', 0)
    experience_level_work = parsed_data_work.get('experience', {}).get('level', 'Unknown')
    
    print(f"   📅 Experience Years: {experience_years_work}")
    print(f"   🏆 Experience Level: {experience_level_work}")
    
    # Should calculate from work dates (2018 to 2024 = ~6 years)
    if experience_years_work >= 5 and experience_years_work <= 7:
        print("   ✅ Correctly calculated experience from work dates")
    else:
        print(f"   ❌ Expected ~6 years from work dates, got {experience_years_work}")
        return False
    
    # Test 4: Resume with explicit experience statement
    test_resume_explicit = """
    Alice Brown
    Data Scientist
    
    Professional Summary:
    Data scientist with 3 years of experience in machine learning and analytics.
    
    Skills:
    - Python, R, SQL
    - TensorFlow, PyTorch
    - Pandas, NumPy
    
    Education:
    PhD in Statistics (2015-2019)
    Master's in Mathematics (2013-2015)
    """
    
    print("\n📄 Testing resume with explicit experience statement (3 years)...")
    parsed_data_explicit = resume_service._extract_resume_data(test_resume_explicit)
    
    experience_years_explicit = parsed_data_explicit.get('experience_years', 0)
    experience_level_explicit = parsed_data_explicit.get('experience', {}).get('level', 'Unknown')
    
    print(f"   📅 Experience Years: {experience_years_explicit}")
    print(f"   🏆 Experience Level: {experience_level_explicit}")
    
    # Should use the explicit 3 years
    if experience_years_explicit == 3:
        print("   ✅ Correctly used explicit experience statement")
    else:
        print(f"   ❌ Expected 3 years from explicit statement, got {experience_years_explicit}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 All Conservative Parsing Tests Passed!")
    print("✅ Education dates: Ignored correctly")
    print("✅ Project dates: Ignored correctly") 
    print("✅ Work experience dates: Parsed correctly")
    print("✅ Explicit statements: Used correctly")
    print("✅ Default fallback: Working (1 year)")
    
    return True

if __name__ == "__main__":
    try:
        success = test_conservative_parsing()
        if success:
            print("\n🚀 Conservative Parsing Test: SUCCESS")
            sys.exit(0)
        else:
            print("\n❌ Conservative Parsing Test: FAILED")
            sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test failed with error: {e}")
        sys.exit(1)