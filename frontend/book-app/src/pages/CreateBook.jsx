import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import {
  FiUploadCloud,
  FiImage,
  FiFileText,
  FiBookOpen,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

import {
  createBookApi,
  uploadBookCoverApi,
  uploadBookFileApi,
  setPublishApi,
} from "../api/books";

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

  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingBook, setIsDraggingBook] = useState(false);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const finalToken = token || localStorage.getItem("token");

  const handleCoverFile = (file) => {
    if (!file) {
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please upload a valid image file for the cover.");
      return;
    }

    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const handleBookFile = (file) => {
    if (!file) {
      setBookFile(null);
      setBookInfo(null);
      return;
    }

    const ext = file.name.toLowerCase().split(".").pop();
    if (!["pdf", "epub"].includes(ext)) {
      showErrorToast("Please upload a .pdf or .epub file for the book.");
      return;
    }

    setBookFile(file);
    setBookInfo({ name: file.name, size: file.size });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!finalToken) {
      showErrorToast("You are not logged in.");
      return;
    }

    if (!title.trim()) return showErrorToast("Title is required.");
    if (!description.trim())
      return showErrorToast("Short description is required.");

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
        showErrorToast("Error creating book. Please try again.");
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

      showSuccessToast(
        publishNow
          ? "Book published successfully 🎉"
          : "Book saved as draft successfully 🎉"
      );
      nav("/my-books");
    } catch (err) {
      console.error(err);
      showErrorToast(
        err?.response?.data?.message ||
          "Failed to create book. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCoverDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(true);
  };

  const handleCoverDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
  };

  const handleCoverDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleCoverFile(file);
  };

  const handleBookDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBook(true);
  };

  const handleBookDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBook(false);
  };

  const handleBookDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBook(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleBookFile(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-sky-500/40 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between text-slate-200 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Author Studio
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Publish a new book
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Add your details, upload files, and choose whether to go live now
              or save as a draft.
            </p>
          </div>

          <button
            type="button"
            onClick={() => nav("/my-books")}
            className="text-xs md:text-sm px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 whitespace-nowrap"
          >
            ← Back to My Books
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] bg-slate-900/70 border border-slate-800 rounded-2xl shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur p-5 md:p-7">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 md:border-r md:border-slate-800/70 pr-0 md:pr-6"
          >
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
              <span className="h-5 px-2 rounded-full bg-slate-800 text-[10px] inline-flex items-center justify-center">
                Step 1 of 1
              </span>
              <span>Create book details</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                className="h-10 rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/60 text-slate-100 placeholder:text-slate-500"
                placeholder="Eg. The Art of Writing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                Short description <span className="text-red-400">*</span>
              </label>
              <textarea
                className="min-h-[90px] rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/60 text-slate-100 placeholder:text-slate-500 resize-y"
                placeholder="Describe your book in 2–3 lines. This appears on the store page."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

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
                    placeholder="199"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Leave empty or 0 for a free book.
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
                  Publish immediately
                </label>
                <p className="text-[10px] text-slate-500">
                  If unchecked, the book will be saved as a draft and won’t
                  appear in the store.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-200 flex items-center gap-1">
                  <FiImage className="text-slate-400" />
                  Cover image
                  <span className="text-[10px] text-slate-500">
                    (click or drag & drop)
                  </span>
                </label>

                <label
                  className={`min-h-[130px] border border-dashed rounded-xl p-4 cursor-pointer transition flex items-center gap-4 bg-slate-950/60 ${
                    isDraggingCover
                      ? "border-sky-500 bg-slate-900/80"
                      : "border-slate-600 hover:border-sky-500/70 hover:bg-slate-900/80"
                  }`}
                  onDragOver={handleCoverDragOver}
                  onDragEnter={handleCoverDragOver}
                  onDragLeave={handleCoverDragLeave}
                  onDrop={handleCoverDrop}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-slate-100">
                      {coverFile
                        ? "Change cover image"
                        : "Click or drop to upload"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      JPG / PNG · Recommended 3:4 ratio
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {coverFile ? coverFile.name : "No file chosen yet"}
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
                    onChange={(e) =>
                      handleCoverFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-200 flex items-center gap-1">
                  <FiFileText className="text-slate-400" />
                  Book file (PDF / EPUB)
                  <span className="text-[10px] text-slate-500">
                    (click or drag & drop)
                  </span>
                </label>

                <label
                  className={`min-h-[130px] border border-dashed rounded-xl p-4 cursor-pointer transition flex items-center justify-between bg-slate-950/60 ${
                    isDraggingBook
                      ? "border-sky-500 bg-slate-900/80"
                      : "border-slate-600 hover:border-sky-500/70 hover:bg-slate-900/80"
                  }`}
                  onDragOver={handleBookDragOver}
                  onDragEnter={handleBookDragOver}
                  onDragLeave={handleBookDragLeave}
                  onDrop={handleBookDrop}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-100">
                      {bookFile ? "Change book file" : "Upload final file"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      .pdf / .epub · Upload only when ready
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 max-w-[220px]">
                      {bookInfo
                        ? `${bookInfo.name} • ${(
                            bookInfo.size /
                            (1024 * 1024)
                          ).toFixed(2)} MB`
                        : "No file chosen yet"}
                    </p>
                  </div>

                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-800/80 border border-slate-700">
                    <FiUploadCloud className="text-lg text-slate-200" />
                  </div>

                  <input
                    type="file"
                    accept=".pdf,.epub"
                    onChange={(e) =>
                      handleBookFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-6 rounded-xl bg-sky-500 text-slate-950 text-sm font-semibold flex items-center gap-2 hover:bg-sky-400 disabled:opacity-60 shadow-lg shadow-sky-500/30"
              >
                {loading && <ClipLoader size={16} color="#020617" />}
                {loading ? "Publishing..." : "Create book"}
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Live preview
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col gap-4 shadow-inner">
              <div className="flex gap-4">
                <div className="w-28 h-40 rounded-xl bg-gradient-to-br from-sky-500/30 via-purple-500/20 to-emerald-400/30 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Preview cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-200 text-xs px-3 text-center">
                      <FiBookOpen className="text-xl" />
                      <span>Cover preview</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <p className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-medium text-emerald-200 w-fit">
                    StoryVerse · Draft preview
                  </p>
                  <h2 className="mt-1 text-base md:text-lg font-semibold text-slate-50 line-clamp-2">
                    {title || "Your book title appears here"}
                  </h2>
                  <p className="text-[11px] text-slate-400 line-clamp-3 mt-1">
                    {description ||
                      "Write a short, catchy description. This is what readers see on the book detail page."}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">
                    {price ? `₹${price}` : "₹0 · Free"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {publishNow
                      ? "Status: Will be published immediately after creation."
                      : "Status: Will be saved as a draft (hidden from store)."}
                  </p>
                </div>
              </div>

              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-400">
                <p>
                  ✅ Secure payments are handled by Razorpay on the reader side.
                </p>
                <p className="mt-1">
                  ✅ You can always edit price, description, cover & file later
                  from{" "}
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
