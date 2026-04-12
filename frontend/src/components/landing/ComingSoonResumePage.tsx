import { Link } from "react-router-dom";

export default function ComingSoonResumePage() {
  return (
    <div className="overflow-x-hidden bg-black text-white">
      <section className="h-screen flex flex-col items-center justify-center text-center px-6 relative">
        <div className="absolute w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full -z-10 animate-pulse" />

        <div className="max-w-5xl flex flex-col items-center">
          <div className="mb-8 text-center space-y-3">
            <div className="text-[10px] tracking-[0.4em] uppercase text-purple-400">
              Valen Labs presents
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold">
              <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Valen AI
              </span>
              <span className="text-white/35 font-normal mx-2 sm:mx-3">—</span>
              <span className="text-white/90">New feature</span>
            </p>
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-[8rem] font-black tracking-tight leading-[0.85] mb-6">
            AI RESUME <br />
            <span className="bg-gradient-to-r from-purple-400 to-emerald-400 text-transparent bg-clip-text">
              BUILDER
            </span>
          </h1>

          <p className="max-w-xl text-slate-400 text-base leading-relaxed mb-10">
            Coming soon
          </p>

          <Link
            to="/"
            className="px-10 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all"
          >
            Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}
