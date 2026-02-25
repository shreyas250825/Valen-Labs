export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <a href="/" className="flex items-center gap-3 group">
            <img 
              src="/Valen Labs Logo.png" 
              alt="Valen Labs" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-white group-hover:text-gradient transition-all">
              Valen Labs
            </span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-purple to-primary-blue group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#products" className="text-sm text-gray-400 hover:text-white transition-colors relative group">
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-purple to-primary-blue group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#beta" className="text-sm text-gray-400 hover:text-white transition-colors relative group">
              Beta
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-purple to-primary-blue group-hover:w-full transition-all duration-300" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="#beta"
            className="group relative px-6 py-2.5 bg-primary-purple rounded-lg text-white text-sm font-medium overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-purple/50"
          >
            <span className="relative z-10">Join Beta</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-purple to-primary-blue opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </nav>
  );
}
