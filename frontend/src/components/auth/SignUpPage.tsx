import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Target, User } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { firebaseAuth } from "../../lib/firebase";

export default function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => location.state?.from?.pathname || "/dashboard", [location.state]);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      if (displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] animate-pulse delay-500" />
      </div>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full p-3 text-white transition-all group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-purple-600 shadow-[0_0_40px_rgba(16,185,129,0.35)] animate-[spin_8s_linear_infinite]">
              <span className="text-lg font-black text-white italic -rotate-12">VL</span>
            </div>
          </div>

          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-white mb-2">
            CREATE <span className="text-emerald-400 italic">ACCOUNT.</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">START YOUR READINESS ENGINE</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl space-y-6"
        >
          <div className="space-y-4">
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-400/50 transition-all placeholder:text-slate-600"
                disabled={isLoading}
                autoComplete="name"
              />
            </div>

            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"
                size={20}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-400/50 transition-all placeholder:text-slate-600"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="relative group">
              <Target
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"
                size={20}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-400/50 transition-all placeholder:text-slate-600"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span className="text-sm uppercase tracking-[0.2em]">Creating...</span>
              </div>
            ) : (
              <span className="text-sm uppercase tracking-[0.2em]">Create account</span>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/signin", { state: { from: location.state?.from } })}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Already have an account? <span className="text-emerald-300 font-semibold">Sign in</span>
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-600 uppercase font-black tracking-widest mt-8">
          Secured by Firebase Auth
        </p>
      </div>
    </div>
  );
}

