import React, { useState } from "react";
import { IoEyeOutline, IoEye } from "react-icons/io5";
import { useNavigate, Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { login } from "../api/auth";
import cover from "../assets/cover.png";

export default function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Email & password required");
    try {
      setLoading(true);
      const data = await login({ email, password }); // { token, user }
      dispatch(setUserData(data));
      toast.success("Logged in ✨");

      // role-based redirect
      if (data.user.role === "admin") nav("/dashboard/admin");
      else if (data.user.role === "author") nav("/dashboard/author");
      else nav("/"); // reader or default
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-200 w-screen h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="w-[900px] h-[520px] bg-white shadow-xl rounded-2xl flex overflow-hidden"
      >
        {/* left */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center gap-3 p-6">
          <div className="w-full max-w-[340px]">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-neutral-600 mb-4">Log in to your account</p>

            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 mb-3 h-11 w-full rounded-md border border-neutral-300 px-3 focus:ring-2 focus:ring-black/30"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                className="mt-1 h-11 w-full rounded-md border border-neutral-300 px-3 pr-10 focus:ring-2 focus:ring-black/30"
                type={show ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {show ? <IoEye /> : <IoEyeOutline />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
  <button
    type="button"
    onClick={() => nav("/forgot-password")}
    className="text-xs text-neutral-600 hover:text-black underline"
  >
    Forgot password?
  </button>
</div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 h-11 w-full rounded-xl bg-black text-white hover:bg-black/90 flex items-center justify-center gap-2"
            >
              {loading && <ClipLoader size={18} color="#fff" />} Log in
            </button>

            <p className="text-sm text-neutral-600 mt-3">
              No account? <Link to="/signup" className="underline">Create one</Link>
            </p>
          </div>
        </div>

        {/* right — StoryVerse branding */}
        <div className="w-1/2 h-full bg-black text-white flex items-center justify-center relative">
          <img
            src={cover}
            alt="books"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="relative z-10 text-center px-8">
            <div className="mx-auto mb-3 h-14 w-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold">
              SV
            </div>
            <h3 className="text-3xl font-semibold">StoryVerse</h3>
            <p className="text-white/70 text-sm mt-2">Welcome back ✍️</p>
          </div>
        </div>
      </form>
    </div>
  );
}
