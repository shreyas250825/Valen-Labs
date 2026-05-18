import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getProblemBySlug } from "../../data/arena/problems";
import ProblemIDE from "../../components/editor/ProblemIDE";
import ArenaLayout from "../../components/arena/ArenaLayout";

const ProblemSolvePage = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/arena" replace />;
  }

  const problem = getProblemBySlug(slug);

  if (!problem) {
    return (
      <ArenaLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
        >
          <h1 className="text-2xl font-bold mb-2">Problem not found</h1>
          <p className="text-slate-400 mb-6">The problem &quot;{slug}&quot; does not exist.</p>
          <Link
            to="/arena"
            className="px-6 py-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
          >
            Back to Arena
          </Link>
        </motion.div>
      </ArenaLayout>
    );
  }

  return <ProblemIDE problem={problem} />;
};

export default ProblemSolvePage;
