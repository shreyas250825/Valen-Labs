// Component Props
export interface HeroSectionProps {
  onCTAClick: (action: 'beta' | 'learn') => void;
}

export interface Scene3DProps {
  scrollProgress: number;
  mousePosition: { x: number; y: number };
  isMobile: boolean;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  delay: number;
}

export interface ProductCardProps {
  title: string;
  description: string;
  features: string[];
  index: number;
}

export interface BetaSectionProps {
  onSubmit: (email: string) => Promise<void>;
}

// Data Models
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  features: string[];
}

export interface BetaSubmission {
  email: string;
  timestamp: number;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

// Animation Config
export interface AnimationConfig {
  duration: number;
  ease: string;
  delay?: number;
}

export interface ScrollConfig {
  threshold: number;
  rootMargin: string;
}
