import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { serverUrl } from "../config/server";
import { FiBookOpen, FiShield, FiCheckCircle } from "react-icons/fi";
import { FaPaypal } from "react-icons/fa";
import ReviewsSection from "../components/ReviewSection";

export default function BookDetail() {
  const { id } = useParams();
  const { user, token } = useSelector((s) => s.user) || {};

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const nav = useNavigate();
  const finalToken = token || localStorage.getItem("token");

  const isLoggedIn = !!finalToken;

  const isAuthor =
    !!user &&
    !!book &&
    String(book.author?._id || book.author) === String(user.id);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`${serverUrl}/books/${id}`);
        setBook(res.data);
      } catch (err) {
        console.error("Book fetch error:", err);
        toast.error("Failed to load book");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!finalToken) return;
      try {
        const res = await axios.get(`${serverUrl}/orders/${id}/access`, {
          headers: { Authorization: `Bearer ${finalToken}` },
        });
        if (res.data?.hasAccess || res.status === 200) setHasAccess(true);
      } catch {
        setHasAccess(false);
      }
    };
    if (isLoggedIn) checkAccess();
  }, [id, finalToken, isLoggedIn]);

  const handleBuy = async () => {
    if (!isLoggedIn) {
      toast.info("Please login to purchase");
      nav("/login");
      return;
    }
    if (isAuthor) {
      toast.error("You cannot buy your own book");
      return;
    }
    try {
      setBuying(true);

      if (!window.Razorpay) {
        toast.error("Razorpay SDK not loaded. Check index.html.");
        setBuying(false);
        return;
      }

      const checkoutRes = await axios.post(
        `${serverUrl}/pay/checkout/${id}`,
        {},
        { headers: { Authorization: `Bearer ${finalToken}` } }
      );
      const data = checkoutRes.data;

      const rzp = new window.Razorpay({
        key: data.razorpayKey,
        amount: data.amount,
        currency: data.currency,
        name: "StoryVerse",
        description: book.title,
        image: book.coverImage || undefined,
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${serverUrl}/pay/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                localOrderId: data.localOrderId,
                bookId: id,
              },
              { headers: { Authorization: `Bearer ${finalToken}` } }
            );
            toast.success(verifyRes.data?.message || "Payment successful ✅");
            setHasAccess(true);
          } catch (err) {
            console.error("Verify error", err);
            toast.error(
              err?.response?.data?.message || "Payment verification failed"
            );
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#0f172a" },
      });

      rzp.open();
    } catch (err) {
      console.error("Checkout error", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to start checkout"
      );
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col gap-3 items-center justify-center bg-slate-950 text-slate-100">
        <ClipLoader size={40} />
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Loading book&nbsp;details...
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-3">
        <p className="text-lg font-semibold">Book not found</p>
        <button
          onClick={() => nav("/")}
          className="px-4 h-9 rounded-lg bg-slate-100 text-slate-900 text-sm"
        >
          Back to all books
        </button>
      </div>
    );
  }

  const canDownload = hasAccess || isAuthor || isAdmin;
  const isPublished = !!book.published;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={() => nav(-1)}
            className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-300 hover:text-white transition"
          >
            <span className="text-lg">←</span>
            Back to books
          </button>
          <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-400">
            <FiShield className="text-sm" />
            <FaPaypal className="text-sky-400 text-base" />
            <span>Secure payments powered by Razorpay</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-7 shadow-[0_18px_50px_rgba(15,23,42,0.75)] backdrop-blur">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-full max-w-xs relative">
                  <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-sky-500/20 via-emerald-500/10 to-purple-500/20 blur-2xl opacity-60" />
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full max-h-[380px] object-cover"
                      />
                    ) : (
                      <div className="w-full h-[280px] flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                        <FiBookOpen className="text-2xl" />
                        <span>No cover image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <p className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      StoryVerse Original
                    </p>
                    {canDownload && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 text-sky-200 border border-sky-500/40 px-3 py-1 text-[10px] font-medium">
                        <FiCheckCircle className="text-xs" />
                        Owned
                      </span>
                    )}
                    {isAuthor && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40 px-3 py-1 text-[10px] font-medium">
                        Author
                      </span>
                    )}
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-100 border border-amber-500/40 px-3 py-1 text-[10px] font-medium">
                        Admin
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 leading-snug">
                    {book.title}
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    by{" "}
                    <span className="font-medium text-slate-200">
                      {book.author?.name || "Unknown author"}
                    </span>
                  </p>
                </div>

                <div className="mt-2">
                  <p className="text-sm md:text-[0.95rem] text-slate-200/90 leading-relaxed">
                    {book.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] md:text-xs text-slate-400">
                  <div className="flex flex-col gap-1">
                    <span className="uppercase tracking-[0.18em] text-[9px] text-slate-500">
                      Status
                    </span>
                    <span
                      className={
                        book.published
                          ? "inline-flex items-center gap-1 text-emerald-300"
                          : "inline-flex items-center gap-1 text-amber-300"
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {book.published ? "Published" : "Unpublished draft"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="uppercase tracking-[0.18em] text-[9px] text-slate-500">
                      Price
                    </span>
                    <span className="text-slate-100 font-semibold">
                      ₹{book.price ?? 0}
                    </span>
                  </div>
                </div>

                {canDownload && book.fileUrl && (
                  <div className="mt-3">
                    <a
                      href={book.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/60 bg-sky-500/10 px-4 py-2 text-xs md:text-sm font-medium text-sky-100 hover:bg-sky-500/20 transition"
                    >
                      <FiBookOpen className="text-sm" />
                      Read / Download book
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.8)] backdrop-blur">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-1">
                    Get instant access
                  </p>
                  <p className="text-2xl font-semibold text-slate-50">
                    ₹{book.price ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    One-time payment • Lifetime reading access
                  </p>
                </div>
              </div>

              {!isAuthor && !canDownload && book.published && (
                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-sky-500 text-slate-950 text-xs md:text-sm font-semibold h-11 hover:bg-sky-400 disabled:opacity-60 transition shadow-lg shadow-sky-500/30"
                >
                  {buying
                    ? "Processing payment..."
                    : "Buy securely with Razorpay"}
                </button>
              )}

              {canDownload && book.fileUrl && (
                <a
                  href={book.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 text-slate-950 text-xs md:text-sm font-semibold h-11 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/30"
                >
                  Start reading now
                </a>
              )}

              {!book.published && (
                <p className="mt-3 text-amber-300 text-[11px]">
                  This book is currently{" "}
                  <span className="font-semibold">not published</span>. Readers
                  can’t purchase it yet.
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 space-y-1.5">
                <p className="flex items-center gap-1">
                  <FiShield className="text-xs" />
                  <FaPaypal className="text-sky-400 text-sm" />
                  <span>
                    Card / UPI handled by Razorpay. We don’t store your payment
                    details.
                  </span>
                </p>
                <p>📚 Access is tied to your StoryVerse account.</p>
              </div>
            </div>
          </aside>
        </div>

        <ReviewsSection bookId={id} />
      </div>
    </div>
  );
}
