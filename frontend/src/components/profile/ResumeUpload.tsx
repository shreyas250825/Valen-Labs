import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import ResumeReview from './ResumeReview';

import { API_BASE_URL } from '../../services/api';
import { logResumeParsedToBackend, logResumeToBackend } from '../../services/backendSupabase';

const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [resumeSupabaseId, setResumeSupabaseId] = useState<string | null>(null);

    const handleFileUpload = useCallback(async (file: File) => {
    // Validate file type
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadedFile(null);
    
    try {
      // Create a resume row in Supabase first (so parsed data can reference it)
      let resumeId: string | null = null;
      try {
        const created = await logResumeToBackend(file.name);
        resumeId = created?.id ?? null;
        if (resumeId) setResumeSupabaseId(resumeId);
      } catch (e) {
        // If this fails, parsing can still proceed; we'll try again on Continue.
        console.error("Failed to create resume row in backend:", e);
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Use the centralized API service
      const response = await fetch(`${API_BASE_URL}/api/resume/parse`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header - let the browser set it with the correct boundary
        },
        credentials: 'include' // Include cookies if using session-based auth
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to upload resume' }));
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.parsed_data) {
        throw new Error('Failed to parse resume data');
      }
      
      // Store parsed data in state and localStorage for persistence
      setParsedData(data.parsed_data);
      localStorage.setItem('resumeParsedData', JSON.stringify(data.parsed_data));
      setUploadedFile(file.name);
      setShowReview(true);

      // Non-blocking: persist parsed data if resumeId is known
      if (resumeId) {
        logResumeParsedToBackend({
          resume_id: resumeId,
          full_name: data.parsed_data?.full_name ?? data.parsed_data?.name ?? null,
          skills: data.parsed_data?.skills ?? null,
          education: Array.isArray(data.parsed_data?.education)
            ? data.parsed_data.education.join("\n")
            : data.parsed_data?.education ?? null,
          experience:
            typeof data.parsed_data?.experience === "string"
              ? data.parsed_data.experience
              : data.parsed_data?.experience_years != null
                ? `${data.parsed_data.experience_years} years`
                : null,
          projects: data.parsed_data?.projects ?? null,
          certifications: data.parsed_data?.certifications ?? null,
        }).catch((e) => console.error("Failed to store parsed resume:", e));
      }
    } catch (err: any) {
      console.error('Resume upload error:', err);
      setError(err.message || 'Failed to upload and parse resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [setIsUploading, setError, setParsedData, setUploadedFile, setShowReview, API_BASE_URL]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  if (isUploading) {
    return <LoadingSpinner size="xl" text="Processing Your Resume..." />;
  }

  // Show resume review after successful upload
  if (showReview && parsedData) {
    return (
      <ResumeReview
        parsedData={parsedData}
        onContinue={() => {
          // Store in localStorage and navigate
          console.log('Continue clicked, navigating to /setup with parsedData:', parsedData);
          localStorage.setItem('resumeParsedData', JSON.stringify(parsedData));
          // Navigate with state
          navigate('/setup', { 
            state: { parsedData },
            replace: false 
          });

          // Non-blocking: if resume id is known, ensure parsed data is stored
          if (resumeSupabaseId) {
            logResumeParsedToBackend({
              resume_id: resumeSupabaseId,
              full_name: parsedData?.full_name ?? parsedData?.name ?? null,
              skills: parsedData?.skills ?? null,
              education: Array.isArray(parsedData?.education) ? parsedData.education.join("\n") : parsedData?.education ?? null,
              experience:
                typeof parsedData?.experience === "string"
                  ? parsedData.experience
                  : parsedData?.experience_years != null
                    ? `${parsedData.experience_years} years`
                    : null,
              projects: parsedData?.projects ?? null,
              certifications: parsedData?.certifications ?? null,
            }).catch((e) => console.error("Failed to store parsed resume on continue:", e));
          }
        }}
      />
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 md:p-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-sky-600 rounded-2xl mb-6 transform hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-6xl font-black tracking-tighter uppercase mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Upload Your Resume
        </h2>
        <p className="text-slate-400 text-lg font-medium">
          We'll extract your skills and experience to personalize your interview
        </p>
      </div>

      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-[32px] p-16 text-center transition-all duration-300 ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10 scale-105'
            : 'border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5'
        }`}
      >
      <input
        type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="resume-upload"
      />
      <label 
        htmlFor="resume-upload"
          className={`inline-flex flex-col items-center cursor-pointer transition-all duration-300 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
          }`}
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-sky-600 rounded-2xl blur-xl opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div>
            <div className="relative bg-gradient-to-br from-purple-600 to-sky-600 p-6 rounded-2xl transform hover:scale-110 transition-transform">
              <Upload className="w-12 h-12 text-white" />
            </div>
          </div>
          <span className="text-white font-black text-xl mb-3 uppercase tracking-widest">Click or Drag & Drop</span>
          <span className="text-slate-400 text-base font-medium">PDF, DOCX, or TXT (Max 10MB)</span>
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </span>
            <span className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>DOCX</span>
            </span>
            <span className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>TXT</span>
            </span>
          </div>
      </label>
      </div>

      {/* Success Message */}
      {uploadedFile && !error && (
        <div className="mt-8 p-6 bg-green-500/20 border border-green-500/50 rounded-2xl">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-green-300 font-bold text-lg mb-1">Successfully Uploaded!</h3>
              <p className="text-green-200 text-sm mb-2">{uploadedFile}</p>
              <p className="text-gray-400 text-sm">Redirecting to interview...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-8 p-6 bg-red-500/20 border border-red-500/50 rounded-2xl">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-red-300 font-bold text-lg mb-2">Upload Failed</h3>
              <p className="text-red-200 text-sm mb-3">{error}</p>
              <p className="text-gray-400 text-sm">
                Don't worry, we'll use a default profile and you can still proceed to the interview.
              </p>
              <button
                onClick={() => {
                  setError(null);
                  const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="mt-4 text-red-300 hover:text-red-200 text-sm font-semibold flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Option */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            // Navigate to manual setup
            navigate('/setup');
          }}
          className="text-gray-400 hover:text-white text-sm transition-colors flex items-center space-x-2 mx-auto"
        >
          <span>Skip and configure manually</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ResumeUpload;
