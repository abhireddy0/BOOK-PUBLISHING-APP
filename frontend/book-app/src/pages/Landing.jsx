import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";

import {
  FiBookOpen,
  FiPenTool,
  FiShield,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";

export default function Landing() {
  const nav = useNavigate();
  const heroRef = useRef(null);
  const floatRef = useRef(null);

  // GSAP animations
  useEffect(() => {
    if (!heroRef.current) return;

    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }
    );

    if (floatRef.current) {
      gsap.to(floatRef.current, {
        y: -10,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  const scrollToFeatures = () => {
    const el = document.getElementById("sv-features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 relative overflow-hidden">

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 opacity-50">
        <div className="absolute -right-40 -top-20 h-72 w-72 rounded-full bg-sky-500/35 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
      </div>

      {/* NAVBAR */}
      <header className="relative z-20 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => nav("/")} className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-semibold tracking-[0.18em]">
              SV
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold uppercase">StoryVerse</span>
              <span className="text-[10px] text-slate-400">Read · Publish · Earn</span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.16em] text-slate-400">
            <button onClick={scrollToFeatures} className="hover:text-white">Features</button>
            <button onClick={() => nav("/books")} className="hover:text-white">Browse books</button>
            <button onClick={() => nav("/my-books")} className="hover:text-white">Author studio</button>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10">

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1.2fr] items-center">

            {/* LEFT SIDE */}
            <motion.div
              ref={heroRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live digital publishing platform
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
                Read powerful stories.{" "}
                <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
                  Publish your own.
                </span>
              </h1>

              <p className="text-sm md:text-base text-slate-300 max-w-xl">
                StoryVerse is your all-in-one space to discover digital books,
                publish your writing and earn from every reader with secure
                Razorpay payments.
              </p>

              {/* CTA BUTTONS */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => nav("/books")}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-sky-500 text-slate-950 text-sm font-semibold hover:bg-sky-400 shadow-lg shadow-sky-500/30"
                >
                  <FiBookOpen className="text-base" />
                  Start reading
                  <FiArrowRight className="text-sm" />
                </button>

                <button
                  onClick={() => nav("/signup")}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-slate-700 text-sm text-slate-100 hover:bg-slate-900"
                >
                  <FiPenTool className="text-sm" />
                  Become an author
                </button>
              </div>

              {/* ⭐️ STATS REMOVED HERE ⭐️ */}
            </motion.div>

            {/* RIGHT SIDE — animated showcase */}
            <motion.div
              ref={floatRef}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -top-10 -right-8 h-32 w-32 rounded-full bg-sky-500/30 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/30 blur-3xl" />

              {/* Here you can add your mockup UI */}
              {/* For now left empty as you asked */}
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="sv-features" className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                Why StoryVerse
              </p>
              <h2 className="text-xl md:text-2xl font-semibold mt-1">
                Everything you need to read & publish.
              </h2>
            </div>

            <button
              onClick={() => nav("/books")}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-700 text-xs text-slate-200 hover:bg-slate-900"
            >
              Browse all books
              <FiArrowRight className="text-sm" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<FiBookOpen />}
              title="Discover digital books"
              text="Search, filter and explore books in one clean reading experience."
            />
            <FeatureCard
              icon={<FiPenTool />}
              title="Author studio"
              text="Upload covers, set prices, publish drafts or live books easily."
            />
            <FeatureCard
              icon={<FiShield />}
              title="Secure payments"
              text="Razorpay handles all UPI & card payments with safety."
            />
            <FeatureCard
              icon={<FiZap />}
              title="Fast UI"
              text="Built with React, Tailwind, Framer Motion & GSAP."
            />
          </div>
        </section>

        {/* AUTHOR SECTION */}
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-7 md:px-8 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                For authors
              </p>
              <h3 className="text-lg md:text-xl font-semibold">
                Ready to publish your first book?
              </h3>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl">
                Upload a PDF or EPUB, set your price and go live. Control your
                entire publishing workflow inside StoryVerse.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => nav("/books/new")}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 shadow-lg shadow-emerald-500/30"
              >
                Publish a book
              </button>

              <button
                onClick={() => nav("/my-books")}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-700 text-xs text-slate-200 hover:bg-slate-900"
              >
                Go to author studio
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col gap-2"
    >
      <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400 text-lg">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <p className="text-xs text-slate-400">{text}</p>
    </motion.div>
  );
}
