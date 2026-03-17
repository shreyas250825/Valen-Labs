"""
Google Gemini Engine - Three-Layer Intelligence Architecture

Layer 1: Context Intelligence (Profile Understanding)
Layer 2: Conversational Interview Intelligence  
Layer 3: Evaluation & Job Intelligence

Uses Google Gemini API for all AI operations with clean request-response abstraction.
"""

import os
import json
import logging
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-pro")
GEMINI_BASE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

if GEMINI_API_KEY:
    logger.info("✅ Gemini API key loaded")


class GeminiEngine:
    """
    Three-Layer Intelligence Architecture using Google Gemini API.
    
    Layer 1: Context Intelligence - Profile understanding and candidate context
    Layer 2: Conversational Interview Intelligence - Adaptive question generation
    Layer 3: Evaluation & Job Intelligence - Assessment and job fit analysis
    """
    
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model = GEMINI_MODEL
        self.base_url = GEMINI_BASE_URL
        
    def call_gemini(self, prompt: str, temperature: float = 0.7, max_tokens: int = 1000) -> str:
        """
        Clean request-response abstraction for Gemini API calls.
        
        Args:
            prompt: The input prompt for Gemini
            temperature: Creativity level (0.0-1.0)
            max_tokens: Maximum response length
            
        Returns:
            Generated text response
        """
        if not self.api_key:
            logger.error("Gemini API key not configured")
            return ""
        
        try:
            headers = {
                "Content-Type": "application/json",
            }
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens,
                    "topP": 0.8,
                    "topK": 10
                }
            }
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
            
            logger.info(f"🔄 Gemini request: {len(prompt)} chars")
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if "candidates" in data and len(data["candidates"]) > 0:
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                logger.info(f"✅ Gemini response: {len(content)} chars")
                return content.strip()
            else:
                logger.error("No candidates in Gemini response")
                return ""
                
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Gemini API request failed: {e}")
            return ""
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            logger.error(f"❌ Gemini response parsing failed: {e}")
            return ""
        except Exception as e:
            logger.error(f"❌ Unexpected Gemini error: {e}")
            return ""

    def generate_ideal_answer(self, question_text: str, candidate_context: Dict[str, Any]) -> str:
        """
        Generate a strong, model ("perfect") answer for a given interview question.
        Used for the report/output screen.
        """
        role = candidate_context.get("role", "Software Engineer")
        experience_level = candidate_context.get("experience_level", "Mid-Level")
        domain = candidate_context.get("domain_analysis", {}).get("primary_domain", "fullstack")
        skills = candidate_context.get("skills", [])
        skills_hint = ", ".join(skills[:8]) if isinstance(skills, list) else ""

        prompt = f"""You are an expert interviewer coach.

Create a high-quality model answer for this interview question.

Candidate target role: {experience_level} {role}
Primary domain: {domain}
Relevant skills (if helpful): {skills_hint}

Question: {question_text}

Requirements:
- Answer should sound like a real candidate (first person), not like an AI.
- Use a clear structure (context -> action -> result).
- Include 1-2 concrete examples and measurable impact when possible.
- Keep it concise: 120-220 words.
- Do NOT mention that this is a model answer. Do NOT add headings/bullets.
"""

        return self.call_gemini(prompt, temperature=0.4, max_tokens=350).strip()

    # ============================================================================
    # LAYER 1: CONTEXT INTELLIGENCE (PROFILE UNDERSTANDING)
    # ============================================================================

    def extract_candidate_context(self, resume_data: Dict[str, Any], role: str, interview_type: str) -> Dict[str, Any]:
        """
        Layer 1: Extract skills, experience level, and domain signals from resume.
        Create structured candidate context object.
        
        Args:
            resume_data: Parsed resume information
            role: Selected role for interview
            interview_type: Type of interview (technical, behavioral, mixed)
            
        Returns:
            candidate_context: Structured JSON object stored in session
        """
        logger.info("🧠 Layer 1: Extracting candidate context")
        
        # Extract basic information
        skills = resume_data.get("skills", [])
        experience_years = resume_data.get("experience_years", 0)
        education = resume_data.get("education", [])
        work_experience = resume_data.get("work_experience", [])
        
        # Determine experience level
        if experience_years < 2:
            experience_level = "Junior"
        elif experience_years < 5:
            experience_level = "Mid-Level"
        elif experience_years < 10:
            experience_level = "Senior"
        else:
            experience_level = "Lead/Principal"
        
        # Extract domain signals using Gemini
        prompt = f"""Analyze this candidate profile and extract key domain signals:

Role: {role}
Skills: {', '.join(skills)}
Experience: {experience_years} years
Work Experience: {json.dumps(work_experience[:3])}

Extract and return ONLY a JSON object with:
{{
    "primary_domain": "frontend|backend|fullstack|mobile|devops|data|ml|other",
    "technical_depth": "beginner|intermediate|advanced|expert",
    "key_technologies": ["tech1", "tech2", "tech3"],
    "specializations": ["spec1", "spec2"],
    "industry_experience": ["industry1", "industry2"]
}}"""

        response = self.call_gemini(prompt, temperature=0.2, max_tokens=500)
        
        try:
            domain_analysis = json.loads(response)
        except json.JSONDecodeError:
            # Fallback domain analysis
            domain_analysis = {
                "primary_domain": "fullstack",
                "technical_depth": "intermediate",
                "key_technologies": skills[:3],
                "specializations": [],
                "industry_experience": []
            }
        
        # Create structured candidate context
        candidate_context = {
            "role": role,
            "interview_type": interview_type,
            "experience_years": experience_years,
            "experience_level": experience_level,
            "skills": skills,
            "education": education,
            "work_experience": work_experience,
            "domain_analysis": domain_analysis,
            "created_at": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Layer 1: Context extracted - {experience_level} {role} with {len(skills)} skills")
        return candidate_context

    # ============================================================================
    # LAYER 2: CONVERSATIONAL INTERVIEW INTELLIGENCE
    # ============================================================================

    def generate_first_question(self, candidate_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Layer 2: Generate first general question based on candidate context.
        
        Args:
            candidate_context: Structured candidate context from Layer 1
            
        Returns:
            Question object with text and metadata
        """
        logger.info("🎯 Layer 2: Generating first question")
        
        role = candidate_context.get("role", "Software Engineer")
        experience_level = candidate_context.get("experience_level", "Mid-Level")
        domain_analysis = candidate_context.get("domain_analysis", {})
        
        prompt = f"""Generate the first interview question for a {experience_level} {role} candidate.

Candidate Context:
- Role: {role}
- Experience Level: {experience_level}
- Primary Domain: {domain_analysis.get('primary_domain', 'fullstack')}
- Technical Depth: {domain_analysis.get('technical_depth', 'intermediate')}

Requirements:
- Question 1 must be general and welcoming
- Professional interview tone
- Encourages candidate to share background
- Sets conversational flow

Return ONLY a JSON object:
{{
    "id": "q1",
    "text": "Your question here",
    "type": "introductory",
    "expected_intent": "background_overview",
    "difficulty": "easy"
}}"""

        response = self.call_gemini(prompt, temperature=0.3, max_tokens=300)
        
        try:
            question_data = json.loads(response)
            question_data["timestamp"] = datetime.now().isoformat()
            return question_data
        except json.JSONDecodeError:
            # Fallback first question
            return {
                "id": "q1",
                "text": f"Thank you for joining us today! Could you start by telling me about your background and experience as a {role}?",
                "type": "introductory",
                "expected_intent": "background_overview",
                "difficulty": "easy",
                "timestamp": datetime.now().isoformat()
            }

    def generate_next_question(self, candidate_context: Dict[str, Any], conversation_history: List[Dict[str, Any]], question_number: int) -> Dict[str, Any]:
        """
        Layer 2: Generate adaptive conversational questions (2-8) based on previous answers.
        
        Args:
            candidate_context: Structured candidate context
            conversation_history: Previous questions and answers
            question_number: Current question number (2-8)
            
        Returns:
            Next adaptive question object
        """
        logger.info(f"🎯 Layer 2: Generating question {question_number}/8")
        
        role = candidate_context.get("role", "Software Engineer")
        
        # Build conversation context
        context = ""
        for item in conversation_history[-4:]:  # Last 4 entries for context
            if item.get("type") == "question":
                context += f"Q{item.get('question_number', '')}: {item.get('content', '')}\n"
            elif item.get("type") == "answer":
                context += f"A{item.get('question_number', '')}: {item.get('content', '')[:200]}...\n\n"
        
        prompt = f"""Generate question #{question_number} of 8 for a {role} interview.

Candidate Context:
- Role: {role}
- Experience Level: {candidate_context.get('experience_level', 'Mid-Level')}
- Primary Domain: {candidate_context.get('domain_analysis', {}).get('primary_domain', 'fullstack')}

Previous Conversation:
{context}

Requirements:
- Question {question_number} must build on previous conversation
- Must be adaptive and conversational (not scripted)
- Professional interview tone
- Questions 2-8 must use conversation history as context

Return ONLY a JSON object:
{{
    "id": "q{question_number}",
    "text": "Your adaptive question here",
    "type": "technical|behavioral|situational|role_fit",
    "expected_intent": "specific_intent_based_on_context",
    "difficulty": "easy|medium|hard"
}}"""

        response = self.call_gemini(prompt, temperature=0.5, max_tokens=400)
        
        try:
            question_data = json.loads(response)
            question_data["timestamp"] = datetime.now().isoformat()
            return question_data
        except json.JSONDecodeError:
            # Fallback adaptive questions
            fallback_questions = {
                2: f"Based on what you've shared, what specific technologies do you work with most in your {role} role?",
                3: "Can you walk me through your approach to solving complex technical challenges?",
                4: "Tell me about a recent project that you found particularly challenging or rewarding.",
                5: "How do you handle situations when requirements change mid-project?",
                6: "Describe how you collaborate with team members when there are differing technical opinions.",
                7: "What aspects of this role and our technology stack interest you most?",
                8: "Where do you see your technical career heading in the next few years?"
            }
            
            return {
                "id": f"q{question_number}",
                "text": fallback_questions.get(question_number, "Tell me more about your experience."),
                "type": "adaptive",
                "expected_intent": "experience_exploration",
                "difficulty": "medium",
                "timestamp": datetime.now().isoformat()
            }

    # ============================================================================
    # LAYER 3: EVALUATION & JOB INTELLIGENCE
    # ============================================================================

    def evaluate_answer(self, question_text: str, answer: str, candidate_context: Dict[str, Any], conversation_history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Layer 3: Evaluate candidate's answer for technical depth, communication, and relevance.
        
        Args:
            question_text: The interview question
            answer: Candidate's response
            candidate_context: Candidate context from Layer 1
            conversation_history: Previous conversation context
            
        Returns:
            Evaluation results with scores only (no verbose explanations)
        """
        logger.info("📊 Layer 3: Evaluating answer")
        
        if not answer or len(answer.strip()) < 10:
            return {
                "technical": 20,
                "communication": 20,
                "relevance": 20,
                "expected_answer": f"A complete answer is expected. Please provide specific details about your experience, approach, or solution related to this {role} question.",
                "timestamp": datetime.now().isoformat()
            }
        
        role = candidate_context.get("role", "Software Engineer")
        experience_level = candidate_context.get("experience_level", "Mid-Level")
        
        prompt = f"""Evaluate this {experience_level} {role} interview answer objectively.

Question: {question_text}
Answer: {answer}

Provide scores (0-100) and expected answer guidance:
- Technical competency and depth
- Communication clarity and structure  
- Relevance to the question asked
- Expected answer elements that would demonstrate strong performance

Return ONLY a JSON object with scores and expected answer:
{{
    "technical": 85,
    "communication": 90,
    "relevance": 85,
    "expected_answer": "A strong answer should include: specific examples, technical details, problem-solving approach, and clear communication of the solution process."
}}"""

        response = self.call_gemini(prompt, temperature=0.1, max_tokens=200)
        
        try:
            evaluation = json.loads(response)
            evaluation["timestamp"] = datetime.now().isoformat()
            return evaluation
        except json.JSONDecodeError:
            # Fallback evaluation based on answer length and keywords
            score = min(85, max(40, len(answer.split()) * 2))
            return {
                "technical": score,
                "communication": score,
                "relevance": score,
                "expected_answer": f"For this {role} question, a strong answer should demonstrate relevant experience, specific examples, and clear technical understanding of the concepts discussed.",
                "timestamp": datetime.now().isoformat()
            }

    def generate_final_report(self, candidate_context: Dict[str, Any], conversation_history: List[Dict[str, Any]], evaluations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Layer 3: Generate comprehensive final report with scores and analysis.
        
        Args:
            candidate_context: Candidate context from Layer 1
            conversation_history: Complete conversation history
            evaluations: All answer evaluations
            
        Returns:
            Final structured report with scores only
        """
        logger.info("📋 Layer 3: Generating final report")
        
        if not evaluations:
            return {
                "overall_summary": "No evaluation data available for this session.",
                "technical_score": 0,
                "communication_score": 0,
                "relevance_score": 0,
                "recommendations": []
            }
        
        # Calculate average scores
        avg_technical = sum(e.get("technical", 0) for e in evaluations) / len(evaluations)
        avg_communication = sum(e.get("communication", 0) for e in evaluations) / len(evaluations)
        avg_relevance = sum(e.get("relevance", 0) for e in evaluations) / len(evaluations)
        
        role = candidate_context.get("role", "Software Engineer")
        experience_level = candidate_context.get("experience_level", "Mid-Level")
        
        prompt = f"""Generate final interview report for {experience_level} {role} candidate.

Performance Scores:
- Technical: {avg_technical:.1f}/100
- Communication: {avg_communication:.1f}/100  
- Relevance: {avg_relevance:.1f}/100
- Questions Answered: {len(evaluations)}

Return ONLY a JSON object with scores and brief recommendations:
{{
    "overall_summary": "Brief performance summary",
    "technical_score": {int(avg_technical)},
    "communication_score": {int(avg_communication)},
    "relevance_score": {int(avg_relevance)},
    "recommendations": ["recommendation1", "recommendation2"]
}}"""

        response = self.call_gemini(prompt, temperature=0.2, max_tokens=400)
        
        try:
            report = json.loads(response)
            return report
        except json.JSONDecodeError:
            # Fallback report
            return {
                "overall_summary": f"Completed interview with average scores: Technical {avg_technical:.1f}%, Communication {avg_communication:.1f}%, Relevance {avg_relevance:.1f}%.",
                "technical_score": int(avg_technical),
                "communication_score": int(avg_communication),
                "relevance_score": int(avg_relevance),
                "recommendations": ["Practice technical explanations", "Focus on specific examples"]
            }

    def calculate_job_fit(self, candidate_context: Dict[str, Any], job_description: Dict[str, Any]) -> Dict[str, Any]:
        """
        Layer 3: AI-Based Job Fit & Role Matching analysis.
        
        Args:
            candidate_context: Candidate context from Layer 1
            job_description: Job requirements and description
            
        Returns:
            Job fit analysis with scores and role suitability insights
        """
        logger.info("🎯 Layer 3: Calculating job fit")
        
        skills = candidate_context.get("skills", [])
        experience_years = candidate_context.get("experience_years", 0)
        role = candidate_context.get("role", "")
        domain_analysis = candidate_context.get("domain_analysis", {})
        
        required_skills = job_description.get("required_skills", [])
        job_title = job_description.get("title", "")
        required_experience = job_description.get("required_experience_years", 0)
        
        prompt = f"""Analyze job fit between candidate and position.

Candidate Profile:
- Role: {role}
- Experience: {experience_years} years
- Skills: {', '.join(skills)}
- Domain: {domain_analysis.get('primary_domain', 'fullstack')}
- Technical Depth: {domain_analysis.get('technical_depth', 'intermediate')}

Job Requirements:
- Position: {job_title}
- Required Experience: {required_experience} years
- Required Skills: {', '.join(required_skills)}

Return ONLY a JSON object with job fit scores:
{{
    "overall_fit_score": 85,
    "skill_match_percentage": 80,
    "experience_match_percentage": 90,
    "role_suitability": "Excellent fit - highly recommended",
    "missing_skills": ["skill1", "skill2"],
    "matched_skills": ["skill1", "skill2"]
}}"""

        response = self.call_gemini(prompt, temperature=0.2, max_tokens=400)
        
        try:
            analysis = json.loads(response)
            analysis["timestamp"] = datetime.now().isoformat()
            return analysis
        except json.JSONDecodeError:
            # Fallback analysis
            skill_overlap = len(set(skills) & set(required_skills))
            skill_match = (skill_overlap / len(required_skills) * 100) if required_skills else 50
            exp_match = min(100, (experience_years / required_experience * 100)) if required_experience > 0 else 75
            
            return {
                "overall_fit_score": round((skill_match + exp_match) / 2),
                "skill_match_percentage": round(skill_match),
                "experience_match_percentage": round(exp_match),
                "role_suitability": "Good fit with development needed",
                "missing_skills": list(set(required_skills) - set(skills)),
                "matched_skills": list(set(skills) & set(required_skills)),
                "timestamp": datetime.now().isoformat()
            }

    def generate_aptitude_questions(self, difficulty: str = "medium", count: int = 10) -> List[Dict[str, Any]]:
        """
        Layer 3: Generate aptitude and logical reasoning questions for assessment.
        
        Args:
            difficulty: easy, medium, hard
            count: Number of questions to generate
            
        Returns:
            List of aptitude questions with problem-solving and analytical evaluation
        """
        logger.info(f"🧠 Layer 3: Generating {count} aptitude questions")
        
        prompt = f"""Generate {count} aptitude questions for technical interview assessment.

Requirements:
- Difficulty: {difficulty}
- Focus: problem-solving, analytical thinking, logical reasoning
- Types: quantitative reasoning, logical puzzles, pattern recognition
- Each question: 4 multiple choice options
- Include correct answer and reasoning

Return ONLY a JSON array:
[
    {{
        "id": "apt_1",
        "question": "Question text here",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "correct_answer": "A) Option 1",
        "explanation": "Step-by-step reasoning",
        "type": "quantitative|logical|pattern|analytical",
        "difficulty": "{difficulty}"
    }}
]"""

        response = self.call_gemini(prompt, temperature=0.4, max_tokens=2000)
        
        try:
            questions = json.loads(response)
            for i, q in enumerate(questions):
                q["id"] = f"apt_{i+1}"
                q["timestamp"] = datetime.now().isoformat()
            return questions
        except json.JSONDecodeError:
            # Return fallback questions
            return [{
                "id": "apt_1",
                "question": "If a development team of 4 can complete a feature in 6 days, how many days will it take for 6 developers?",
                "options": ["A) 4 days", "B) 3 days", "C) 5 days", "D) 2 days"],
                "correct_answer": "A) 4 days",
                "explanation": "Work = People × Days. 4×6 = 24 person-days. For 6 people: 24÷6 = 4 days",
                "type": "quantitative",
                "difficulty": difficulty,
                "timestamp": datetime.now().isoformat()
            }]

    def evaluate_aptitude_answer(self, question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
        """
        Evaluate aptitude question answer with exact matching.
        
        Args:
            question: Question object with correct answer
            user_answer: User's selected answer
            
        Returns:
            Evaluation result with correctness and score
        """
        correct_answer = question.get("correct_answer", "")
        explanation = question.get("explanation", "")
        
        # Exact match for aptitude questions
        is_correct = user_answer.strip().lower() == correct_answer.lower()
        
        score = 100 if is_correct else 0
        
        return {
            "correct": is_correct,
            "score": score,
            "correct_answer": correct_answer,
            "explanation": explanation,
            "user_answer": user_answer
        }
