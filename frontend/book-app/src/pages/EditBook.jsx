// src/pages/EditBook.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { FiUploadCloud, FiImage, FiFileText, FiBookOpen } from "react-icons/fi";

import {
  getBookByIdApi,
  updateBookApi,
  uploadBookCoverApi,
  uploadBookFileApi,
  setPublishApi,
} from "../api/books";

export default function EditBook() {
  const { id } = useParams(); // bookId from URL
  const { token } = useSelector((state) => state.user) || {};
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [publishNow, setPublishNow] = useState(false);

  const [coverFile, setCoverFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);

  const [currentBook, setCurrentBook] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [bookInfo, setBookInfo] = useState(null);

  const finalToken = token || localStorage.getItem("token");

  useEffect(() => {
    const loadBook = async () => {
      try {
        if (!finalToken) {
          toast.error("You are not logged in");
          return;
        }

        const book = await getBookByIdApi(id, finalToken);
        setCurrentBook(book);
        setTitle(book.title || "");
        setDescription(book.description || "");
        setPrice(book.price ?? "");
        setPublishNow(book.published || false);
        setCoverPreview(book.coverImage || null);

        if (book.fileUrl) {
          try {
            const urlParts = book.fileUrl.split("/");
            const lastSegment = urlParts[urlParts.length - 1];
            setBookInfo({ name: lastSegment, size: null });
          } catch {
            setBookInfo({ name: "Existing file attached", size: null });
          }
        }
      } catch (err) {
        console.error(err);
        toast.error(
          err?.response?.data?.message || "Failed to load book details"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Title is required");
    if (!description.trim()) return toast.error("Description is required");

    try {
      setSaving(true);

      // 1) Update fields
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: price ? Number(price) : undefined,
      };

      await updateBookApi(id, payload, finalToken);

      // 2) Upload new cover if selected
      if (coverFile) {
        await uploadBookCoverApi(id, coverFile, finalToken);
      }

      // 3) Upload new file if selected
      if (bookFile) {
        await uploadBookFileApi(id, bookFile, finalToken);
      }

      // 4) Publish/unpublish
      if (publishNow !== currentBook.published) {
        await setPublishApi(id, publishNow, finalToken);
      }

      toast.success("Book updated successfully ✨");
      nav("/my-books");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update book"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
        <ClipLoader size={40} />
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-3">
        <p className="text-sm text-slate-300">Book not found.</p>
        <button
          onClick={() => nav("/my-books")}
          className="px-4 h-9 rounded-lg bg-slate-100 text-slate-900 text-sm"
        >
          Back to My Books
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-10">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-sky-500/40 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between text-slate-200">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Author Studio
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Edit “{currentBook.title || "Untitled"}”
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Update your book details, cover, files, and publish status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => nav("/my-books")}
            className="text-xs md:text-sm px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800"
          >
            ← Back to My Books
          </button>
        </div>

        {/* main card */}
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] bg-slate-900/70 border border-slate-800 rounded-2xl shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur p-5 md:p-7">
          {/* LEFT – form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 border-r border-slate-800/70 pr-0 md:pr-6"
          >
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
              <span className="h-5 px-2 rounded-full bg-slate-800 text-[10px] inline-flex items-center justify-center">
                Edit mode
              </span>
              <span>Changes go live after you click “Save changes”.</span>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                className="h-10 rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/60 text-slate-100 placeholder:text-slate-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                Short description <span className="text-red-400">*</span>
              </label>
              <textarea
                className="min-h-[90px] rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/60 text-slate-100 placeholder:text-slate-500 resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Price + Publish */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-200">
                  Price (₹)
                </label>
                <div className="flex items-center rounded-lg border border-slate-700/80 bg-slate-950/80 px-3">
                  <span className="text-xs text-slate-400 mr-1.5">₹</span>
                  <input
                    type="number"
                    min="0"
                    className="h-9 flex-1 bg-transparent text-sm outline-none text-slate-100 placeholder:text-slate-500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Set to 0 if you want to make this book free.
                </p>
              </div>

              <div className="flex flex-col justify-center gap-1">
                <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={publishNow}
                    onChange={(e) => setPublishNow(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-sky-500"
                  />
                  Published
                </label>
                <p className="text-[10px] text-slate-500">
                  Uncheck to move this book back to draft (hidden from store).
                </p>
              </div>
            </div>

            {/* Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              {/* Cover replace */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-200 flex items-center gap-1">
                  <FiImage className="text-slate-400" />
                  Replace cover image
                </label>
                <label className="min-h-[120px] border border-dashed border-slate-600 rounded-xl p-4 cursor-pointer hover:border-sky-500/70 hover:bg-slate-900/80 transition flex items-center gap-4 bg-slate-950/60">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-slate-100">
                      {coverFile ? "New cover selected" : "Click to upload"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Leave empty to keep the current cover.
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {coverFile
                        ? coverFile.name
                        : currentBook.coverImage
                        ? "Existing cover in use"
                        : "No cover yet"}
                    </p>
                  </div>

                  <div className="w-16 h-20 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 overflow-hidden">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUploadCloud className="text-lg" />
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setCoverFile(file);
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setCoverPreview(url);
                      } else {
                        setCoverFile(null);
                        setCoverPreview(currentBook.coverImage || null);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* File replace */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-200 flex items-center gap-1">
                  <FiFileText className="text-slate-400" />
                  Replace book file
                </label>
                <label className="min-h-[120px] border border-dashed border-slate-600 rounded-xl p-4 cursor-pointer hover:border-sky-500/70 hover:bg-slate-900/80 transition flex items-center justify-between bg-slate-950/60">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-100">
                      {bookFile ? "New file selected" : "Click to upload file"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Leave empty to keep existing file.
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 max-w-[220px]">
                      {bookFile
                        ? `${bookFile.name}`
                        : bookInfo
                        ? bookInfo.name
                        : "No file attached yet"}
                    </p>
                  </div>

                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-800/80 border border-slate-700">
                    <FiUploadCloud className="text-lg text-slate-200" />
                  </div>

                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setBookFile(file);
                      if (file) {
                        setBookInfo({ name: file.name, size: file.size });
                      } else {
                        setBookFile(null);
                        if (currentBook.fileUrl) {
                          try {
                            const urlParts = currentBook.fileUrl.split("/");
                            const lastSegment = urlParts[urlParts.length - 1];
                            setBookInfo({ name: lastSegment, size: null });
                          } catch {
                            setBookInfo({
                              name: "Existing file attached",
                              size: null,
                            });
                          }
                        } else {
                          setBookInfo(null);
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-6 rounded-xl bg-emerald-500 text-slate-950 text-sm font-semibold flex items-center gap-2 hover:bg-emerald-400 disabled:opacity-60 shadow-lg shadow-emerald-500/30"
              >
                {saving && <ClipLoader size={16} color="#020617" />}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>

          {/* RIGHT – live preview */}
          <div className="flex flex-col gap-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Live preview
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col gap-4 shadow-inner">
              <div className="flex gap-4">
                {/* book cover preview */}
                <div className="w-28 h-40 rounded-xl bg-gradient-to-br from-sky-500/30 via-purple-500/20 to-emerald-400/30 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Preview cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-200 text-xs px-3">
                      <FiBookOpen className="text-xl" />
                      <span>Cover preview</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <p className="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-[10px] font-medium text-sky-200 w-fit">
                    Store preview
                  </p>
                  <h2 className="mt-1 text-base md:text-lg font-semibold text-slate-50 line-clamp-2">
                    {title || "Book title will appear here"}
                  </h2>
                  <p className="text-[11px] text-slate-400 line-clamp-3 mt-1">
                    {description ||
                      "Update your short description and see how it looks to readers on the store page."}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">
                    {price ? `₹${price}` : "₹0 · Free"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {publishNow
                      ? "Status: Published (visible in store)."
                      : "Status: Draft (hidden from store)."}
                  </p>
                </div>
              </div>

              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-400">
                <p>💡 Changes to price, description, files, and cover are live once you save.</p>
                <p className="mt-1">
                  ✅ You can always toggle publish / draft from{" "}
                  <span className="text-slate-200 font-medium">My Books</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
