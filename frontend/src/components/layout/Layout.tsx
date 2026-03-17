import React from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-black text-white">
      {/* Ambient landing-style glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-120px] left-[-120px] w-[520px] h-[520px] bg-purple-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-160px] right-[-160px] w-[560px] h-[560px] bg-emerald-400/10 blur-[160px] rounded-full animate-pulse [animation-delay:1200ms]" />
      </div>

      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;