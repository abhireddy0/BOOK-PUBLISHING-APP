import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

import { getMyProfileApi, updateMyProfileApi } from "../api/user";
import { setUserData } from "../redux/userSlice";

const showErrorToast = (message) =>
  toast.error(
    <div className="flex items-start gap-3">
      <FiAlertCircle className="text-red-400 text-xl mt-0.5" />
      <span className="text-white text-sm">{message}</span>
    </div>,
    { icon: false, theme: "dark" }
  );

const showSuccessToast = (message) =>
  toast.success(
    <div className="flex items-start gap-3">
      <FiCheckCircle className="text-emerald-400 text-xl mt-0.5" />
      <span className="text-white text-sm">{message}</span>
    </div>,
    { icon: false, theme: "dark" }
  );

export default function Profile() {
  const { user, token } = useSelector((state) => state.user) || {};
  const dispatch = useDispatch();
  const nav = useNavigate();

  const finalToken =
    token ||
    localStorage.getItem("token") ||
    JSON.parse(localStorage.getItem("storyverse_auth") || "null")?.token;

  const [form, setForm] = useState({
    name: "",
    bio: "",
    photoUrl: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!finalToken) {
        nav("/login");
        return;
      }

      try {
        setLoading(true);
        const profile = await getMyProfileApi(finalToken);
        setForm({
          name: profile.name || "",
          bio: profile.bio || "",
          photoUrl: profile.photoUrl || "",
          email: profile.email || "",
          role: profile.role || "",
        });

        dispatch(setUserData({ user: profile, token: finalToken }));
      } catch (err) {
        showErrorToast(err?.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [finalToken, dispatch, nav]);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!finalToken) return;

    try {
      setSaving(true);
      const payload = {
        name: form.name,
        bio: form.bio,
        photoUrl: form.photoUrl, // will map to avatar on backend
      };

      const data = await updateMyProfileApi(payload, finalToken);
      const updated = data.user;

      // keep Redux & localStorage in sync
      dispatch(setUserData({ user: updated, token: finalToken }));

      const stored = JSON.parse(localStorage.getItem("storyverse_auth") || "null");
      if (stored) {
        localStorage.setItem(
          "storyverse_auth",
          JSON.stringify({ ...stored, user: updated })
        );
      }

      showSuccessToast("Profile updated successfully ✨");
    } catch (err) {
      showErrorToast(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <ClipLoader size={32} color="#e5e7eb" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">
              Your profile
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mt-1">
              Account details
            </h1>
            <p className="text-sm text-neutral-500 mt-2 mb-5">
              Update how your name and photo appear across StoryVerse.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3 text-sm text-neutral-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700">Role</label>
                <input
                  type="text"
                  value={form.role}
                  disabled
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3 text-sm text-neutral-500 capitalize"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700">Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={form.bio}
                  onChange={onChange}
                  placeholder="Tell readers a little about yourself..."
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700">Photo URL</label>
                <input
                  type="text"
                  name="photoUrl"
                  value={form.photoUrl}
                  onChange={onChange}
                  placeholder="https://..."
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition"
                />
                <p className="mt-1 text-[11px] text-neutral-500">
                  (Optional) You can paste an image URL now. Direct upload button coming later.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 h-10 w-full rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-neutral-900/20 transition"
              >
                {saving && <ClipLoader size={16} color="#fff" />}
                {saving ? "Saving changes..." : "Save changes"}
              </button>
            </form>
          </div>

          <div className="relative bg-black text-white">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950" />
            <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-6 gap-4">
              <div className="h-20 w-20 rounded-full border border-white/30 bg-white/10 overflow-hidden flex items-center justify-center text-2xl font-semibold">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  (form.name || "SV").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold">{form.name || "Your name"}</p>
                <p className="text-sm text-white/70">
                  {form.bio || "This is how readers will see you as an author."}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/80">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">✍️ Author profile</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">📚 Shown on your books</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
