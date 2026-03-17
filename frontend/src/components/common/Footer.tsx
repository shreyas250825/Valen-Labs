import { Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Top Section */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Valen <span className="text-purple-500">AI</span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Built by Valen Labs, Valen AI is a next-generation platform designed 
              to simulate interviews, analyze performance, and guide users toward 
              real industry readiness.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#demo" className="hover:text-white">Demo</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
              <li><a href="#privacy" className="hover:text-white">Privacy</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-sm text-slate-500">
            © {currentYear} Valen Labs. All rights reserved.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-400 hover:text-white transition">
              <Github size={18} />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition">
              <Linkedin size={18} />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition">
              <Mail size={18} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;