// Helper functions
export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
};

// Data transformation utilities
export const transformProfileForBackend = (profile: {
  role: string;
  interviewType: string;
  round: string;
}) => {
  // Role mappings
  const roleMappings: { [key: string]: string } = {
    'Software Engineer': 'software_engineer',
    'Frontend Developer': 'frontend_developer',
    'Backend Developer': 'backend_developer',
    'Data Scientist': 'data_scientist',
    'Product Manager': 'product_manager',
    'ML Engineer': 'ml_engineer'
  };

  // Interview type mappings
  const interviewTypeMappings: { [key: string]: string } = {
    'Technical': 'technical',
    'Behavioral': 'behavioral',
    'Mixed': 'mixed'
  };

  // Interview round mappings
  const roundMappings: { [key: string]: string } = {
    'HR Round': 'hr_round',
    'Technical Round': 'technical_round',
    'Final Round': 'final_round'
  };

  return {
    role: roleMappings[profile.role] || profile.role.toLowerCase().replace(' ', '_'),
    interview_type: interviewTypeMappings[profile.interviewType] || profile.interviewType.toLowerCase(),
    round_type: roundMappings[profile.round] || profile.round.toLowerCase().replace(' ', '_'),
    resume_data: null // Optional, can be added later for resume upload
  };
};

export const helpers = {
  // Helper functions here
};
