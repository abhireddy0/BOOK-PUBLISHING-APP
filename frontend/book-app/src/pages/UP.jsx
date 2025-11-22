import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { getMeApi, updateMeApi, updatePasswordApi, updateAvatarApi } from "../api/user";
import { setUserData } from "../redux/userSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.user) || {};
  const finalToken = token || localStorage.getItem("token");

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMeApi(finalToken);
        setMe(data);
        setName(data?.name || "");
        setBio(data?.bio || "");
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [finalToken]);

  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const saveAvatar = async () => {
    if (!file) return toast.info("Choose a picture first");
    try {
      setSavingAvatar(true);
      const res = await updateAvatarApi(file, finalToken);
      setMe(res.user);
      dispatch(setUserData({ token: finalToken, user: { ...user, ...res.user } }));
      toast.success("Avatar updated");
      setFile(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update avatar");
    } finally {
      setSavingAvatar(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      const res = await updateMeApi({ name, bio }, finalToken);
      setMe(res.user);
      dispatch(setUserData({ token: finalToken, user: { ...user, ...res.user } }));
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) return toast.info("Fill both password fields");
    try {
      setSavingPassword(true);
      await updatePasswordApi({ currentPassword, newPassword }, finalToken);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <ClipLoader size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Manage your photo, info and password.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Avatar card */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Profile photo</h2>

            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
                {preview ? (
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : me?.avatar ? (
                  <img src={me.avatar} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-500 text-xs">No photo</div>
                )}
              </div>

              <div className="space-y-2">
                <input type="file" accept="image/*" onChange={onPickAvatar} className="block text-xs text-slate-600" />
                <button
                  onClick={saveAvatar}
                  disabled={savingAvatar || !file}
                  className="h-9 px-4 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60"
                >
                  {savingAvatar ? "Saving..." : "Save photo"}
                </button>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              Dev tip: to preview fast, you can temporarily set <code>user.avatar</code> to{" "}
              <code>/mnt/data/Screenshot 2025-11-21 162319.png</code> after login.
            </p>
          </div>

          {/* Basic info */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Basic info</h2>

            <label className="block text-xs text-slate-600 mb-1">Name</label>
            <input
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="block text-xs text-slate-600 mt-3 mb-1">Email</label>
            <input
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500"
              value={me?.email || ""}
              disabled
            />

            <label className="block text-xs text-slate-600 mt-3 mb-1">Bio (optional)</label>
            <textarea
              className="w-full min-h-[80px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              placeholder="Tell readers about yourself…"
            />

            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="mt-4 h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
          </div>

          {/* Password card */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Change password</h2>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Current password</label>
                <input
                  type="password"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">New password</label>
                <input
                  type="password"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={savePassword}
              disabled={savingPassword}
              className="mt-4 h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
            >
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
