import { HeroSectionProps } from '../../types';

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-purple/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-gradient-to-r from-primary-purple/10 to-primary-blue/10 border border-primary-purple/20 rounded-full backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-purple opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-purple"></span>
          </span>
          <span className="text-sm text-gray-300 font-medium">Introducing Valen AI</span>
        </div>
        
        {/* Main heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-[1.1]">
          <span className="text-white">Building</span>
          <br />
          <span className="text-gradient inline-block">Intelligent AI</span>
          <br />
          <span className="text-white">Systems</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          A Gen AI Career Intelligence Platform powered by hybrid AI routing
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button
            onClick={() => onCTAClick('beta')}
            className="group relative px-8 py-4 bg-primary-purple rounded-xl text-white font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-purple/50"
          >
            <span className="relative z-10">Join Beta</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-purple to-primary-blue opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={() => onCTAClick('learn')}
            className="px-8 py-4 border-2 border-gray-800 rounded-xl text-white font-semibold hover:border-gray-700 hover:bg-gray-900/50 transition-all"
          >
            Learn More
          </button>
        </div>

        {/* Stats or trust indicators */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-gray-800">
          <div>
            <div className="text-3xl font-bold text-white mb-1">99.9%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">&lt;100ms</div>
            <div className="text-sm text-gray-500">Response Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">24/7</div>
            <div className="text-sm text-gray-500">Availability</div>
          </div>
        </div>
      </div>
    </section>
  );
}
