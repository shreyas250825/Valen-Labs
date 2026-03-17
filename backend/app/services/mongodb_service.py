"""
MongoDB Service for GenAI Career Intelligence Platform
Demo implementation for AWS ImpactX Challenge presentation
"""

import os
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
import logging

# Optional imports for MongoDB - fallback to demo mode if not available
try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False
    # Create dummy classes for type hints
    class MongoClient:
        pass
    class ConnectionFailure(Exception):
        pass
    class ServerSelectionTimeoutError(Exception):
        pass

logger = logging.getLogger(__name__)

class MongoDBService:
    """MongoDB Service with demo mode for presentations"""
    
    def __init__(self):
        self.mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/genai_career')
        self.database_name = os.getenv('MONGODB_DATABASE', 'genai_career')
        self.demo_mode = os.getenv('DEMO_MODE', 'true').lower() == 'true'
        
        # Demo storage directory
        self.demo_storage_path = os.path.join(os.getcwd(), 'demo_database')
        os.makedirs(self.demo_storage_path, exist_ok=True)
        
        # Initialize collections
        self.collections = {
            'interview_sessions': 'interview_sessions',
            'job_fit_analyses': 'job_fit_analyses',
            'user_profiles': 'user_profiles',
            'aptitude_assessments': 'aptitude_assessments',
            'resume_analyses': 'resume_analyses',
            'system_analytics': 'system_analytics'
        }
        
        # Initialize MongoDB client
        self.client = None
        self.db = None
        self._initialize_mongodb()
        
        # Load demo data if in demo mode
        if self.demo_mode:
            self._load_demo_data()
    
    def _initialize_mongodb(self):
        """Initialize MongoDB connection with fallback to demo mode"""
        try:
            if not self.demo_mode and MONGODB_AVAILABLE:
                self.client = MongoClient(
                    self.mongodb_uri,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000
                )
                # Test connection
                self.client.admin.command('ping')
                self.db = self.client[self.database_name]
                logger.info(f"✅ Connected to MongoDB: {self.database_name}")
            else:
                if not MONGODB_AVAILABLE:
                    logger.info("🎭 MongoDB driver not available - running in DEMO MODE")
                else:
                    logger.info("🎭 Running in DEMO MODE - using local JSON storage")
                self.demo_mode = True
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.warning(f"⚠️ MongoDB connection failed, switching to demo mode: {e}")
            self.demo_mode = True
            self.client = None
            self.db = None
        except Exception as e:
            logger.warning(f"⚠️ MongoDB initialization failed, switching to demo mode: {e}")
            self.demo_mode = True
            self.client = None
            self.db = None
    
    def _load_demo_data(self):
        """Load demo data into local storage"""
        try:
            # Sample data for demo
            demo_data = {
                "interview_sessions": [
                    {
                        "_id": "demo_interview_001",
                        "candidateName": "Alex Johnson",
                        "role": "Software Engineer",
                        "interviewType": "Technical Interview",
                        "score": 88,
                        "feedback": "Strong technical skills, excellent problem-solving approach",
                        "createdAt": datetime.now().isoformat(),
                        "duration": 45,
                        "questions": [
                            {
                                "question": "Explain the difference between REST and GraphQL APIs",
                                "answer": "REST uses multiple endpoints while GraphQL uses a single endpoint with flexible queries",
                                "score": 9,
                                "feedback": "Excellent understanding of API architectures"
                            }
                        ],
                        "overallAssessment": {
                            "technical": 90,
                            "communication": 85,
                            "problemSolving": 88,
                            "confidence": 87
                        },
                        "demo_mode": True
                    },
                    {
                        "_id": "demo_interview_002",
                        "candidateName": "Sarah Chen",
                        "role": "Data Scientist",
                        "interviewType": "Technical Interview",
                        "score": 92,
                        "feedback": "Outstanding analytical skills and ML knowledge",
                        "createdAt": datetime.now().isoformat(),
                        "duration": 50,
                        "questions": [
                            {
                                "question": "How would you handle missing data in a machine learning dataset?",
                                "answer": "Multiple approaches: imputation, deletion, or using algorithms that handle missing values naturally",
                                "score": 10,
                                "feedback": "Comprehensive understanding of data preprocessing"
                            }
                        ],
                        "overallAssessment": {
                            "technical": 95,
                            "communication": 88,
                            "problemSolving": 93,
                            "confidence": 90
                        },
                        "demo_mode": True
                    }
                ],
                "job_fit_analyses": [
                    {
                        "_id": "demo_jobfit_001",
                        "candidateName": "Alex Johnson",
                        "targetRole": "Senior Software Engineer",
                        "overallFitScore": 87,
                        "skillMatchPercentage": 85,
                        "experienceMatchPercentage": 90,
                        "recommendation": "Excellent Fit",
                        "confidenceScore": 94,
                        "matchedSkills": ["Python", "JavaScript", "React", "Node.js", "AWS", "Docker"],
                        "missingSkills": ["Kubernetes", "System Design", "Microservices"],
                        "experienceYears": 2.0,
                        "createdAt": datetime.now().isoformat(),
                        "demo_mode": True
                    }
                ],
                "user_profiles": [
                    {
                        "_id": "demo_user_001",
                        "name": "Alex Johnson",
                        "email": "alex.johnson@demo.com",
                        "currentRole": "Software Engineer",
                        "experienceYears": 2.0,
                        "skills": ["Python", "JavaScript", "React", "Node.js", "AWS"],
                        "statistics": {
                            "totalInterviews": 5,
                            "averageScore": 86,
                            "bestScore": 92,
                            "improvementRate": 18
                        },
                        "createdAt": datetime.now().isoformat(),
                        "demo_mode": True
                    }
                ],
                "system_analytics": [
                    {
                        "_id": "demo_analytics_001",
                        "date": datetime.now().isoformat(),
                        "metrics": {
                            "totalUsers": 1247,
                            "activeUsers": 89,
                            "interviewsCompleted": 156,
                            "jobFitAnalyses": 203,
                            "averageScore": 84.2,
                            "aiEngineUsage": {
                                "ollama": 145,
                                "gemini": 12,
                                "fallbackCount": 3
                            }
                        },
                        "demo_mode": True
                    }
                ]
            }
            
            # Save demo data to local files
            for collection_name, documents in demo_data.items():
                collection_path = os.path.join(self.demo_storage_path, f"{collection_name}.json")
                with open(collection_path, 'w') as f:
                    json.dump(documents, f, indent=2)
            
            logger.info("📊 Demo data loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load demo data: {e}")
    
    def insert_interview_session(self, session_data: Dict[str, Any]) -> str:
        """Insert interview session"""
        try:
            session_data['createdAt'] = datetime.now().isoformat()
            session_data['demo_mode'] = self.demo_mode
            
            if self.demo_mode:
                return self._demo_insert('interview_sessions', session_data)
            else:
                collection = self.db[self.collections['interview_sessions']]
                result = collection.insert_one(session_data)
                logger.info(f"💾 Interview session inserted: {result.inserted_id}")
                return str(result.inserted_id)
                
        except Exception as e:
            logger.error(f"❌ Failed to insert interview session: {e}")
            raise
    
    def insert_job_fit_analysis(self, analysis_data: Dict[str, Any]) -> str:
        """Insert job fit analysis"""
        try:
            analysis_data['createdAt'] = datetime.now().isoformat()
            analysis_data['demo_mode'] = self.demo_mode
            
            if self.demo_mode:
                return self._demo_insert('job_fit_analyses', analysis_data)
            else:
                collection = self.db[self.collections['job_fit_analyses']]
                result = collection.insert_one(analysis_data)
                logger.info(f"🎯 Job fit analysis inserted: {result.inserted_id}")
                return str(result.inserted_id)
                
        except Exception as e:
            logger.error(f"❌ Failed to insert job fit analysis: {e}")
            raise
    
    def insert_user_profile(self, profile_data: Dict[str, Any]) -> str:
        """Insert user profile"""
        try:
            profile_data['createdAt'] = datetime.now().isoformat()
            profile_data['updatedAt'] = datetime.now().isoformat()
            profile_data['demo_mode'] = self.demo_mode
            
            if self.demo_mode:
                return self._demo_insert('user_profiles', profile_data)
            else:
                collection = self.db[self.collections['user_profiles']]
                result = collection.insert_one(profile_data)
                logger.info(f"👤 User profile inserted: {result.inserted_id}")
                return str(result.inserted_id)
                
        except Exception as e:
            logger.error(f"❌ Failed to insert user profile: {e}")
            raise
    
    def get_user_interviews(self, candidate_name: str) -> List[Dict[str, Any]]:
        """Get all interviews for a candidate"""
        try:
            if self.demo_mode:
                return self._demo_find('interview_sessions', {"candidateName": candidate_name})
            else:
                collection = self.db[self.collections['interview_sessions']]
                return list(collection.find({"candidateName": candidate_name}))
                
        except Exception as e:
            logger.error(f"❌ Failed to get user interviews: {e}")
            return []
    
    def get_user_job_fits(self, candidate_name: str) -> List[Dict[str, Any]]:
        """Get all job fit analyses for a candidate"""
        try:
            if self.demo_mode:
                return self._demo_find('job_fit_analyses', {"candidateName": candidate_name})
            else:
                collection = self.db[self.collections['job_fit_analyses']]
                return list(collection.find({"candidateName": candidate_name}))
                
        except Exception as e:
            logger.error(f"❌ Failed to get user job fits: {e}")
            return []
    
    def get_user_profile(self, user_identifier: str) -> Optional[Dict[str, Any]]:
        """Get user profile by name or email"""
        try:
            query = {
                "$or": [
                    {"name": user_identifier},
                    {"email": user_identifier}
                ]
            }
            
            if self.demo_mode:
                results = self._demo_find('user_profiles', query)
                return results[0] if results else None
            else:
                collection = self.db[self.collections['user_profiles']]
                return collection.find_one(query)
                
        except Exception as e:
            logger.error(f"❌ Failed to get user profile: {e}")
            return None
    
    def get_system_analytics(self) -> Dict[str, Any]:
        """Get system analytics"""
        try:
            if self.demo_mode:
                analytics = self._demo_find('system_analytics', {})
                return analytics[0] if analytics else {}
            else:
                collection = self.db[self.collections['system_analytics']]
                return collection.find_one(sort=[("date", -1)]) or {}
                
        except Exception as e:
            logger.error(f"❌ Failed to get system analytics: {e}")
            return {}
    
    def update_system_analytics(self, analytics_data: Dict[str, Any]) -> bool:
        """Update system analytics"""
        try:
            analytics_data['date'] = datetime.now().isoformat()
            analytics_data['demo_mode'] = self.demo_mode
            
            if self.demo_mode:
                return self._demo_update('system_analytics', {}, analytics_data)
            else:
                collection = self.db[self.collections['system_analytics']]
                result = collection.replace_one(
                    {"date": {"$gte": datetime.now().strftime("%Y-%m-%d")}},
                    analytics_data,
                    upsert=True
                )
                return result.acknowledged
                
        except Exception as e:
            logger.error(f"❌ Failed to update system analytics: {e}")
            return False
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            if self.demo_mode:
                return self._demo_database_stats()
            else:
                return self._mongodb_database_stats()
                
        except Exception as e:
            logger.error(f"❌ Failed to get database stats: {e}")
            return {"success": False, "error": str(e)}
    
    def _demo_insert(self, collection_name: str, document: Dict[str, Any]) -> str:
        """Demo implementation of document insertion"""
        try:
            collection_path = os.path.join(self.demo_storage_path, f"{collection_name}.json")
            
            # Load existing data
            documents = []
            if os.path.exists(collection_path):
                with open(collection_path, 'r') as f:
                    documents = json.load(f)
            
            # Add new document with generated ID
            document_id = f"demo_{collection_name}_{uuid.uuid4().hex[:8]}"
            document['_id'] = document_id
            documents.append(document)
            
            # Save back to file
            with open(collection_path, 'w') as f:
                json.dump(documents, f, indent=2)
            
            logger.info(f"📁 Demo: Document inserted into {collection_name}: {document_id}")
            return document_id
            
        except Exception as e:
            logger.error(f"❌ Demo insert failed: {e}")
            raise
    
    def _demo_find(self, collection_name: str, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Demo implementation of document search"""
        try:
            collection_path = os.path.join(self.demo_storage_path, f"{collection_name}.json")
            
            if not os.path.exists(collection_path):
                return []
            
            with open(collection_path, 'r') as f:
                documents = json.load(f)
            
            # Simple query matching (for demo purposes)
            results = []
            for doc in documents:
                if self._matches_query(doc, query):
                    results.append(doc)
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Demo find failed: {e}")
            return []
    
    def _demo_update(self, collection_name: str, query: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        """Demo implementation of document update"""
        try:
            collection_path = os.path.join(self.demo_storage_path, f"{collection_name}.json")
            
            documents = []
            if os.path.exists(collection_path):
                with open(collection_path, 'r') as f:
                    documents = json.load(f)
            
            # Update or insert
            updated = False
            for i, doc in enumerate(documents):
                if self._matches_query(doc, query):
                    documents[i] = update_data
                    updated = True
                    break
            
            if not updated:
                update_data['_id'] = f"demo_{collection_name}_{uuid.uuid4().hex[:8]}"
                documents.append(update_data)
            
            # Save back to file
            with open(collection_path, 'w') as f:
                json.dump(documents, f, indent=2)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Demo update failed: {e}")
            return False
    
    def _matches_query(self, document: Dict[str, Any], query: Dict[str, Any]) -> bool:
        """Simple query matching for demo purposes"""
        if not query:
            return True
        
        for key, value in query.items():
            if key == "$or":
                # Handle $or queries
                match_found = False
                for or_condition in value:
                    if self._matches_query(document, or_condition):
                        match_found = True
                        break
                if not match_found:
                    return False
            else:
                if key not in document or document[key] != value:
                    return False
        
        return True
    
    def _demo_database_stats(self) -> Dict[str, Any]:
        """Demo database statistics"""
        try:
            stats = {
                "success": True,
                "demo_mode": True,
                "database_type": "Local JSON Storage",
                "collections": {},
                "total_documents": 0,
                "last_updated": datetime.now().isoformat()
            }
            
            for collection_name in self.collections.keys():
                collection_path = os.path.join(self.demo_storage_path, f"{collection_name}.json")
                
                if os.path.exists(collection_path):
                    with open(collection_path, 'r') as f:
                        documents = json.load(f)
                        count = len(documents)
                        stats["collections"][collection_name] = {
                            "document_count": count,
                            "file_size_kb": round(os.path.getsize(collection_path) / 1024, 2)
                        }
                        stats["total_documents"] += count
                else:
                    stats["collections"][collection_name] = {
                        "document_count": 0,
                        "file_size_kb": 0
                    }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Demo database stats failed: {e}")
            raise
    
    def _mongodb_database_stats(self) -> Dict[str, Any]:
        """Real MongoDB database statistics"""
        try:
            stats = {
                "success": True,
                "demo_mode": False,
                "database_type": "MongoDB",
                "database_name": self.database_name,
                "collections": {},
                "total_documents": 0,
                "last_updated": datetime.now().isoformat()
            }
            
            for collection_name in self.collections.keys():
                collection = self.db[self.collections[collection_name]]
                count = collection.count_documents({})
                stats["collections"][collection_name] = {
                    "document_count": count
                }
                stats["total_documents"] += count
            
            # Get database stats
            db_stats = self.db.command("dbStats")
            stats["database_size_mb"] = round(db_stats.get("dataSize", 0) / (1024 * 1024), 2)
            stats["index_size_mb"] = round(db_stats.get("indexSize", 0) / (1024 * 1024), 2)
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ MongoDB database stats failed: {e}")
            raise

# Global MongoDB service instance
mongodb_service = MongoDBService()