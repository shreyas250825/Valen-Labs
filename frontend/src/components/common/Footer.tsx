import { Github, Globe, Linkedin, Mail } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import { SITE_URL } from "../../utils/constants";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const isLightTheme = theme === "light";

  return (
    <footer className={`${isLightTheme ? "bg-white border-slate-200 text-slate-900" : "bg-black border-white/10 text-white"} border-t transition-colors`}>
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Top Section */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Valen <span className="text-purple-500">AI</span>
            </h2>

            <p className={`text-sm leading-relaxed max-w-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              Built by{" "}
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={isLightTheme ? "text-purple-600 hover:text-purple-700" : "text-purple-400 hover:text-purple-300"}
              >
                Valen Labs
              </a>
              , Valen AI is a next-generation platform designed to simulate interviews, analyze performance, and guide
              users toward real industry readiness.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className={`text-sm font-semibold mb-4 ${isLightTheme ? "text-slate-900" : "text-white"}`}>Product</h3>
            <ul className={`space-y-3 text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              <li><Link to="/#features" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>Features</Link></li>
              <li><Link to="/#demo" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>Demo</Link></li>
              <li><Link to="/#pricing" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>Pricing</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className={`text-sm font-semibold mb-4 ${isLightTheme ? "text-slate-900" : "text-white"}`}>Company</h3>
            <ul className={`space-y-3 text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              <li><Link to="/#about" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>About</Link></li>
              <li><Link to="/#contact" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>Contact</Link></li>
              <li><Link to="/#privacy" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>Privacy</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 ${isLightTheme ? "border-slate-200" : "border-white/10"}`}>

          {/* Copyright */}
          <p className={`text-sm ${isLightTheme ? "text-slate-500" : "text-slate-500"}`}>
            © {currentYear}{" "}
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={isLightTheme ? "hover:text-slate-800" : "hover:text-slate-300"}
            >
              Valen Labs
            </a>
            . All rights reserved.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-4">
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition ${isLightTheme ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"}`}
              aria-label="Valen Labs website"
            >
              <Globe size={18} />
            </a>
            <a href="#" className={`transition ${isLightTheme ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"}`}>
              <Github size={18} />
            </a>
            <a href="#" className={`transition ${isLightTheme ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"}`}>
              <Linkedin size={18} />
            </a>
            <a href="#" className={`transition ${isLightTheme ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"}`}>
              <Mail size={18} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;