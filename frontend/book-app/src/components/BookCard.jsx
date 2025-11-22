import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBookOpen, FiEye, FiShoppingCart } from "react-icons/fi";

export default function BookCard({
  book,
  showBuy = true,
  onBuy,
  className = "",
}) {
  const nav = useNavigate();

  const createdDate = book?.createdAt
    ? new Date(book.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "";

  const priceLabel =
    typeof book?.price === "number" ? `₹${book.price}` : "Free";

  const authorLabel =
    book?.authorName ||
    (typeof book?.author === "object" &&
      (book.author.name || book.author.fullName)) ||
    (typeof book?.author === "string" ? "" : "") ||
    "";

  const handleView = () => nav(`/books/${book._id}`);

  return (
    <div
      className={
        "group rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:p-5 flex flex-col gap-4 shadow-[0_16px_45px_rgba(15,23,42,0.85)] hover:border-sky-500/60 hover:bg-slate-950 transition " +
        className
      }
    >
      <div className="flex gap-4">
        <button
          onClick={handleView}
          className="w-20 h-28 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500"
          title={book?.title}
        >
          {book?.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-[11px] text-slate-500 px-2">
              <FiBookOpen className="text-lg" />
              <span>No cover</span>
            </div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base md:text-lg font-semibold text-slate-50 line-clamp-2">
              {book?.title || "Untitled"}
            </h2>
            {createdDate && (
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                {createdDate}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                book?.published
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-amber-300 bg-amber-400/10"
              }`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
              {book?.published ? "Published" : "Draft"}
            </span>
            {authorLabel && (
              <span className="text-[11px] text-slate-500 truncate">
                by {authorLabel}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-2 line-clamp-3">
            {book?.description || "No description provided yet."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Price</span>
          <span className="text-sm font-semibold text-slate-100">
            {priceLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleView}
            className="inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-slate-700 text-slate-100 hover:bg-slate-800 text-xs"
          >
            <FiEye className="text-xs" />
            View
          </button>

          {showBuy && (
            <button
              onClick={() =>
                onBuy ? onBuy(book) : nav(`/checkout/${book._id}`)
              }
              className="inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-medium"
            >
              <FiShoppingCart className="text-xs" />
              Buy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
