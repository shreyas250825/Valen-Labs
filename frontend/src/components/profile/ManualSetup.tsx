import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import InterviewSetup from './InterviewSetup';

const ManualSetup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'role' | 'setup'>('role');
  const [selectedRole, setSelectedRole] = useState<string>('Software Engineer');
  const [customRole, setCustomRole] = useState<string>('');

  const roles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'Full Stack Developer'];

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
    const profile = {
      role: config.role,
      estimated_role: config.role,
      interviewType: config.interviewType,
      interview_type: config.interviewType,
      persona: config.persona,
      round: 'Technical Round',
    };
    
    localStorage.setItem('interviewProfile', JSON.stringify(profile));
    navigate('/interview');
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 md:p-10">
      {step === 'role' ? (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-sky-600 rounded-2xl mb-6 transform hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-6xl font-black tracking-tighter uppercase mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Select Your Role
            </h2>
            <p className="text-slate-400 text-lg font-medium">
              Choose or enter the role you want to interview for
            </p>
      </div>

          <div className="max-w-3xl mx-auto">
            {/* Common Roles Grid */}
            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">
                Select from common roles
        </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setCustomRole('');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-sm font-black uppercase tracking-widest ${
                      selectedRole === role && !customRole
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-purple-500/50 hover:text-white'
                    }`}
                  >
                    {role}
                  </button>
          ))}
              </div>
      </div>

            {/* Custom Role Input */}
            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">
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
                className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
              />
      </div>

            {/* Next Button */}
      <button
              onClick={handleNext}
              disabled={!selectedRole && !customRole.trim()}
              className="relative w-full group overflow-hidden mt-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-sky-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div>
              <div className={`relative flex items-center justify-center space-x-3 bg-gradient-to-br from-purple-600 to-sky-600 py-4 px-8 rounded-2xl font-black text-lg shadow-xl transform transition-all duration-300 uppercase tracking-widest ${
                (selectedRole || customRole.trim()) ? 'group-hover:scale-105' : 'opacity-50 cursor-not-allowed'
              }`}>
                <span>Next: Choose Interview Type & Persona</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
      </button>
          </div>
        </>
      ) : (
        <InterviewSetup
          parsedData={{}}
          selectedRole={customRole.trim() || selectedRole}
          onStart={handleStartInterview}
        />
      )}
    </div>
  );
};

export default ManualSetup;
