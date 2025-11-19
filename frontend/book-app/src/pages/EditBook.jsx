// src/pages/EditBook.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

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
      <div className="w-screen h-screen flex items-center justify-center">
        <ClipLoader size={40} />
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Book not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col gap-4"
      >
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Edit book
            </h1>
            <p className="text-xs text-slate-500">
              Update your book details, files, and publish status.
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
            className="min-h-[80px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/60 resize-y"
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex flex-col justify-center">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="rounded border-slate-300"
              />
              Published
            </label>
            <p className="text-[11px] text-slate-400 mt-1">
              Uncheck to move this book back to draft.
            </p>
          </div>
        </div>

        {/* Files */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Replace cover image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="text-xs"
            />
            <span className="text-[11px] text-slate-400">
              Leave empty to keep existing cover.
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Replace book file
            </label>
            <input
              type="file"
              onChange={(e) => setBookFile(e.target.files?.[0] || null)}
              className="text-xs"
            />
            <span className="text-[11px] text-slate-400">
              Leave empty to keep existing file.
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-6 rounded-xl bg-slate-900 text-white text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-60"
          >
            {saving && <ClipLoader size={16} color="#fff" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
