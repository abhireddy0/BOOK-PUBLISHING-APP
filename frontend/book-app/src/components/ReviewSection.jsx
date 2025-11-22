// src/components/ReviewSection.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../config/server";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

export default function ReviewsSection({ bookId }) {
  const { user, token } = useSelector((s) => s.user) || {};
  const finalToken = token || localStorage.getItem("token");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const LIMIT = 5;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const isLoggedIn = !!finalToken;

  const loadReviews = async (pageNo = 1, append = false) => {
    try {
      const res = await axios.get(`${serverUrl}/books/${bookId}/reviews`, {
        params: { page: pageNo, limit: LIMIT },
      });
      const list = res.data?.list || [];
      const meta = res.data?.meta || {};
      setReviews((prev) => (append ? [...prev, ...list] : list));
      setHasNext(!!meta.hasNext);
      setPage(pageNo);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadReviews(1, false);
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return toast.info("Please login to write a review");
    if (!rating) return toast.error("Select a rating (1–5)");

    try {
      setSubmitting(true);
      await axios.post(
        `${serverUrl}/books/${bookId}/review`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${finalToken}` } }
      );
      toast.success("Review submitted 🎉");
      setComment("");
      setRating(0);
      setHoverRating(0);
      loadReviews(1, false);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="mt-10 border-t border-slate-800 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100">Reviews</h2>
        {averageRating && (
          <span className="text-sm text-amber-300">
            ⭐ {averageRating}/5 · {reviews.length} review
            {reviews.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="mb-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        {isLoggedIn ? (
          <>
            <p className="text-sm text-slate-300 mb-2">Rate this book</p>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-xl"
                  >
                    <span
                      className={active ? "text-amber-400" : "text-slate-600"}
                    >
                      ★
                    </span>
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="text-xs text-slate-400 ml-2">
                  {rating} / 5
                </span>
              )}
            </div>

            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full min-h-[70px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={submitting}
                className="self-end h-9 px-4 rounded-lg bg-sky-500 text-slate-950 text-xs font-medium hover:bg-sky-400 disabled:opacity-60 flex items-center gap-2"
              >
                {submitting && <ClipLoader size={14} color="#000" />}
                Post review
              </button>
            </form>
          </>
        ) : (
          <p className="text-xs text-slate-400">Login to write a review.</p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <ClipLoader size={30} />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-slate-300 font-medium">
                  {r.user?.name || "Anonymous"}
                </div>
                <div className="text-xs text-amber-300">
                  {"★".repeat(r.rating)}
                  <span className="text-slate-600">
                    {"★".repeat(5 - r.rating)}
                  </span>
                </div>
              </div>
              {r.comment && (
                <p className="text-xs text-slate-400 whitespace-pre-line">
                  {r.comment}
                </p>
              )}
              <p className="text-[10px] text-slate-500 mt-1">
                {new Date(r.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && hasNext && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => loadReviews(page + 1, true)}
            className="h-9 px-4 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700 hover:bg-slate-700"
          >
            Load more reviews
          </button>
        </div>
      )}
    </div>
  );
}
