// src/components/Navbar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user) || {};

  const isLoggedIn = !!user;

  const goAuthorStudio = () => {
    if (user?.role === "author") {
      nav("/my-books");
    } else {
      nav("/login");
    }
  };

  const goBrowseBooks = () => {
    nav("/books");
  };

  const goLanding = () => nav("/");

  const handlePrimaryClick = () => {
    if (!isLoggedIn) {
      nav("/login");
    } else if (user.role === "author") {
      nav("/dashboard/author");
    } else if (user.role === "admin") {
      nav("/dashboard/admin");
    } else {
      nav("/purchases");
    }
  };

  const handleSecondaryClick = () => {
    if (!isLoggedIn) {
      nav("/signup");
    } else {
      nav("/purchases");
    }
  };

  return (
    <header className="z-30 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur fixed top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={goLanding}
          className="flex items-center gap-2 group"
        >
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

        {/* Center nav */}
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
          <button
            onClick={goBrowseBooks}
            className="hover:text-white"
          >
            Browse books
          </button>
          <button
            onClick={goAuthorStudio}
            className="hover:text-white"
          >
            Author studio
          </button>
        </nav>

        {/* Right side – auth / user */}
        <div className="flex items-center gap-2">
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
              <span className="hidden sm:inline text-xs text-slate-300 mr-1">
                Hi,{" "}
                <span className="font-semibold">
                  {user.name || "Reader"}
                </span>
              </span>
              <button
                onClick={handlePrimaryClick}
                className="h-9 px-3 rounded-lg border border-slate-700 text-xs text-slate-200 hover:bg-slate-900"
              >
                {user.role === "author"
                  ? "Author dashboard"
                  : user.role === "admin"
                  ? "Admin dashboard"
                  : "My library"}
              </button>
              <button
                onClick={handleSecondaryClick}
                className="h-9 px-3 rounded-lg bg-sky-500 text-xs font-semibold text-slate-950 hover:bg-sky-400 shadow-lg shadow-sky-500/30"
              >
                Browse books
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
