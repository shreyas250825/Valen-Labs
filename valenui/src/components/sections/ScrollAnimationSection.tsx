import { FeatureCard } from '../ui/FeatureCard';
import { FEATURES } from '../../constants/data';

export function ScrollAnimationSection() {
  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full">
            <span className="text-sm text-gray-400 font-medium">Platform Features</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Built for the future
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Advanced AI capabilities designed to transform career intelligence
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
