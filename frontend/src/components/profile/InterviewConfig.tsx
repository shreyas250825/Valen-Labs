import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ChevronRight } from 'lucide-react';
import InterviewSetup from './InterviewSetup';

interface InterviewConfigProps {
  parsedData?: any;
  onComplete: (config: {
    role: string;
    interviewType: string;
  }) => void;
}

const InterviewConfig: React.FC<InterviewConfigProps> = ({ parsedData, onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'role' | 'setup'>('role');
  const [selectedRole, setSelectedRole] = useState<string>(parsedData?.estimated_role || 'Software Engineer');
  const [customRole, setCustomRole] = useState<string>('');

  const commonRoles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Mobile Developer',
    'QA Engineer',
    'System Architect',
    'Tech Lead'
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleNext = () => {
    if (step === 'role') {
      if (selectedRole || customRole) {
        setStep('setup');
      }
    }
  };

  const handleStartInterview = (config: {
    role: string;
    interviewType: string;
    persona: string;
  }) => {
    const finalRole = config.role;
    const profile = {
      role: finalRole,
      estimated_role: finalRole,
      interviewType: config.interviewType,
      interview_type: config.interviewType,
      persona: config.persona,
      round: 'Technical Round',
      ...(parsedData || {})
    };
    
    localStorage.setItem('interviewProfile', JSON.stringify(profile));
    onComplete({
      role: finalRole,
      interviewType: config.interviewType
    });
    navigate('/interview');
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10">
      {step === 'role' ? (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent">
              Select Your Role
            </h2>
            <p className="text-gray-400 text-lg">
              {parsedData?.estimated_role 
                ? `We detected "${parsedData.estimated_role}" from your resume. You can change it if needed.`
                : 'Choose or enter the role you want to interview for'
              }
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Suggested Role from Resume */}
            {parsedData?.estimated_role && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Suggested Role (from your resume)
                </label>
                <button
                  onClick={() => handleRoleSelect(parsedData.estimated_role)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedRole === parsedData.estimated_role
                      ? 'border-sky-400 bg-sky-400/20'
                      : 'border-white/10 bg-slate-900/50 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${
                      selectedRole === parsedData.estimated_role ? 'text-sky-300' : 'text-white'
                    }`}>
                      {parsedData.estimated_role}
                    </span>
                    {selectedRole === parsedData.estimated_role && (
                      <div className="w-6 h-6 bg-sky-400 rounded-full flex items-center justify-center">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            )}

            {/* Common Roles Grid */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Or select from common roles
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      handleRoleSelect(role);
                      setCustomRole('');
                    }}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm ${
                      selectedRole === role && !customRole
                        ? 'border-sky-400 bg-sky-400/20 text-sky-300'
                        : 'border-white/10 bg-slate-900/50 text-gray-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Role Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Or enter a custom role
              </label>
              <input
                type="text"
                value={customRole}
                onChange={(e) => {
                  setCustomRole(e.target.value);
                  setSelectedRole('');
                }}
                placeholder="e.g., Machine Learning Engineer"
                className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!selectedRole && !customRole.trim()}
              className="relative w-full group overflow-hidden mt-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className={`relative flex items-center justify-center space-x-3 bg-gradient-to-r from-sky-500 to-cyan-500 py-4 px-8 rounded-xl font-bold text-lg shadow-xl transform transition-all duration-300 ${
                (selectedRole || customRole.trim()) ? 'group-hover:scale-105' : 'opacity-50 cursor-not-allowed'
              }`}>
                <span>Next: Choose Interview Type</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          </div>
        </>
      ) : (
        <InterviewSetup
          parsedData={parsedData}
          selectedRole={customRole.trim() || selectedRole}
          onStart={handleStartInterview}
        />
      )}
    </div>
  );
};

export default InterviewConfig;


