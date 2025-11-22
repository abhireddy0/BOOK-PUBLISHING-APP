import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { FiAlertCircle, FiCheckCircle, FiBookOpen } from "react-icons/fi";
import { getReadableBookApi } from "../api/books";

const showErrorToast = (message) =>
  toast.error(
    <div className="flex items-start gap-3">
      <FiAlertCircle className="text-red-400 text-xl mt-0.5" />
      <span className="text-white text-sm">{message}</span>
    </div>,
    { icon: false, theme: "dark" }
  );

const showSuccessToast = (message) =>
  toast.success(
    <div className="flex items-start gap-3">
      <FiCheckCircle className="text-emerald-400 text-xl mt-0.5" />
      <span className="text-white text-sm">{message}</span>
    </div>,
    { icon: false, theme: "dark" }
  );

export default function BookReader() {
  const { id: bookId } = useParams();
  const nav = useNavigate();
  const { token } = useSelector((state) => state.user) || {};

  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [reason, setReason] = useState("");
  const [canRead, setCanRead] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const finalToken = token || localStorage.getItem("token");
        if (!finalToken) {
          showErrorToast("You must be logged in to read this book.");
          nav("/login");
          return;
        }

        if (!bookId) {
          showErrorToast("Invalid book URL. Book ID is missing.");
          nav("/my-books");
          return;
        }

        setLoading(true);
        const data = await getReadableBookApi(bookId, finalToken);

        setBook(data.book);
        setCanRead(!!data.canRead);
        setReason(data.reason);

        if (data.reason === "author") {
          showSuccessToast("You are viewing your own book as an author.");
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message || "Unable to open this book right now.";
        showErrorToast(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleOpenBook = () => {
    if (!book?.fileUrl) {
      showErrorToast("No book file found. Please upload a file for this book.");
      return;
    }
    window.open(book.fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      nav(-1);
    } else {
      nav("/my-books");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-2xl shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur p-5 md:p-7 text-slate-50">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Book Reader
            </p>
            <h1 className="text-xl md:text-2xl font-semibold mt-1">
              {book?.title || "Loading book..."}
            </h1>
            {book && (
              <p className="text-xs text-slate-400 mt-1">
                by{" "}
                <span className="font-medium text-slate-100">
                  {book.author?.name || "Unknown"}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={handleBack}
            className="text-xs md:text-sm px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 whitespace-nowrap"
          >
            ← Back
          </button>
        </div>

        {loading ? (
          <div className="w-full flex flex-col items-center justify-center py-16 gap-3">
            <ClipLoader size={28} color="#e5e7eb" />
            <p className="text-xs text-slate-400">Opening book...</p>
          </div>
        ) : !book ? (
          <div className="w-full flex flex-col items-center justify-center py-16 gap-2">
            <FiAlertCircle className="text-red-400 text-2xl" />
            <p className="text-sm text-slate-300">
              We couldn&apos;t find this book.
            </p>
          </div>
        ) : !canRead ? (
          <div className="w-full flex flex-col items-center justify-center py-16 gap-3 text-center">
            <FiAlertCircle className="text-red-400 text-2xl" />
            <p className="text-sm text-slate-200">
              You don&apos;t have access to read this book.
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              {reason === "unpublished"
                ? "This book is not published yet. Only the author and admins can view it."
                : reason === "not_purchased"
                ? "You need to purchase this book before you can read it."
                : "Please check with the author or try again later."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-200">
                  <FiBookOpen className="text-xs" />
                  {reason === "author"
                    ? "Author view – you can read your own book for free."
                    : reason === "admin"
                    ? "Admin view – full access."
                    : reason === "purchased"
                    ? "You purchased this book."
                    : "This is a free book."}
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {book.description ||
                    "No description provided. You can update the description from the My Books section."}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>
                    Status:{" "}
                    <span
                      className={
                        book.published
                          ? "text-emerald-300 font-medium"
                          : "text-yellow-300 font-medium"
                      }
                    >
                      {book.published ? "Published" : "Draft"}
                    </span>
                  </span>
                  <span>
                    Price:{" "}
                    <span className="text-slate-100 font-medium">
                      {book.price && Number(book.price) > 0
                        ? `₹${book.price}`
                        : "Free"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-[11px] text-slate-400 space-y-2">
                <p className="font-medium text-slate-100">
                  How reading works for authors
                </p>
                <p>
                  • As the author, you can open and read your own book in full
                  without purchasing it.
                </p>
                <p>
                  • Readers must purchase paid books before reading, but free
                  books are instantly accessible.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                onClick={handleOpenBook}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-sm font-semibold hover:bg-sky-400 shadow-lg shadow-sky-500/30"
              >
                <FiBookOpen className="text-base" />
                Open book in new tab
              </button>
              {!book.fileUrl && (
                <p className="text-[11px] text-red-300">
                  No file uploaded yet. Go to My Books → Edit and upload a PDF
                  or EPUB.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
