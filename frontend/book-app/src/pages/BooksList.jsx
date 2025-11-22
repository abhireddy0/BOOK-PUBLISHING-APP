import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { serverUrl } from "../config/server";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";

function BooksList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const nav = useNavigate();
  const { user } = useSelector((state) => state.user) || {};
  const displayName = user?.name || "Reader";

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${serverUrl}/books`);
        setBooks(res.data || []);
      } catch (err) {
        console.error("BooksList error:", err);
        toast.error("Failed to load books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    let list = [...books];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => {
        const title = b.title?.toLowerCase() || "";
        const desc = b.description?.toLowerCase() || "";
        const authorName =
          b.authorName?.toLowerCase() || b.author?.name?.toLowerCase() || "";
        return title.includes(q) || desc.includes(q) || authorName.includes(q);
      });
    }

    if (sortBy === "latest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "priceLow") {
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "priceHigh") {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    return list;
  }, [books, search, sortBy]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-slate-950 text-white flex items-center justify-center">
        <ClipLoader size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 md:px-6 py-8 md:py-10 text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -right-40 top-0 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-sky-600/30 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-2 md:gap-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Welcome back, {displayName}
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">StoryVerse</h1>
              <p className="text-sm md:text-base text-slate-400 mt-1">
                Discover and buy digital books from independent authors.
              </p>
            </div>
            <div className="text-xs text-slate-400 md:text-right">
              <p>{filteredBooks.length} books available</p>
              <p className="text-slate-500">
                Browse, preview and purchase securely with Razorpay.
              </p>
            </div>
          </div>
        </header>

        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 h-11 rounded-xl w-full md:max-w-lg shadow-sm shadow-black/40">
            <FiSearch className="text-slate-400 text-lg" />
            <input
              placeholder="Search by title, author, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent flex-1 outline-none text-sm text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 rounded-lg bg-slate-900 border border-slate-700 px-2 outline-none text-slate-200 text-sm"
            >
              <option value="latest">Latest</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </section>

        {filteredBooks.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2">
            <p className="text-sm text-slate-300">No books found.</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search or sort filters.
            </p>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-2">
            {filteredBooks.map((b) => {
              const isOwner =
                user &&
                String(user._id || user.id) ===
                  String(b.author?._id || b.author);
              const price = Number(b.price || 0);
              const showBuy = !isOwner && b.published && price > 0;

              return (
                <article
                  key={b._id}
                  className="rounded-2xl bg-slate-900/85 border border-slate-800 p-4 flex flex-col shadow-[0_16px_40px_rgba(15,23,42,0.85)] hover:border-sky-500/60 hover:shadow-sky-500/20 transition"
                >
                  <div
                    className="w-full h-48 rounded-xl overflow-hidden bg-slate-800 cursor-pointer relative group"
                    onClick={() => nav(`/books/${b._id}`)}
                  >
                    {b.coverImage ? (
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[11px] text-slate-400">
                        <span className="text-lg">📚</span>
                        <span>No cover available</span>
                      </div>
                    )}
                    {b.published === false && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500/80 text-[10px] font-semibold text-slate-900">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-col gap-0.5">
                    <h2 className="font-semibold text-base text-slate-50 line-clamp-1">
                      {b.title}
                    </h2>
                    <span className="text-xs text-slate-400 line-clamp-1">
                      by {b.authorName || b.author?.name || "Unknown"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                    {b.description || "No description provided yet."}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-100 font-semibold">
                      {price > 0 ? `₹${price}` : "Free"}
                    </p>

                    <button
                      onClick={() => nav(`/books/${b._id}`)}
                      className="flex-1 h-9 rounded-lg bg-sky-500 text-slate-950 font-medium text-xs sm:text-sm hover:bg-sky-400 transition text-center"
                    >
                      {showBuy ? "View & Buy with Razorpay" : "View details"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

export default BooksList;
