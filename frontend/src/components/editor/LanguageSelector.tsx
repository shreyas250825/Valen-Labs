import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { EditorLanguage } from "../../types/arena";

const LANGUAGES: { value: EditorLanguage; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
];

interface LanguageSelectorProps {
  value: EditorLanguage;
  onChange: (lang: EditorLanguage) => void;
}

const LanguageSelector = ({ value, onChange }: LanguageSelectorProps) => (
  <motion.div className="relative" whileTap={{ scale: 0.98 }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as EditorLanguage)}
      className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 cursor-pointer hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.value} value={lang.value} className="bg-slate-900">
          {lang.label}
        </option>
      ))}
    </select>
    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
  </motion.div>
);

export default LanguageSelector;
