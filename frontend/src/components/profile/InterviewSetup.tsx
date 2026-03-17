import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Brain, Users, User, UserCheck, ChevronRight, PlayCircle } from 'lucide-react';

interface InterviewSetupProps {
  parsedData: any;
  selectedRole: string;
  onStart: (config: {
    role: string;
    interviewType: string;
    persona: string;
  }) => void;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ selectedRole, onStart }) => {
  const navigate = useNavigate();
  const [interviewType, setInterviewType] = useState<string>('');
  const [persona, setPersona] = useState<string>('');

  const interviewTypes = [
    { 
      id: 'technical', 
      name: 'Technical', 
      description: 'Focus on coding, algorithms, and technical skills',
      icon: Brain,
      gradient: 'from-sky-400 to-cyan-400'
    },
    { 
      id: 'projects', 
      name: 'Projects', 
      description: 'Discuss your past projects and implementations',
      icon: Briefcase,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'mixed', 
      name: 'Mixed', 
      description: 'Combination of technical and behavioral questions',
      icon: Users,
      gradient: 'from-orange-500 to-yellow-500'
    },
    { 
      id: 'hr', 
      name: 'HR/Behavioral', 
      description: 'Focus on soft skills, culture fit, and experience',
      icon: Users,
      gradient: 'from-green-400 to-emerald-500'
    }
  ];

  const personas = [
    {
      id: 'male',
      name: 'Male Interviewer',
      description: 'Neutral, professional tone',
      icon: User,
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'female',
      name: 'Female Interviewer',
      description: 'Warm, encouraging tone',
      icon: UserCheck,
      gradient: 'from-pink-400 to-rose-500'
    },
    {
      id: 'bossy_female',
      name: 'Bossy Female Interviewer',
      description: 'Strict, demanding, high-pressure tone',
      icon: UserCheck,
      gradient: 'from-red-400 to-orange-500'
    }
  ];

  const handleStartInterview = () => {
    if (selectedRole && interviewType && persona) {
      onStart({
        role: selectedRole,
        interviewType: interviewType,
        persona: persona
      });
    }
  };

  const canStart = selectedRole && interviewType && persona;

  return (
    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 md:p-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-sky-600 rounded-2xl mb-6 transform hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
          <PlayCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-5xl font-black tracking-tighter uppercase mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Interview Setup
        </h2>
        <p className="text-slate-400 text-lg font-medium">
          Configure your interview settings
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Selected Role Display */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Selected Role</p>
              <p className="text-lg font-black text-purple-400">{selectedRole}</p>
            </div>
            <button
              onClick={() => navigate('/setup')}
              className="text-sm font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
            >
              Change
            </button>
          </div>
        </div>

        {/* Interview Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-4">
            Interview Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviewTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setInterviewType(type.id)}
                className={`relative group text-left transition-all duration-300 ${
                  interviewType === type.id ? 'scale-105' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${type.gradient} rounded-2xl blur-xl opacity-0 ${
                  interviewType === type.id ? 'opacity-50' : 'group-hover:opacity-30'
                } transition-all duration-500`}></div>
                <div className={`relative bg-slate-800/40 backdrop-blur-xl border-2 rounded-2xl p-6 transition-all duration-300 ${
                  interviewType === type.id
                    ? 'border-white/30 bg-slate-700/40'
                    : 'border-white/10 hover:border-white/20'
                }`}>
                  <div className={`inline-flex p-3 bg-gradient-to-r ${type.gradient} rounded-xl mb-4`}>
                    <type.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    interviewType === type.id ? 'text-white' : 'text-gray-300'
                  }`}>
                    {type.name}
                  </h3>
                  <p className="text-sm text-gray-400">{type.description}</p>
                  {interviewType === type.id && (
                    <div className="mt-4 flex items-center text-sky-300 text-sm font-semibold">
                      <span>Selected</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Interviewer Persona Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-4">
            Interviewer Persona
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`relative group text-left transition-all duration-300 ${
                  persona === p.id ? 'scale-105' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${p.gradient} rounded-2xl blur-xl opacity-0 ${
                  persona === p.id ? 'opacity-50' : 'group-hover:opacity-30'
                } transition-all duration-500`}></div>
                <div className={`relative bg-slate-800/40 backdrop-blur-xl border-2 rounded-2xl p-6 transition-all duration-300 ${
                  persona === p.id
                    ? 'border-white/30 bg-slate-700/40'
                    : 'border-white/10 hover:border-white/20'
                }`}>
                  <div className={`inline-flex p-3 bg-gradient-to-r ${p.gradient} rounded-xl mb-4`}>
                    <p.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${
                    persona === p.id ? 'text-white' : 'text-gray-300'
                  }`}>
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-400">{p.description}</p>
                  {persona === p.id && (
                    <div className="mt-4 flex items-center text-sky-300 text-sm font-semibold">
                      <span>Selected</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Interview Button */}
        <div className="pt-6">
          <button
            onClick={handleStartInterview}
            disabled={!canStart}
            className={`relative w-full group overflow-hidden ${
              !canStart ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className={`relative flex items-center justify-center space-x-3 bg-gradient-to-r from-sky-500 to-cyan-500 py-4 px-8 rounded-xl font-bold text-lg shadow-xl transform transition-all duration-300 ${
              canStart ? 'group-hover:scale-105' : ''
            }`}>
              <PlayCircle className="w-6 h-6" />
              <span>Start Interview</span>
            </div>
          </button>
          {!canStart && (
            <p className="text-center text-sm text-gray-400 mt-3">
              Please select all options to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;

