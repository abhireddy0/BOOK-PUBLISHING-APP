import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { FiPower, FiChevronDown } from "react-icons/fi";
import ConfirmModal from "./ConfirmModal";

function getInitials(name = "", email = "") {
  const source = name?.trim() || email?.trim() || "User";
  const parts = source.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((s) => s.user) || {};
  const isLoggedIn = !!user;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const toggleMenu = () => setMenuOpen((p) => !p);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const doLogoutNow = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("storyverse_auth");
      localStorage.removeItem("token");
      dispatch(setUserData({ user: null, token: null }));
      setConfirmOpen(false);
      setLoggingOut(false);
      nav("/login", { replace: true });
    }, 220);
  };

  const goLanding = () => nav("/");
  const goBrowseBooks = () => nav("/books");

  const avatarUrl =
    user?.avatar || user?.photo || user?.photoUrl || user?.avatarUrl || null;

  return (
    <>
      <header
        className={`z-30 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur fixed top-0 left-0 transition-opacity ${
          loggingOut ? "opacity-60" : "opacity-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={goLanding} className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-semibold tracking-[0.18em]">
              SV
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold uppercase">
                StoryVerse
              </span>
              <span className="text-[10px] text-slate-400">
                Read · Publish · Earn
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.16em] text-slate-400">
            <button
              onClick={() => {
                if (location.pathname === "/") {
                  const el = document.getElementById("sv-features");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                } else {
                  nav("/#features");
                }
              }}
              className="hover:text-white"
            >
              Features
            </button>
            <button onClick={goBrowseBooks} className="hover:text-white">
              Browse books
            </button>
            <button
              onClick={() =>
                user?.role === "author" ? nav("/my-books") : nav("/login")
              }
              className="hover:text-white"
            >
              Author studio
            </button>
          </nav>

          <div className="relative flex items-center gap-2" ref={menuRef}>
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => nav("/login")}
                  className="h-9 px-3 rounded-lg border border-slate-700 text-xs text-slate-200 hover:bg-slate-900"
                >
                  Log in
                </button>
                <button
                  onClick={() => nav("/signup")}
                  className="h-9 px-3 rounded-lg bg-sky-500 text-xs font-semibold text-slate-950 hover:bg-sky-400 shadow-lg shadow-sky-500/30"
                >
                  Get started
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleMenu}
                  className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:bg-slate-800"
                >
                
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-700 text-[11px] font-semibold text-white overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement.textContent =
                            getInitials(user?.name, user?.email);
                        }}
                      />
                    ) : (
                      getInitials(user?.name, user?.email)
                    )}
                  </span>
                  <span className="hidden sm:inline">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                  <FiChevronDown
                    className={`transition-transform ${
                      menuOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-12 w-48 rounded-xl border border-slate-700 bg-slate-900 shadow-xl animate-[fadeIn_.15s_ease-out]">
                    <div className="px-4 pt-3 pb-2">
                      <p className="text-[11px] text-slate-400">Signed in as</p>
                      <p className="text-xs text-slate-200 font-medium line-clamp-1">
                        {user?.email || "user@storyverse.app"}
                      </p>
                    </div>
                    <div className="h-px bg-slate-800" />

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        nav("/purchases");
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 text-slate-200"
                    >
                      My Library
                    </button>

                    {user.role === "author" && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          nav("/dashboard/author");
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 text-slate-200"
                      >
                        Author Dashboard
                      </button>
                    )}

                    {user.role === "admin" && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          nav("/dashboard/admin");
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 text-amber-300"
                      >
                        Admin Panel
                      </button>
                    )}

                    <div className="h-px bg-slate-800" />

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setConfirmOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs hover:bg-red-500/10 text-red-300"
                    >
                      <FiPower className="text-sm" />
                      Logout
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <ConfirmModal
        open={confirmOpen}
        title="Log out of StoryVerse?"
        message="You’ll need to log in again to access your library and author studio."
        confirmText="Logout"
        cancelText="Stay"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doLogoutNow}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
