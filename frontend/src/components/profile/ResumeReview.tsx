import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Briefcase, Code, GraduationCap, ChevronRight } from 'lucide-react';

interface ResumeReviewProps {
  parsedData: {
    skills?: string[];
    experience_years?: number;
    projects?: string[];
    education?: string[];
    estimated_role?: string;
  };
  onContinue: () => void;
}

const ResumeReview: React.FC<ResumeReviewProps> = ({ parsedData, onContinue }) => {
  const navigate = useNavigate();

  const skills = parsedData.skills || [];
  const projects = parsedData.projects || [];
  const education = parsedData.education || [];

  const handleContinue = () => {
    console.log('Continue button clicked, parsedData:', parsedData);
    if (onContinue) {
      console.log('Calling onContinue callback');
      onContinue();
    } else {
      // Fallback navigation
      console.log('Navigating to /setup with parsedData');
      navigate('/setup', { 
        state: { parsedData },
        replace: false 
      });
    }
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 md:p-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-sky-600 rounded-2xl mb-6 transform hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-6xl font-black tracking-tighter uppercase mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Resume Review
        </h2>
        <p className="text-slate-400 text-lg font-medium">
          Please review the information we extracted from your resume
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Skills Section */}
        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-sky-600 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 font-black uppercase tracking-widest"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-slate-400 text-sm font-medium">No skills detected</p>
            )}
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Experience</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
              2
            </span>
            <span className="text-gray-400 text-lg">
              years of experience
            </span>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Projects</h3>
          </div>
          <div className="space-y-3">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-800/50 border border-white/5 rounded-xl"
                >
                  <p className="text-gray-300 text-sm leading-relaxed">{project}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No projects detected</p>
            )}
          </div>
        </div>

        {/* Education Section (Optional) */}
        {education.length > 0 && (
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Education</h3>
            </div>
            <div className="space-y-2">
              {education.map((edu, index) => (
                <p key={index} className="text-gray-300 text-sm">
                  {edu}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="pt-6">
          <button
            onClick={handleContinue}
            className="relative w-full group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-sky-500 to-cyan-500 py-4 px-8 rounded-xl font-bold text-lg shadow-xl transform group-hover:scale-105 transition-all duration-300">
              <span>Continue → Select Role</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeReview;

