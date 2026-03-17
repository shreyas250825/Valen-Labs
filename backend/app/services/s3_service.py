"""
S3 Service for GenAI Career Intelligence Platform
Demo implementation for AWS ImpactX Challenge presentation
"""

import os
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
import logging

# Optional imports for AWS - fallback to demo mode if not available
try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False
    # Create dummy classes for type hints
    class ClientError(Exception):
        pass
    class NoCredentialsError(Exception):
        pass

logger = logging.getLogger(__name__)

class S3Service:
    """S3 Service with demo mode for presentations"""
    
    def __init__(self):
        self.bucket_name = os.getenv('AWS_S3_BUCKET', 'genai-career-demo-bucket')
        self.region = os.getenv('AWS_REGION', 'us-east-1')
        self.demo_mode = os.getenv('DEMO_MODE', 'true').lower() == 'true'
        
        # Demo storage directory
        self.demo_storage_path = os.path.join(os.getcwd(), 'demo_storage')
        os.makedirs(self.demo_storage_path, exist_ok=True)
        os.makedirs(os.path.join(self.demo_storage_path, 'resumes'), exist_ok=True)
        os.makedirs(os.path.join(self.demo_storage_path, 'reports'), exist_ok=True)
        os.makedirs(os.path.join(self.demo_storage_path, 'backups'), exist_ok=True)
        
        # Initialize S3 client
        self.s3_client = None
        self._initialize_s3_client()
    
    def _initialize_s3_client(self):
        """Initialize S3 client with fallback to demo mode"""
        try:
            if not self.demo_mode and AWS_AVAILABLE:
                self.s3_client = boto3.client(
                    's3',
                    region_name=self.region,
                    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
                )
                # Test connection
                self.s3_client.head_bucket(Bucket=self.bucket_name)
                logger.info(f"✅ Connected to S3 bucket: {self.bucket_name}")
            else:
                if not AWS_AVAILABLE:
                    logger.info("🎭 AWS SDK not available - running in DEMO MODE")
                else:
                    logger.info("🎭 Running in DEMO MODE - using local file storage")
                self.demo_mode = True
        except (ClientError, NoCredentialsError) as e:
            logger.warning(f"⚠️ S3 connection failed, switching to demo mode: {e}")
            self.demo_mode = True
            self.s3_client = None
        except Exception as e:
            logger.warning(f"⚠️ S3 initialization failed, switching to demo mode: {e}")
            self.demo_mode = True
            self.s3_client = None
    
    def upload_resume(self, user_id: str, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Upload resume file to S3 or demo storage"""
        try:
            file_key = f"resumes/{user_id}/{filename}"
            
            if self.demo_mode:
                return self._demo_upload_resume(user_id, file_content, filename, file_key)
            else:
                return self._s3_upload_resume(file_content, file_key, filename)
                
        except Exception as e:
            logger.error(f"❌ Resume upload failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "file_url": None
            }
    
    def _demo_upload_resume(self, user_id: str, file_content: bytes, filename: str, file_key: str) -> Dict[str, Any]:
        """Demo implementation of resume upload"""
        try:
            # Create user directory
            user_dir = os.path.join(self.demo_storage_path, 'resumes', user_id)
            os.makedirs(user_dir, exist_ok=True)
            
            # Save file locally
            file_path = os.path.join(user_dir, filename)
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            # Create metadata
            metadata = {
                "user_id": user_id,
                "filename": filename,
                "file_size": len(file_content),
                "upload_time": datetime.now().isoformat(),
                "file_type": filename.split('.')[-1].lower(),
                "demo_mode": True
            }
            
            # Save metadata
            metadata_path = os.path.join(user_dir, f"{filename}.metadata.json")
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            logger.info(f"📁 Demo: Resume uploaded to {file_path}")
            
            return {
                "success": True,
                "file_url": f"demo://s3/{file_key}",
                "file_size": len(file_content),
                "upload_time": metadata["upload_time"],
                "demo_mode": True,
                "local_path": file_path
            }
            
        except Exception as e:
            logger.error(f"❌ Demo resume upload failed: {e}")
            raise
    
    def _s3_upload_resume(self, file_content: bytes, file_key: str, filename: str) -> Dict[str, Any]:
        """Real S3 implementation of resume upload"""
        try:
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=file_content,
                ContentType=self._get_content_type(filename),
                Metadata={
                    'upload_time': datetime.now().isoformat(),
                    'original_filename': filename
                }
            )
            
            # Generate URL
            file_url = f"s3://{self.bucket_name}/{file_key}"
            
            logger.info(f"☁️ Resume uploaded to S3: {file_url}")
            
            return {
                "success": True,
                "file_url": file_url,
                "file_size": len(file_content),
                "upload_time": datetime.now().isoformat(),
                "demo_mode": False
            }
            
        except Exception as e:
            logger.error(f"❌ S3 resume upload failed: {e}")
            raise
    
    def store_interview_report(self, session_id: str, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store interview report to S3 or demo storage"""
        try:
            file_key = f"reports/{session_id}/interview_report.json"
            report_json = json.dumps(report_data, indent=2)
            
            if self.demo_mode:
                return self._demo_store_report(session_id, report_json, file_key)
            else:
                return self._s3_store_report(report_json, file_key)
                
        except Exception as e:
            logger.error(f"❌ Report storage failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "report_url": None
            }
    
    def _demo_store_report(self, session_id: str, report_json: str, file_key: str) -> Dict[str, Any]:
        """Demo implementation of report storage"""
        try:
            # Create session directory
            session_dir = os.path.join(self.demo_storage_path, 'reports', session_id)
            os.makedirs(session_dir, exist_ok=True)
            
            # Save report
            report_path = os.path.join(session_dir, 'interview_report.json')
            with open(report_path, 'w') as f:
                f.write(report_json)
            
            # Create summary for demo
            summary_path = os.path.join(session_dir, 'report_summary.json')
            summary = {
                "session_id": session_id,
                "report_generated": datetime.now().isoformat(),
                "file_size": len(report_json),
                "demo_mode": True,
                "storage_location": "local_demo_storage"
            }
            
            with open(summary_path, 'w') as f:
                json.dump(summary, f, indent=2)
            
            logger.info(f"📊 Demo: Report stored to {report_path}")
            
            return {
                "success": True,
                "report_url": f"demo://s3/{file_key}",
                "file_size": len(report_json),
                "generated_time": summary["report_generated"],
                "demo_mode": True,
                "local_path": report_path
            }
            
        except Exception as e:
            logger.error(f"❌ Demo report storage failed: {e}")
            raise
    
    def _s3_store_report(self, report_json: str, file_key: str) -> Dict[str, Any]:
        """Real S3 implementation of report storage"""
        try:
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=report_json,
                ContentType='application/json',
                Metadata={
                    'generated_time': datetime.now().isoformat(),
                    'content_type': 'interview_report'
                }
            )
            
            report_url = f"s3://{self.bucket_name}/{file_key}"
            
            logger.info(f"☁️ Report stored to S3: {report_url}")
            
            return {
                "success": True,
                "report_url": report_url,
                "file_size": len(report_json),
                "generated_time": datetime.now().isoformat(),
                "demo_mode": False
            }
            
        except Exception as e:
            logger.error(f"❌ S3 report storage failed: {e}")
            raise
    
    def get_file_url(self, file_key: str, expiration: int = 3600) -> Optional[str]:
        """Generate presigned URL for file access"""
        try:
            if self.demo_mode:
                return f"demo://s3/{file_key}?expires={expiration}"
            else:
                url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': file_key},
                    ExpiresIn=expiration
                )
                return url
                
        except Exception as e:
            logger.error(f"❌ URL generation failed: {e}")
            return None
    
    def list_user_files(self, user_id: str) -> Dict[str, Any]:
        """List all files for a specific user"""
        try:
            if self.demo_mode:
                return self._demo_list_user_files(user_id)
            else:
                return self._s3_list_user_files(user_id)
                
        except Exception as e:
            logger.error(f"❌ File listing failed: {e}")
            return {"success": False, "error": str(e), "files": []}
    
    def _demo_list_user_files(self, user_id: str) -> Dict[str, Any]:
        """Demo implementation of file listing"""
        try:
            files = []
            user_dir = os.path.join(self.demo_storage_path, 'resumes', user_id)
            
            if os.path.exists(user_dir):
                for filename in os.listdir(user_dir):
                    if not filename.endswith('.metadata.json'):
                        file_path = os.path.join(user_dir, filename)
                        metadata_path = os.path.join(user_dir, f"{filename}.metadata.json")
                        
                        file_info = {
                            "filename": filename,
                            "file_size": os.path.getsize(file_path),
                            "last_modified": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
                            "file_url": f"demo://s3/resumes/{user_id}/{filename}"
                        }
                        
                        # Add metadata if available
                        if os.path.exists(metadata_path):
                            with open(metadata_path, 'r') as f:
                                metadata = json.load(f)
                                file_info.update(metadata)
                        
                        files.append(file_info)
            
            return {
                "success": True,
                "user_id": user_id,
                "file_count": len(files),
                "files": files,
                "demo_mode": True
            }
            
        except Exception as e:
            logger.error(f"❌ Demo file listing failed: {e}")
            raise
    
    def _s3_list_user_files(self, user_id: str) -> Dict[str, Any]:
        """Real S3 implementation of file listing"""
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=f"resumes/{user_id}/"
            )
            
            files = []
            for obj in response.get('Contents', []):
                files.append({
                    "filename": obj['Key'].split('/')[-1],
                    "file_size": obj['Size'],
                    "last_modified": obj['LastModified'].isoformat(),
                    "file_url": f"s3://{self.bucket_name}/{obj['Key']}"
                })
            
            return {
                "success": True,
                "user_id": user_id,
                "file_count": len(files),
                "files": files,
                "demo_mode": False
            }
            
        except Exception as e:
            logger.error(f"❌ S3 file listing failed: {e}")
            raise
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics for demo purposes"""
        try:
            if self.demo_mode:
                return self._demo_storage_stats()
            else:
                return self._s3_storage_stats()
                
        except Exception as e:
            logger.error(f"❌ Storage stats failed: {e}")
            return {"success": False, "error": str(e)}
    
    def _demo_storage_stats(self) -> Dict[str, Any]:
        """Demo storage statistics"""
        try:
            stats = {
                "success": True,
                "demo_mode": True,
                "storage_type": "Local Demo Storage",
                "total_files": 0,
                "total_size_bytes": 0,
                "resumes_count": 0,
                "reports_count": 0,
                "last_updated": datetime.now().isoformat()
            }
            
            # Count files and calculate sizes
            for root, dirs, files in os.walk(self.demo_storage_path):
                for file in files:
                    if not file.endswith('.metadata.json'):
                        file_path = os.path.join(root, file)
                        file_size = os.path.getsize(file_path)
                        stats["total_files"] += 1
                        stats["total_size_bytes"] += file_size
                        
                        if 'resumes' in root:
                            stats["resumes_count"] += 1
                        elif 'reports' in root:
                            stats["reports_count"] += 1
            
            # Convert bytes to human readable
            stats["total_size_mb"] = round(stats["total_size_bytes"] / (1024 * 1024), 2)
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Demo storage stats failed: {e}")
            raise
    
    def _s3_storage_stats(self) -> Dict[str, Any]:
        """Real S3 storage statistics"""
        try:
            # This would require CloudWatch metrics in real implementation
            # For now, return basic bucket info
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
            
            total_size = sum(obj['Size'] for obj in response.get('Contents', []))
            total_files = len(response.get('Contents', []))
            
            return {
                "success": True,
                "demo_mode": False,
                "storage_type": "Amazon S3",
                "bucket_name": self.bucket_name,
                "total_files": total_files,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ S3 storage stats failed: {e}")
            raise
    
    def _get_content_type(self, filename: str) -> str:
        """Get content type based on file extension"""
        ext = filename.lower().split('.')[-1]
        content_types = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'json': 'application/json'
        }
        return content_types.get(ext, 'application/octet-stream')

# Global S3 service instance
s3_service = S3Service()