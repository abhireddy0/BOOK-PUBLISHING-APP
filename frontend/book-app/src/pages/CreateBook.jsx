// src/pages/CreateBook.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

import {
  createBookApi,
  uploadBookCoverApi,
  uploadBookFileApi,
  setPublishApi,
} from "../api/books";

export default function CreateBook() {
  const { token } = useSelector((state) => state.user) || {};
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [publishNow, setPublishNow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [bookInfo, setBookInfo] = useState(null);

  // clean preview URL when unmounting / changing file
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalToken = token || localStorage.getItem("token");

    if (!finalToken) {
      toast.error("You are not logged in");
      return;
    }

    if (!title.trim()) return toast.error("Title is required");
    if (!description.trim()) return toast.error("Description is required");

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: price ? Number(price) : undefined,
      };

      const createRes = await createBookApi(payload, finalToken);
      const book = createRes.book;

      if (!book) {
        toast.error("Error creating book");
        return;
      }

      if (coverFile) {
        await uploadBookCoverApi(book._id, coverFile, finalToken);
      }

      if (bookFile) {
        await uploadBookFileApi(book._id, bookFile, finalToken);
      }

      if (publishNow) {
        await setPublishApi(book._id, true, finalToken);
      }

      toast.success("Book created successfully 🎉");
      nav("/my-books");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to create book. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <p className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
              Step 1 · Create book
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Create a new book
            </h1>
            <p className="text-xs text-slate-500">
              Add your book details, upload cover & file, and publish.
            </p>
          </div>
          <button
            type="button"
            onClick={() => nav("/my-books")}
            className="text-xs underline text-slate-500 hover:text-slate-800"
          >
            Back to My Books
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/60"
            placeholder="Eg. The Art of Writing"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className="min-h-[100px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/60 resize-y"
            placeholder="Describe your book..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Price + Publish */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Price (₹)
            </label>
            <input
              type="number"
              min="0"
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/60"
              placeholder="199"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="rounded border-slate-300"
              />
              Publish immediately
            </label>
            <p className="text-[11px] text-slate-400 mt-1">
              You can always change this later from your book settings.
            </p>
          </div>
        </div>

        {/* Files (beautiful UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 items-stretch">
          {/* Cover image */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Cover image
            </label>

            <label className="min-h-[140px] border border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:border-slate-500 transition flex items-center gap-4 bg-slate-50/40">
              {/* Left text */}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  {coverFile ? "Change cover image" : "Click to upload cover"}
                </p>
                <p className="text-[11px] text-slate-400">
                  JPG/PNG recommended (max 5MB)
                </p>
                <p className="text-[12px] text-slate-500 mt-1 line-clamp-1">
                  {coverFile ? coverFile.name : "No file chosen"}
                </p>
              </div>

              {/* Preview */}
              <div className="w-20 h-24 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center text-[10px] text-slate-400 border border-slate-200">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "Preview"
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
                    setCoverPreview(null);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Book file */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Book file (PDF / EPUB)
            </label>

            <label className="min-h-[140px] border border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:border-slate-500 transition flex items-center justify-between bg-slate-50/40">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  {bookFile ? "Change book file" : "Click to upload file"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Upload only if ready
                </p>
              </div>

              <div className="text-[12px] text-slate-500 text-right max-w-[60%] line-clamp-2">
                {bookInfo
                  ? `${bookInfo.name} • ${(bookInfo.size / (1024 * 1024)).toFixed(
                      2
                    )} MB`
                  : "No file chosen"}
              </div>

              <input
                type="file"
                accept=".pdf,.epub"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setBookFile(file);
                  if (file) {
                    setBookInfo({ name: file.name, size: file.size });
                  } else {
                    setBookInfo(null);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-6 rounded-xl bg-slate-900 text-white text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading && <ClipLoader size={16} color="#fff" />}
            {loading ? "Publishing..." : "Create Book"}
          </button>
        </div>
      </form>
    </div>
  );
}
