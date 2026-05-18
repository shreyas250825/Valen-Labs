import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Code2 } from "lucide-react";
import type { ReactNode } from "react";

interface ArenaLayoutProps {
  children: ReactNode;
  fullBleed?: boolean;
  showBack?: boolean;
}

const ArenaLayout = ({ children, fullBleed = false, showBack = true }: ArenaLayoutProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen bg-[#020617] text-white overflow-x-hidden"
  >
    <motion.div
      className="fixed inset-0 pointer-events-none -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-purple-600/15 blur-[140px] rounded-full"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-120px] right-[-80px] w-[480px] h-[480px] bg-sky-500/10 blur-[140px] rounded-full"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </motion.div>

    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex items-center justify-between ${fullBleed ? "px-4 py-3" : "max-w-7xl mx-auto px-6 py-4"}`}
      >
        <div className="flex items-center gap-4">
          {showBack && (
            <Link
              to="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Valen Live</span>
            </Link>
          )}
          <Link to="/arena" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-sky-500">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Valen <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Arena</span>
            </span>
          </Link>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/arena" className="text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            Problems
          </Link>
          <a href="#contest" className="text-slate-400 hover:text-white transition-colors hidden sm:inline text-xs uppercase tracking-widest">
            Weekly Contest
          </a>
        </nav>
      </motion.div>
    </header>

    <main className={fullBleed ? "" : "max-w-7xl mx-auto"}>{children}</main>
  </motion.div>
);

export default ArenaLayout;
