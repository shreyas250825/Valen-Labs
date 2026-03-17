# backend/app/constants.py
from enum import Enum

class InterviewType(str, Enum):
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical" 
    MIXED = "mixed"

class InterviewRound(str, Enum):
    HR_ROUND = "hr_round"
    TECHNICAL_ROUND = "technical_round"
    FINAL_ROUND = "final_round"

class Roles(str, Enum):
    SOFTWARE_ENGINEER = "software_engineer"
    FRONTEND_DEVELOPER = "frontend_developer" 
    BACKEND_DEVELOPER = "backend_developer"
    DATA_SCIENTIST = "data_scientist"
    ML_ENGINEER = "ml_engineer"
    PRODUCT_MANAGER = "product_manager"

# Question bank for different roles
QUESTION_BANK = {
    Roles.SOFTWARE_ENGINEER: {
        InterviewType.TECHNICAL: [
            "Explain the concept of object-oriented programming and its main principles.",
            "What are the differences between SQL and NoSQL databases?",
            "How would you optimize a slow database query?",
            "Explain the concept of RESTful APIs and their constraints.",
            "What is the difference between synchronous and asynchronous programming?",
            "How do you handle memory management in your applications?",
        ],
        InterviewType.BEHAVIORAL: [
            "Tell me about a challenging project you worked on and how you overcame the challenges.",
            "How do you handle disagreements with team members?",
            "Describe a time when you had to learn a new technology quickly.",
        ]
    },
    Roles.FRONTEND_DEVELOPER: {
        InterviewType.TECHNICAL: [
            "Explain the difference between let, const, and var in JavaScript.",
            "How does the virtual DOM work in React?",
            "What are CSS preprocessors and why would you use them?",
            "Explain the concept of responsive web design.",
            "How do you optimize web performance?",
        ],
        InterviewType.BEHAVIORAL: [
            "How do you ensure your code is accessible to all users?",
            "Tell me about a UI/UX challenge you faced and how you solved it.",
            "How do you stay updated with frontend technologies?",
        ]
    },
    Roles.BACKEND_DEVELOPER: {
        InterviewType.TECHNICAL: [
            "Explain the difference between monolithic and microservices architecture.",
            "How do you handle database migrations?",
            "What are design patterns and can you give examples?",
            "How do you implement authentication and authorization?",
            "Explain the concept of caching and its benefits.",
        ],
        InterviewType.BEHAVIORAL: [
            "How do you approach debugging a complex issue?",
            "Tell me about a time you optimized application performance.",
            "How do you ensure code security in your applications?",
        ]
    },
    Roles.DATA_SCIENTIST: {
        InterviewType.TECHNICAL: [
            "Explain the bias-variance tradeoff in machine learning.",
            "What's the difference between supervised and unsupervised learning?",
            "How would you handle missing values in a dataset?",
            "Explain the concept of feature engineering.",
            "What evaluation metrics would you use for a classification problem?",
        ],
        InterviewType.BEHAVIORAL: [
            "How do you ensure your models are fair and unbiased?",
            "Describe your process for cleaning and preparing data.",
            "How do you communicate technical findings to non-technical stakeholders?",
        ]
    },
    Roles.ML_ENGINEER: {
        InterviewType.TECHNICAL: [
            "How do you deploy machine learning models to production?",
            "Explain the difference between batch and online learning.",
            "How do you handle model drift in production?",
            "What are the challenges of scaling ML systems?",
            "How do you monitor and maintain ML model performance?",
        ],
        InterviewType.BEHAVIORAL: [
            "How do you balance model accuracy with inference speed?",
            "Tell me about a time you had to explain an ML concept to a non-technical person.",
            "How do you approach A/B testing for ML models?",
        ]
    },
    Roles.PRODUCT_MANAGER: {
        InterviewType.TECHNICAL: [
            "How do you prioritize features in a product roadmap?",
            "What metrics do you use to measure product success?",
            "How do you conduct user research and incorporate findings?",
            "Explain your approach to product-market fit.",
        ],
        InterviewType.BEHAVIORAL: [
            "How do you handle conflicting priorities from different stakeholders?",
            "Tell me about a product launch that didn't go as planned.",
            "How do you foster collaboration between engineering and product teams?",
        ]
    }
}
