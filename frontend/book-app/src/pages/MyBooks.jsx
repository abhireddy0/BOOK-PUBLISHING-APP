// src/pages/MyBooks.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../config/server";
import { deleteBookApi, setPublishApi } from "../api/books";

export default function MyBooks() {
  const { token } = useSelector((state) => state.user) || {};
  const nav = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null); // for per-book buttons

  const finalToken = token || localStorage.getItem("token");

  const fetchMyBooks = async () => {
    try {
      if (!finalToken) {
        toast.error("You are not logged in");
        return;
      }

      const res = await axios.get(`${serverUrl}/books/mine`, {
        headers: {
          Authorization: `Bearer ${finalToken}`,
        },
      });

      setBooks(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to load your books"
      );
    } finally {
      setLoading(false);
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchMyBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleTogglePublish = async (book) => {
    try {
      setActionLoadingId(book._id);
      const newState = !book.published;
      await setPublishApi(book._id, newState, finalToken);
      toast.success(
        newState ? "Book published ✅" : "Book moved to draft 📝"
      );
      fetchMyBooks();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update publish state"
      );
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (book) => {
    const ok = window.confirm(
      `Delete "${book.title}"? This cannot be undone.`
    );
    if (!ok) return;

    try {
      setActionLoadingId(book._id);
      await deleteBookApi(book._id, finalToken);
      toast.success("Book deleted");
      setBooks((prev) => prev.filter((b) => b._id !== book._id));
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to delete book"
      );
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <ClipLoader size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">My Books</h1>

        <button
          onClick={() => nav("/books/new")}
          className="h-9 px-4 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800"
        >
          + New Book
        </button>
      </div>

      {books.length === 0 ? (
        <p className="text-slate-500 text-sm">
          You haven’t created any books yet. Click “New Book” to get started.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {books.map((b) => {
            const isBusy = actionLoadingId === b._id;
            return (
              <div
                key={b._id}
                className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {b.title}
                  </h2>

                  <p className="text-xs mt-1 font-medium">
                    <span
                      className={`${
                        b.published ? "text-green-600" : "text-orange-600"
                      }`}
                    >
                      {b.published ? "Published" : "Draft"}
                    </span>
                  </p>

                  <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                    {b.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">
                    ₹{b.price ?? 0}
                  </span>

                  <span className="text-xs text-slate-400">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => nav(`/books/${b._id}/edit`)}
                    className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleTogglePublish(b)}
                    disabled={isBusy}
                    className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {isBusy ? "..." : b.published ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => handleDelete(b)}
                    disabled={isBusy}
                    className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {isBusy ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
