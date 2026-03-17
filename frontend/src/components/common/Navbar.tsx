import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mic,
  BarChart3,
  Home,
  Menu,
  X,
  Target,
  Brain,
  User,
  LogIn,
  UserPlus
} from "lucide-react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseAuth } from "../../lib/firebase";
import {
  fetchDashboardFromBackend,
  hydrateDashboardToLocalStorage,
  syncUserToBackend
} from "../../services/backendSupabase";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      setIsLoggedIn(!!user);
      setUserEmail(user?.email || "");

      if (user) {
        syncUserToBackend().catch(() => {});
        fetchDashboardFromBackend()
          .then((data) => hydrateDashboardToLocalStorage(data))
          .catch(() => {});
      }
    });

    return () => unsub();
  }, []);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path);

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Interview", href: "/setup", icon: Mic },
    { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { label: "Aptitude", href: "/aptitude", icon: Brain },
    { label: "Job Fit", href: "/job-fit", icon: Target }
  ];

  const handleLogout = () => {
    signOut(firebaseAuth).catch(() => {});
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

          {/* 🔹 BRAND */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer group"
          >
            <img
              src="/assets/Valen Labs Logo.png"
              alt="Valen Labs"
              className="h-14 w-auto object-contain opacity-95 group-hover:opacity-100 transition"
            />
          </div>

          {/* 🔹 NAV LINKS */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive(link.href)
                    ? "text-white bg-white/10 border border-white/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </button>
            ))}
          </div>

          {/* 🔹 RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-4">

            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <User size={16} className="text-purple-400" />
                  <span className="text-sm font-medium">
                    {(userEmail || "user").split("@")[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm rounded-xl border border-white/20 hover:border-red-400 hover:text-red-400 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/signin")}
                  className="px-4 py-2 text-sm rounded-xl border border-white/20 hover:border-purple-400 transition flex items-center gap-2"
                >
                  <LogIn size={16} />
                  Sign in
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 text-sm rounded-xl bg-white text-black font-medium hover:scale-105 transition flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Sign up
                </button>
              </>
            )}

          </div>

          {/* 🔹 MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 border border-white/20 rounded-xl"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* 🔹 MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed top-[80px] left-0 w-full bg-black border-t border-white/10 z-40 px-6 py-6 space-y-4 md:hidden">

          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => {
                navigate(link.href);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 py-4 text-slate-400 hover:text-white text-base"
            >
              <link.icon size={18} />
              {link.label}
            </button>
          ))}

          <div className="pt-4 border-t border-white/10">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full py-3 text-red-400 text-left"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/signin")}
                  className="flex-1 border border-white/20 py-3 rounded-lg"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="flex-1 bg-white text-black py-3 rounded-lg"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SPACER */}
      <div className="h-[80px]" />
    </>
  );
};

export default Navbar;