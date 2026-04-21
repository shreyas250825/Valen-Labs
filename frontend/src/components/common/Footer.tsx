import { Github, Linkedin, Mail } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

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
              Built by Valen Labs, Valen AI is a next-generation platform designed 
              to simulate interviews, analyze performance, and guide users toward 
              real industry readiness.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className={`text-sm font-semibold mb-4 ${isLightTheme ? "text-slate-900" : "text-white"}`}>Product</h3>
            <ul className={`space-y-3 text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              <li><a href="#features" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>Features</a></li>
              <li><a href="#demo" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>Demo</a></li>
              <li><a href="#pricing" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>Pricing</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className={`text-sm font-semibold mb-4 ${isLightTheme ? "text-slate-900" : "text-white"}`}>Company</h3>
            <ul className={`space-y-3 text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
              <li><a href="#about" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>About</a></li>
              <li><a href="#contact" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>Contact</a></li>
              <li><a href="#privacy" className={isLightTheme ? "hover:text-slate-900" : "hover:text-white"}>Privacy</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 ${isLightTheme ? "border-slate-200" : "border-white/10"}`}>

          {/* Copyright */}
          <p className={`text-sm ${isLightTheme ? "text-slate-500" : "text-slate-500"}`}>
            © {currentYear} Valen Labs. All rights reserved.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-4">
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