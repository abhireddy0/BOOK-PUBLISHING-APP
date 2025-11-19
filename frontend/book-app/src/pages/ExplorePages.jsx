// src/pages/ExploreBooks.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../config/server";

export default function ExploreBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${serverUrl}/books`);
        const all = res.data || [];
        const published = all.filter((b) => b.published); // show only published
        setBooks(published);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <ClipLoader size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Explore Books</h1>
        <button
          onClick={() => nav("/login")}
          className="h-9 px-4 rounded-xl border border-slate-300 text-sm text-slate-700 bg-white hover:bg-slate-100"
        >
          Login / Signup
        </button>
      </header>

      {books.length === 0 ? (
        <p className="text-sm text-slate-500">
          No published books available yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          {books.map((b) => (
            <div
              key={b._id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => nav(`/books/${b._id}`)}
            >
              {b.coverImage && (
                <img
                  src={b.coverImage}
                  alt={b.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
                {b.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                by {b.author?.name || "Unknown"}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                ₹{b.price ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
