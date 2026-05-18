import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

const GlassCard = ({ children, className = "", hover = true, delay = 0 }: GlassCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
    className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-3xl ${className}`}
  >
    {children}
  </motion.div>
);

export default GlassCard;
