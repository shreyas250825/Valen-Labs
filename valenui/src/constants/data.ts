import { Feature, Product } from '../types';

export const FEATURES: Feature[] = [
  {
    id: 'hybrid-routing',
    title: 'Hybrid AI Routing',
    description: 'Intelligent routing between local and cloud AI models for optimal performance',
    icon: ''
  },
  {
    id: 'local-cloud',
    title: 'Local + Cloud Intelligence',
    description: 'Seamless integration of on-device and cloud-based AI capabilities',
    icon: ''
  },
  {
    id: 'privacy-first',
    title: 'Privacy-First Architecture',
    description: 'Your data stays secure with local processing and encrypted cloud sync',
    icon: ''
  },
  {
    id: 'structured-eval',
    title: 'Structured Evaluation Systems',
    description: 'Comprehensive assessment framework for accurate career intelligence',
    icon: ''
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'interview-sim',
    title: 'Smart Interview Simulation',
    description: 'Practice with AI-powered interview scenarios tailored to your target roles',
    features: ['Real-time feedback', 'Industry-specific questions', 'Performance analytics']
  },
  {
    id: 'job-fit',
    title: 'Job Fit Analysis',
    description: 'Discover roles that match your skills, experience, and career goals',
    features: ['Skills mapping', 'Role recommendations', 'Gap analysis']
  },
  {
    id: 'aptitude',
    title: 'Aptitude Intelligence',
    description: 'Comprehensive assessment of your cognitive abilities and potential',
    features: ['Multi-dimensional testing', 'Personalized insights', 'Growth tracking']
  },
  {
    id: 'evaluation',
    title: 'Real-Time Evaluation Insights',
    description: 'Get instant feedback and actionable recommendations for improvement',
    features: ['Live scoring', 'Detailed reports', 'Progress monitoring']
  }
];
