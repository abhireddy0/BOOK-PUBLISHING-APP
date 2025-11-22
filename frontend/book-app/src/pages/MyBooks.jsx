import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../config/server";
import { deleteBookApi, setPublishApi } from "../api/books";
import BookCard from "../components/BookCard";

export default function MyBooks() {
  const { token } = useSelector((state) => state.user) || {};
  const nav = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const finalToken = token || localStorage.getItem("token");

  const fetchMyBooks = async () => {
    try {
      if (!finalToken) {
        toast.error("You are not logged in");
        return;
      }
      const res = await axios.get(`${serverUrl}/books/mine`, {
        headers: { Authorization: `Bearer ${finalToken}` },
      });
      setBooks(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load your books");
    } finally {
      setLoading(false);
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, [token]);

  const handleTogglePublish = async (book) => {
    try {
      setActionLoadingId(book._id);
      const newState = !book.published;
      await setPublishApi(book._id, newState, finalToken);
      toast.success(newState ? "Book published ✅" : "Book moved to draft 📝");
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
    const ok = window.confirm(`Delete "${book.title}"? This cannot be undone.`);
    if (!ok) return;

    try {
      setActionLoadingId(book._id);
      await deleteBookApi(book._id, finalToken);
      toast.success("Book deleted");
      setBooks((prev) => prev.filter((b) => b._id !== book._id));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete book");
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
        <ClipLoader size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 px-6 py-8">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -right-40 top-0 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-purple-500/25 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Author studio
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">My Books</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage the books you’ve created, update them, or toggle between
              draft and published.
            </p>
          </div>

          <button
            onClick={() => nav("/books/new")}
            className="self-start md:self-auto inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-sky-500 text-slate-950 text-sm font-semibold hover:bg-sky-400 shadow-lg shadow-sky-500/30"
          >
            <span className="text-base">＋</span>
            New Book
          </button>
        </div>

        {books.length === 0 ? (
          <div className="mt-10 max-w-md rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="text-lg font-semibold mb-2">
              You haven’t published anything yet
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Start by creating your first book. You can save it as a draft and
              publish whenever you’re ready.
            </p>
            <button
              onClick={() => nav("/books/new")}
              className="h-9 px-4 rounded-lg bg-emerald-500 text-slate-950 text-sm font-medium hover:bg-emerald-400"
            >
              Create your first book
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {books.map((b) => (
              <div key={b._id} className="relative">
                <BookCard book={b} showBuy={false} />

                <div className="mt-3 flex items-center gap-2 text-xs">
                  <button
                    onClick={() => nav(`/books/${b._id}/edit`)}
                    className="inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-slate-700 text-slate-100 hover:bg-slate-800"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleTogglePublish(b)}
                    disabled={actionLoadingId === b._id}
                    className="inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-slate-700 text-slate-100 hover:bg-slate-800 disabled:opacity-60"
                  >
                    {actionLoadingId === b._id
                      ? "..."
                      : b.published
                      ? "Unpublish"
                      : "Publish"}
                  </button>

                  <button
                    onClick={() => handleDelete(b)}
                    disabled={actionLoadingId === b._id}
                    className="inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                  >
                    {actionLoadingId === b._id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
