import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../config/server";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // -------- STEP 1: SEND OTP ----------
  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${serverUrl}/auth/sendotp`, { email });
      toast.success(res.data.message || "OTP sent to your email 🎉");
      setStep(2);
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Failed to send OTP. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------- STEP 2: VERIFY OTP ----------
  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("OTP is required");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${serverUrl}/auth/verifyotp`, {
        email,
        otp,
      });
      toast.success(res.data.message || "OTP verified ✔");
      setStep(3);
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Invalid or expired OTP.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------- STEP 3: RESET PASSWORD ----------
  const handleStep3 = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Both password fields are required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${serverUrl}/auth/resetpassword`, {
        email,
        password,
      });
      toast.success("Password reset successfully 🎉");

      // Reset form
      setStep(1);
      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Failed to reset password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <form className="w-[400px] bg-white shadow-lg rounded-xl p-6 flex flex-col gap-4">

        <h1 className="text-xl font-semibold text-center mb-2">
          Forgot Password
        </h1>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/70"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || step !== 1}
          />
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <button
            onClick={handleStep1}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-black text-white text-sm hover:bg-black/90 disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Enter OTP</label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/70"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              onClick={handleStep2}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-black text-white text-sm hover:bg-black/90 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              className="text-xs underline text-gray-500 mt-1 self-end"
              onClick={handleStep1}
            >
              Resend OTP
            </button>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">New Password</label>
              <input
                type="password"
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Confirm New Password</label>
              <input
                type="password"
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/70"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handleStep3}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-black text-white text-sm hover:bg-black/90 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </>
        )}

        <p className="text-xs text-center text-gray-500 mt-2">
          Step {step} of 3
        </p>
      </form>
    </div>
  );
}
