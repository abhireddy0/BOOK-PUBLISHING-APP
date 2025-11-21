// src/pages/Login.jsx
import React, { useState } from "react";
import { IoEyeOutline, IoEye } from "react-icons/io5";
import { useNavigate, Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { setUserData } from "../redux/userSlice";
import { login } from "../api/auth";
import cover from "../assets/cover.png";

// ✅ Reusable toast helpers (same style as Signup)
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

export default function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return showErrorToast("Please enter both email and password.");
    }

    try {
      setLoading(true);

      // ✅ Get { message, token, user } from API
      const data = await login({ email, password });

      // ✅ Save to Redux + localStorage
      dispatch(setUserData(data));
      localStorage.setItem("token", data.token);

      showSuccessToast("Logged in successfully ✨");

      // ✅ Role-based redirect
      if (data.user.role === "admin") {
        nav("/dashboard/admin");
      } else if (data.user.role === "author") {
        nav("/books/new"); // author → publish page
      } else {
        nav("/"); // reader
      }
    } catch (err) {
      showErrorToast(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-800 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40">
        <div className="grid lg:grid-cols-2">
          {/* LEFT - FORM */}
          <div className="px-6 py-8 sm:px-10 sm:py-10 flex items-center">
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">
                  Welcome back
                </p>
                <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mt-1">
                  Log in to StoryVerse
                </h1>
                <p className="text-sm text-neutral-500 mt-2">
                  Continue your journey of reading, writing, and publishing stories.
                </p>
              </div>

              {/* Email */}
              <div className="pt-2">
                <label className="text-xs font-medium text-neutral-700">
                  Email
                </label>
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-medium text-neutral-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 pr-11 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition"
                    type={show ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition"
                  >
                    {show ? <IoEye /> : <IoEyeOutline />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => nav("/forgot-password")}
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-4"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 w-full rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-neutral-900/20 transition"
              >
                {loading && <ClipLoader size={18} color="#fff" />}
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-xs text-neutral-500 mt-3 text-center">
                No account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-neutral-900 underline underline-offset-4"
                >
                  Create one
                </Link>
              </p>
            </form>
          </div>

          {/* RIGHT - VISUAL */}
          <div className="relative h-[220px] lg:h-full bg-black text-white">
            <img
              src={cover}
              alt="books"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/30" />

            <div className="relative z-10 h-full w-full flex flex-col justify-between p-6 sm:p-8">
              <div className="flex justify-end">
                {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/30 backdrop-blur-md text-[10px] uppercase tracking-[0.18em]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Secure login
                </div> */}
              </div>

              <div className="space-y-3 max-w-xs sm:max-w-md">
                <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold shadow-md shadow-black/40">
                  SV
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold">
                  Good to see you again ✍️
                </h3>
                <p className="text-sm text-white/70">
                  Pick up where you left off — manage your books, track sales, and
                  discover new stories.
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/80">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    🔒 Secure & private
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    📊 Author dashboards
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    📚 Personal library
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex justify-between items-center text-[11px] text-white/60 pt-4">
                <p>“Every login is a new chapter.”</p>
                <p>StoryVerse · 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
