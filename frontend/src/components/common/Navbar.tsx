import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mic,
  Home,
  Menu,
  Moon,
  Sun,
  X,
  Target,
  Brain,
  FileText,
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
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const isLightTheme = theme === "light";
  const themeButtonLabel = isLightTheme ? "Switch to dark mode" : "Switch to light mode";

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

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname.startsWith("/dashboard/")
      );
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navLinks = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Interview", href: "/setup", icon: Mic },
    { label: "Aptitude", href: "/aptitude", icon: Brain },
    { label: "Job Fit", href: "/job-fit", icon: Target },
    { label: "Resume", href: "/dashboard/resume-builder", icon: FileText }
  ];

  const handleLogout = () => {
    signOut(firebaseAuth).catch(() => {});
  };

  return (
    <>
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 w-full z-50 h-[88px] backdrop-blur-xl border-b transition-colors ${
          isLightTheme
            ? "bg-white/85 border-slate-200 text-slate-900"
            : "bg-black/80 border-white/10 text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between">

          {/* 🔹 BRAND */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer group"
          >
            <img
              src="/assets/Valen Labs Logo.png"
              alt="Valen Labs"
              className="h-12 w-auto object-contain opacity-95 group-hover:opacity-100 transition"
            />
          </div>

          {/* 🔹 NAV LINKS */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive(link.href)
                    ? isLightTheme
                      ? "text-slate-900 bg-slate-100 border border-slate-200"
                      : "text-white bg-white/10 border border-white/20"
                    : isLightTheme
                      ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
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
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeButtonLabel}
              title={themeButtonLabel}
              className={`p-3 rounded-xl border transition ${
                isLightTheme
                  ? "border-slate-200 bg-slate-100 text-amber-500 hover:bg-slate-200"
                  : "border-white/20 bg-white/5 text-yellow-300 hover:bg-white/10"
              }`}
            >
              {isLightTheme ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {isLoggedIn ? (
              <>
                <div
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
                    isLightTheme
                      ? "bg-slate-100 border-slate-200"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <User size={16} className="text-purple-400" />
                  <span className={`text-sm font-medium ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                    {(userEmail || "user").split("@")[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 text-sm rounded-xl border transition ${
                    isLightTheme
                      ? "border-slate-300 text-slate-700 hover:border-red-400 hover:text-red-500"
                      : "border-white/20 hover:border-red-400 hover:text-red-400"
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/signin")}
                  className={`px-4 py-2 text-sm rounded-xl border transition flex items-center gap-2 ${
                    isLightTheme
                      ? "border-slate-300 text-slate-700 hover:border-purple-400 hover:text-slate-900"
                      : "border-white/20 hover:border-purple-400"
                  }`}
                >
                  <LogIn size={16} />
                  Sign in
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className={`px-4 py-2 text-sm rounded-xl font-medium hover:scale-105 transition flex items-center gap-2 ${
                    isLightTheme
                      ? "bg-slate-900 text-white"
                      : "bg-white text-black"
                  }`}
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
            className={`md:hidden p-3 border rounded-xl ${
              isLightTheme ? "border-slate-300 text-slate-800" : "border-white/20 text-white"
            }`}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* 🔹 MOBILE MENU */}
      {mobileMenuOpen && (
        <div
          className={`fixed top-[88px] left-0 w-full z-40 px-6 py-6 space-y-4 md:hidden border-t ${
            isLightTheme
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-black border-white/10 text-white"
          }`}
        >
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition ${
              isLightTheme
                ? "border-slate-200 bg-slate-100 text-slate-800"
                : "border-white/10 bg-white/5 text-white"
            }`}
          >
            {isLightTheme ? <Moon size={18} /> : <Sun size={18} />}
            {themeButtonLabel}
          </button>

          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => {
                navigate(link.href);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 py-4 text-base ${
                isLightTheme ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"
              }`}
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
                  className={`flex-1 border py-3 rounded-lg ${
                    isLightTheme ? "border-slate-300 text-slate-800" : "border-white/20"
                  }`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className={`flex-1 py-3 rounded-lg ${
                    isLightTheme ? "bg-slate-900 text-white" : "bg-white text-black"
                  }`}
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SPACER */}
      <div className="h-[88px]" />
    </>
  );
};

export default Navbar;