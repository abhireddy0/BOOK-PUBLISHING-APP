// src/pages/Signup.jsx
import React, { useState } from "react";
import { IoEyeOutline, IoEye } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { signup } from "../api/auth";
import cover from "../assets/cover.png";

// Reusable toast helpers (✅ now using dark theme so text is visible)
const showErrorToast = (message) =>
  toast.error(
    <div className="flex items-start gap-3">
      <FiAlertCircle className="text-red-400 text-xl mt-0.5" />
      <span className="text-white text-sm">{message}</span>
    </div>,
    {
      icon: false,
      theme: "dark",
    }
  );

const showSuccessToast = (message) =>
  toast.success(
    <div className="flex items-start gap-3">
      <FiCheckCircle className="text-emerald-400 text-xl mt-0.5" />
      <span className="text-white text-sm">{message}</span>
    </div>,
    {
      icon: false,
      theme: "dark",
    }
  );

export default function Signup() {
  const [show, setShow] = useState(false);
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "reader", // DEFAULT → Reader
  });

  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      return showErrorToast("Please fill in all the required fields.");
    }

    try {
      setLoading(true);
      await signup(form);

      showSuccessToast(
        "Account created successfully! You can now log in to StoryVerse."
      );

      nav("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Signup failed. Please try again.";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-800 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40">
        <div className="grid lg:grid-cols-2">
          {/* LEFT SIDE - FORM */}
          <div className="px-6 py-8 sm:px-10 sm:py-10 flex items-center">
            <form onSubmit={handleSignup} className="w-full space-y-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">
                  Welcome to
                </p>
                <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mt-1">
                  StoryVerse
                </h1>
                <p className="text-sm text-neutral-500 mt-2">
                  Create your account to start writing, publishing, and reading
                  powerful stories.
                </p>
              </div>

              {/* Name */}
              <div className="pt-2">
                <label className="text-xs font-medium text-neutral-700">
                  Name
                </label>
                <input
                  name="name"
                  className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition"
                  placeholder="Your name"
                  value={form.name}
                  onChange={onChange}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-neutral-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-medium text-neutral-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    name="password"
                    type={show ? "text" : "password"}
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 pr-11 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={onChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition"
                  >
                    {show ? <IoEye /> : <IoEyeOutline />}
                  </button>
                </div>
              </div>

              {/* Role Buttons */}
              <div className="pt-1">
                <p className="text-xs font-medium text-neutral-700 mb-1.5">
                  Choose your role
                </p>
                <div className="flex flex-wrap gap-2">
                  {["reader", "author"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r })}
                      className={`px-4 h-9 rounded-full border text-xs font-medium capitalize transition flex items-center gap-1.5 ${
                        form.role === r
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                          : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="inline-block h-2 w-2 rounded-full bg-current" />
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 w-full rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-neutral-900/20 transition"
              >
                {loading && <ClipLoader size={18} color="#fff" />}
                {loading ? "Creating account..." : "Sign Up"}
              </button>

              <p className="text-xs text-neutral-500 mt-3 text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-neutral-900 underline underline-offset-4"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>

          {/* RIGHT SIDE - VISUAL */}
          <div className="relative h-[220px] lg:h-full bg-black text-white">
            <img
              src={cover}
              alt="books"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/30" />

            <div className="relative z-10 h-full w-full flex flex-col justify-between p-6 sm:p-8">
              <div className="flex justify-end">
                {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/30 backdrop-blur-md text-[10px] uppercase tracking-[0.18em]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live publishing platform
                </div> */}
              </div>

              <div className="space-y-3 max-w-xs sm:max-w-md">
                <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold shadow-md shadow-black/40">
                  SV
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold">
                  Where stories come to life.
                </h3>
                <p className="text-sm text-white/70">
                  Publish your own books, build an audience, and discover
                  thousands of worlds written by creators like you.
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/80">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    ✍️ For authors & readers
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    📚 Upload & sell books
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    ⭐ Ratings & reviews
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex justify-between items-center text-[11px] text-white/60 pt-4">
                <p>“Every great story deserves a universe.”</p>
                <p>StoryVerse · 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
