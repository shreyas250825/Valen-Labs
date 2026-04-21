import React from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const isLightTheme = theme === "light";

  return (
    <div
      className={`min-h-screen flex flex-col overflow-x-hidden transition-colors ${
        isLightTheme ? "bg-slate-50 text-slate-900" : "bg-black text-white"
      }`}
    >
      {/* Ambient landing-style glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className={`absolute top-[-120px] left-[-120px] w-[520px] h-[520px] blur-[140px] rounded-full animate-pulse ${
            isLightTheme ? "bg-purple-500/10" : "bg-purple-600/10"
          }`}
        />
        <div
          className={`absolute bottom-[-160px] right-[-160px] w-[560px] h-[560px] blur-[160px] rounded-full animate-pulse [animation-delay:1200ms] ${
            isLightTheme ? "bg-sky-400/10" : "bg-emerald-400/10"
          }`}
        />
      </div>

      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;