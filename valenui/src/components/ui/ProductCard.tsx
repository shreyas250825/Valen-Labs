import { ProductCardProps } from '../../types';

export function ProductCard({ title, description, features }: ProductCardProps) {
  return (
    <div className="group relative p-10 border border-gray-800 rounded-3xl hover:border-gray-700 transition-all bg-gradient-to-br from-gray-900/80 to-gray-900/40 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/10 via-transparent to-primary-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-purple/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-gradient transition-all">
          {title}
        </h3>
        <p className="text-gray-400 mb-8 leading-relaxed text-base">
          {description}
        </p>
        
        <div className="space-y-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 group/item">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-purple/20 flex items-center justify-center mt-0.5 group-hover/item:bg-primary-purple/30 transition-colors">
                <svg className="w-3 h-3 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-gray-300 group-hover/item:text-white transition-colors">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
