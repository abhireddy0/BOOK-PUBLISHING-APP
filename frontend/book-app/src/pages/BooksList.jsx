// src/pages/BooksList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { serverUrl } from "../config/server";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function BooksList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI filters
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest"); // latest | priceLow | priceHigh

  const nav = useNavigate();
  const { user, token } = useSelector((state) => state.user) || {};

  const finalToken = token || localStorage.getItem("token");
  const isLoggedIn = !!finalToken;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${serverUrl}/books`);
        setBooks(res.data || []);
      } catch (err) {
        console.error("BooksList error:", err);
        toast.error(err?.response?.data?.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const publishedBooks = useMemo(
    () => books.filter((b) => b.published),
    [books]
  );

  // apply search + sort
  const visibleBooks = useMemo(() => {
    let list = [...publishedBooks];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => {
        const title = b.title?.toLowerCase() || "";
        const author = b.author?.name?.toLowerCase() || "";
        const desc = b.description?.toLowerCase() || "";
        return (
          title.includes(q) || author.includes(q) || desc.includes(q)
        );
      });
    }

    if (sortBy === "priceLow") {
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "priceHigh") {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === "latest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [publishedBooks, search, sortBy]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
        <ClipLoader size={40} />
      </div>
    );
  }

  const displayName = user?.name || "Reader";
  const userRole = user?.role;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-6">
      {/* top bar */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">StoryVerse</h1>
          <p className="text-sm text-slate-400">
            Discover and buy digital books from independent authors.
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {isLoggedIn ? (
            <>
              <span className="text-slate-300 hidden sm:inline">
                Hi, <span className="font-medium">{displayName}</span>
              </span>

              {userRole === "author" && (
                <button
                  onClick={() => nav("/my-books")}
                  className="px-3 h-9 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  My books
                </button>
              )}

              <button
                onClick={() => nav("/purchases")}
                className="px-3 h-9 rounded-lg border border-slate-600 hover:bg-slate-800"
              >
                My library
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => nav("/login")}
                className="px-3 h-9 rounded-lg bg-slate-100 text-slate-900 hover:bg-white"
              >
                Login
              </button>
              <button
                onClick={() => nav("/signup")}
                className="px-3 h-9 rounded-lg border border-slate-400 hover:bg-slate-800"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </header>

      {/* controls row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
        <div className="flex-1 flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or description..."
            className="flex-1 h-10 rounded-lg bg-slate-900 border border-slate-700 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm">
          <span className="text-slate-400">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-lg bg-slate-900 border border-slate-700 px-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="latest">Latest</option>
            <option value="priceLow">Price: Low → High</option>
            <option value="priceHigh">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* grid */}
      {visibleBooks.length === 0 ? (
        <p className="text-sm text-slate-400">
          No books match your search. Try a different keyword.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visibleBooks.map((book) => (
            <button
              key={book._id}
              onClick={() => nav(`/books/${book._id}`)}
              className="text-left rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/80 hover:-translate-y-1 transition-all shadow-lg overflow-hidden flex flex-col"
            >
              {/* cover */}
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-52 object-cover"
                />
              ) : (
                <div className="w-full h-52 bg-slate-800 flex items-center justify-center text-xs text-slate-500">
                  No cover image
                </div>
              )}

              {/* body */}
              <div className="p-4 flex flex-col gap-2">
                <h2 className="text-sm font-semibold line-clamp-2">
                  {book.title}
                </h2>
                <p className="text-xs text-slate-400 line-clamp-1">
                  by {book.author?.name || "Unknown"}
                </p>
                <p className="text-sm font-medium text-sky-300 mt-1">
                  ₹{book.price ?? 0}
                </p>

                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {book.description || "No description provided."}
                </p>

                <span className="mt-2 inline-flex text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 w-max">
                  Published
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
