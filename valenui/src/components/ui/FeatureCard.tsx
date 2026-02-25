import { FeatureCardProps } from '../../types';

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="group relative p-8 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all bg-gradient-to-b from-gray-900/50 to-gray-900/30 hover:from-gray-900/80 hover:to-gray-900/50">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/5 to-primary-blue/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Icon placeholder with gradient */}
      <div className="relative mb-6 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-purple/20 to-primary-blue/20 flex items-center justify-center border border-primary-purple/20">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-purple to-primary-blue" />
      </div>

      <h3 className="relative text-xl font-semibold mb-3 text-white group-hover:text-gradient transition-all">
        {title}
      </h3>
      <p className="relative text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
