import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiPenTool,
  FiShield,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";

export default function Landing() {
  const nav = useNavigate();
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 overflow-hidden">
      {/* background blobs */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -right-32 top-10 h-64 w-64 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute -left-24 bottom-10 h-64 w-64 rounded-full bg-purple-500/25 blur-3xl" />
      </div>

      <main className="relative z-10">
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            {/* text */}
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live digital publishing platform
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
                Read powerful stories{" "}
                <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
                  and publish your own.
                </span>
              </h1>

              <p className="text-sm md:text-base text-slate-300 max-w-md mx-auto md:mx-0">
                StoryVerse is your all-in-one space to discover digital books,
                publish your writing, and earn from every reader with secure
                Razorpay payments.
              </p>

              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={() => nav("/books")}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-sky-500 text-slate-950 text-sm font-semibold hover:bg-sky-400 shadow-lg shadow-sky-500/30 transition"
                >
                  <FiBookOpen className="text-base" />
                  Start reading
                  <FiArrowRight className="text-sm" />
                </button>

                <button
                  onClick={() => nav("/signup")}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-slate-700 text-sm text-slate-100 hover:bg-slate-900 transition"
                >
                  <FiPenTool className="text-sm" />
                  Become an author
                </button>

                <button
                  onClick={scrollToFeatures}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm text-slate-300 hover:text-white underline/50 hover:underline transition"
                >
                  See features
                </button>
              </div>
            </div>

            {/* simple image/quote side */}
            <div className="relative hidden md:block">
              <div className="absolute -top-10 -right-8 h-32 w-32 rounded-full bg-sky-500/30 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/30 blur-3xl" />
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-slate-300 text-sm">
                  “Publish drafts, set prices, and track sales — all in one
                  clean dashboard.”
                </p>
                <div className="mt-4 h-32 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800" />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="sv-features"
          ref={featuresRef}
          className="max-w-6xl mx-auto px-4 pb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 text-center md:text-left">
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
              className="mt-4 md:mt-0 inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-slate-700 text-xs text-slate-200 hover:bg-slate-900 transition"
            >
              Browse all books
              <FiArrowRight className="text-sm" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<FiBookOpen />}
              title="Discover digital books"
              text="Search, filter, and explore titles in a clean reading experience."
            />
            <FeatureCard
              icon={<FiPenTool />}
              title="Author studio"
              text="Upload covers, set prices, and publish drafts or live books easily."
            />
            <FeatureCard
              icon={<FiShield />}
              title="Secure payments"
              text="Razorpay handles UPI & cards with industry-standard safety."
            />
            <FeatureCard
              icon={<FiZap />}
              title="Fast UI"
              text="Built with React + Tailwind for a smooth experience."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col items-center md:items-start gap-2 text-center md:text-left transition transform hover:-translate-y-1 hover:scale-[1.01]">
      <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400 text-lg">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <p className="text-xs text-slate-400">{text}</p>
    </div>
  );
}
