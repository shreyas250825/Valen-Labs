import { motion } from "framer-motion";
import { Grid3X3, Type, GitBranch, Layers, ArrowRight } from "lucide-react";
import GlassCard from "./GlassCard";
import { PROBLEM_CATEGORIES, getCategoryProblemCount } from "../../data/arena/problems";

const iconMap: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  grid: Grid3X3,
  type: Type,
  "git-branch": GitBranch,
  layers: Layers,
};

interface CategoryGridProps {
  onSelectCategory: (categoryId: string) => void;
}

const CategoryGrid = ({ onSelectCategory }: CategoryGridProps) => (
  <section className="px-6 pb-16">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-8"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-2">Explore Categories</h2>
      <p className="text-slate-400 text-sm">Pick a topic — counts reflect problems available now</p>
    </motion.div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {PROBLEM_CATEGORIES.map((cat, i) => {
        const Icon = iconMap[cat.icon] ?? Grid3X3;
        const count = getCategoryProblemCount(cat.id);
        return (
          <GlassCard key={cat.id} delay={0.05 * i} className="p-0">
            <button
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className="w-full text-left p-5 group"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-purple-300 transition-colors">{cat.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{cat.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{count > 0 ? `${count} problem${count > 1 ? "s" : ""}` : "Coming soon"}</span>
                <ArrowRight size={14} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </GlassCard>
        );
      })}
    </div>
  </section>
);

export default CategoryGrid;
