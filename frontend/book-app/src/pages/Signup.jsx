// src/pages/Signup.jsx
import React, { useState } from "react";
import { IoEyeOutline, IoEye } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { signup } from "../api/auth";
import cover from "../assets/cover.png";

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

    if (!form.name || !form.email || !form.password)
      return toast.error("All fields are required");

    try {
      setLoading(true);
      await signup(form);
      toast.success("Account created! Please login.");
      nav("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-200 w-screen h-screen flex items-center justify-center">
      <form
        onSubmit={handleSignup}
        className="w-[900px] h-[520px] bg-white shadow-xl rounded-2xl flex overflow-hidden"
      >
        {/* LEFT SIDE */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center gap-3 p-6">
          <div className="w-full max-w-[340px]">
            <h1 className="text-2xl font-semibold">Join StoryVerse</h1>
            <p className="text-neutral-600 mb-4">Create your account</p>

            {/* Name */}
            <label className="text-sm font-medium">Name</label>
            <input
              name="name"
              className="mt-1 mb-3 h-11 w-full rounded-md border border-neutral-300 px-3 focus:ring-2 focus:ring-black/30"
              placeholder="Your name"
              value={form.name}
              onChange={onChange}
            />

            {/* Email */}
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              className="mt-1 mb-3 h-11 w-full rounded-md border border-neutral-300 px-3 focus:ring-2 focus:ring-black/30"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
            />

            {/* Password */}
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                name="password"
                type={show ? "text" : "password"}
                className="mt-1 h-11 w-full rounded-md border border-neutral-300 px-3 pr-10 focus:ring-2 focus:ring-black/30"
                placeholder="Your password"
                value={form.password}
                onChange={onChange}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {show ? <IoEye /> : <IoEyeOutline />}
              </button>
            </div>

            {/* Role Buttons */}
            <div className="flex gap-2 mt-3">
              {["reader", "author"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`px-3 h-9 rounded-full border text-sm ${
                    form.role === r
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white border-neutral-300 hover:border-neutral-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 h-11 w-full rounded-xl bg-black text-white hover:bg-black/90 flex items-center justify-center gap-2"
            >
              {loading && <ClipLoader size={18} color="#fff" />} Sign Up
            </button>

            <p className="text-sm text-neutral-600 mt-3">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
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
            <p className="text-white/70 text-sm mt-2">
              Where stories are born ✨
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
