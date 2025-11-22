
import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../config/server";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FiMail,
  FiKey,
  FiCheckCircle,
  FiAlertCircle, 
} from "react-icons/fi";


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

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!email) return showErrorToast("Email is required.");
    try {
      setLoading(true);
      const res = await axios.post(`${serverUrl}/auth/sendotp`, { email });
      showSuccessToast(res.data.message || "OTP sent to your email 🎉");
      setStep(2);
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Failed to send OTP. Try again.";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!otp) return showErrorToast("OTP is required.");
    try {
      setLoading(true);
      const res = await axios.post(`${serverUrl}/auth/verifyotp`, {
        email,
        otp,
      });
      showSuccessToast(res.data.message || "OTP verified ✔");
      setStep(3);
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Invalid or expired OTP.";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword)
      return showErrorToast("Both password fields are required.");
    if (password !== confirmPassword)
      return showErrorToast("Passwords do not match ❌");

    try {
      setLoading(true);
      await axios.post(`${serverUrl}/auth/resetpassword`, {
        email,
        password,
      });
      showSuccessToast("Password reset successfully 🎉 Please login.");

      setStep(1);
      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");

      nav("/login");
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Failed to reset password.";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-800 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-0 items-stretch">
       
          <div className="hidden md:flex flex-col justify-between bg-neutral-950 text-slate-50 p-7 border-r border-white/10">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-200">
                  <span className="h-6 w-6 rounded-xl bg-white/10 flex items-center justify-center text-[11px] font-semibold">
                    SV
                  </span>
                  StoryVerse
                </div>
                <p className="text-[10px] text-slate-400">
                  🔒 Secure recovery
                </p>
              </div>

              <h1 className="text-2xl font-semibold leading-snug">
                Reset your password in 3 simple steps.
              </h1>
              <p className="mt-3 text-sm text-slate-300/90 leading-relaxed">
                Enter your registered email, verify the OTP we send you, and set
                a new password. We never share your credentials with anyone.
              </p>
            </div>

            <div className="mt-6 space-y-3 text-xs text-slate-300/90">
              <div className="flex items-start gap-3">
                <div className="mt-[2px]">
                  <FiMail className="text-sky-300" />
                </div>
                <div>
                  <p className="font-medium text-slate-100">Step 1 — Email</p>
                  <p className="text-slate-400">
                    Provide the email linked to your StoryVerse account. We’ll
                    send a one-time password (OTP) to verify it’s really you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-[2px]">
                  <FiKey className="text-amber-300" />
                </div>
                <div>
                  <p className="font-medium text-slate-100">
                    Step 2 — Verify OTP
                  </p>
                  <p className="text-slate-400">
                    Enter the 4-digit OTP from your email. If it expires or you
                    didn’t receive it, you can resend a new code.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-[2px]">
                  <FiCheckCircle className="text-emerald-300" />
                </div>
                <div>
                  <p className="font-medium text-slate-100">
                    Step 3 — Set new password
                  </p>
                  <p className="text-slate-400">
                    Choose a strong password you haven’t used before. Once
                    saved, you can log in instantly with your new credentials.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[10px] text-slate-500">
              We only use your email to verify your identity. Your password is
              encrypted and never stored in plain text.
            </p>
          </div>

 
          <form className="w-full bg-neutral-950/95 text-slate-50 border-l md:border-l-0 border-neutral-900 shadow-[0_20px_60px_rgba(15,23,42,0.9)] rounded-3xl md:rounded-none p-6 md:p-7 flex flex-col gap-5">
    
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-1">
                  Password recovery
                </p>
                <h2 className="text-lg font-semibold text-slate-50">
                  Forgot your password?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Follow the steps below to securely reset your password.
                </p>
              </div>
              <div className="flex flex-col items-end text-[11px] text-slate-400">
                <span
                  className={
                    step >= 1 ? "font-semibold text-sky-300" : "text-slate-500"
                  }
                >
                  Step {step}
                </span>
                <span className="text-slate-500">of 3</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] border 
                    ${
                      step === s
                        ? "bg-sky-500 text-slate-950 border-sky-400"
                        : step > s
                        ? "bg-emerald-500 text-slate-950 border-emerald-400"
                        : "bg-neutral-900 text-slate-500 border-neutral-700"
                    }`}
                  >
                    {step > s ? "✓" : s}
                  </div>
                  {s === 1 && <span>Email</span>}
                  {s === 2 && <span>OTP</span>}
                  {s === 3 && <span>New password</span>}
                </div>
              ))}
            </div>

        
            <div className="flex flex-col gap-1 mt-3">
              <label className="text-xs font-medium text-slate-200">
                Registered email
              </label>
              <input
                type="email"
                className="border border-neutral-700 bg-neutral-900/80 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || step !== 1}
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                We’ll send the OTP to this email address.
              </p>
            </div>

         
            {step === 1 && (
              <button
                onClick={handleStep1}
                disabled={loading}
                className="mt-2 w-full py-2.5 rounded-lg bg-sky-500 text-slate-950 text-sm font-medium hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-sky-500/30"
              >
                {loading ? "Sending OTP..." : "Send OTP to email"}
              </button>
            )}

         
            {step === 2 && (
              <>
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs font-medium text-slate-200">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    className="border border-neutral-700 bg-neutral-900/80 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-500 tracking-[0.35em] text-center"
                    placeholder="••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Check your inbox and spam folder for the 4-digit code.
                  </p>
                </div>

                <button
                  onClick={handleStep2}
                  disabled={loading}
                  className="mt-2 w-full py-2.5 rounded-lg bg-emerald-500 text-slate-950 text-sm font-medium hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-500/30"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  className="text-[11px] underline text-slate-400 mt-2 self-end hover:text-slate-200"
                  onClick={handleStep1}
                  disabled={loading}
                >
                  Didn’t receive code? Resend OTP
                </button>
              </>
            )}

           
            {step === 3 && (
              <>
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs font-medium text-slate-200">
                    New password
                  </label>
                  <input
                    type="password"
                    className="border border-neutral-700 bg-neutral-900/80 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-500"
                    placeholder="Enter a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-200">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    className="border border-neutral-700 bg-neutral-900/80 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-500"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleStep3}
                  disabled={loading}
                  className="mt-2 w-full py-2.5 rounded-lg bg-emerald-500 text-slate-950 text-sm font-medium hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-500/30"
                >
                  {loading ? "Saving..." : "Reset password & login"}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => nav("/login")}
              className="mt-3 text-[11px] text-slate-400 hover:text-slate-200 text-center"
            >
              Remembered your password?{" "}
              <span className="underline">Back to login</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
