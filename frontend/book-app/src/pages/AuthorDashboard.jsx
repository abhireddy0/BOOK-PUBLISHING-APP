// src/pages/AuthorDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { serverUrl } from "../config/server";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { setUserData } from "../redux/userSlice"; // 👈 import this

export default function AuthorDashboard() {
  const { user, token } = useSelector((state) => state.user) || {};
  const nav = useNavigate();
  const dispatch = useDispatch();

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalSales: 0,
    thisMonthRevenue: 0,
    avgRating: null,
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const finalToken = token || localStorage.getItem("token");

  useEffect(() => {
    const fetchAll = async () => {
      if (!finalToken) {
        setLoading(false);
        return;
      }

      try {
        // 1) dashboard stats
        const statsPromise = axios.get(`${serverUrl}/dashboard/author`, {
          headers: { Authorization: `Bearer ${finalToken}` },
        });

        // 2) all books by this author
        const booksPromise = axios.get(`${serverUrl}/books/mine`, {
          headers: { Authorization: `Bearer ${finalToken}` },
        });

        const [statsRes, booksRes] = await Promise.all([
          statsPromise,
          booksPromise,
        ]);

        const s = statsRes.data || {};

        setStats({
          totalBooks: s.totalBooks ?? booksRes.data.length ?? 0,
          totalSales: s.totalSales ?? 0,
          thisMonthRevenue: s.thisMonthRevenue ?? 0,
          avgRating: s.avgRating ?? null,
        });

        setBooks(booksRes.data || []);
      } catch (err) {
        console.error("Author dashboard error:", err);
        toast.error(
          err?.response?.data?.message || "Failed to load dashboard stats"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [finalToken]);

  // 🔴 LOGOUT HANDLER
  const handleLogout = () => {
    // clear redux
    dispatch(setUserData({ user: null, token: null }));
    // clear localStorage (both styles, just in case)
    localStorage.removeItem("storyverse_auth");
    localStorage.removeItem("token");
    // go to login
    nav("/login");
  };

  // 📊 Build chart data from books list
  const chartData = useMemo(() => {
    if (!books || books.length === 0) {
      return [
        { label: "Published", count: 0 },
        { label: "Draft", count: 0 },
      ];
    }

    const published = books.filter((b) => b.published).length;
    const drafts = books.length - published;

    return [
      { label: "Published", count: published },
      { label: "Draft", count: drafts },
    ];
  }, [books]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <ClipLoader size={40} />
      </div>
    );
  }

  if (!user || user.role !== "author") {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-lg font-semibold">Author dashboard unavailable</p>
        <p className="text-sm text-slate-500">
          You must be logged in as an author to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-slate-50 px-3 py-1 text-[11px] font-medium shadow-sm">
              ✨ Author dashboard
            </p>
            <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-slate-900 flex items-center gap-2">
              Welcome back {user?.name ? `, ${user.name}` : ""} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              See how your books are performing and publish new ones.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => nav("/my-books")}
              className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              View all my books
            </button>
            <button
              onClick={() => nav("/books/new")}
              className="h-9 px-4 rounded-xl bg-slate-900 text-slate-50 text-xs font-semibold hover:bg-slate-800 shadow-md flex items-center gap-1"
            >
              <span className="text-sm">＋</span>
              Publish new book
            </button>
            {/* 🔴 Logout button */}
            <button
              onClick={handleLogout}
              className="h-9 px-4 rounded-xl border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-10">
          <StatCard
            label="Total books"
            value={stats.totalBooks}
            sub="Published or drafted"
          />
          <StatCard
            label="Total sales"
            value={stats.totalSales}
            sub="Paid purchases"
          />
          <StatCard
            label="This month revenue"
            value={`₹${stats.thisMonthRevenue}`}
            sub="From 1st of this month"
          />
          <StatCard
            label="Average rating"
            value={stats.avgRating ? stats.avgRating.toFixed(1) : "–"}
            sub="Reader reviews"
          />
        </div>

        {/* Chart + recent books */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1.3fr]">
          {/* Bar chart */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Books overview
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Published vs drafts in your catalog.
            </p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={45}>
                  <defs>
                    <linearGradient
                      id="publishedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity={0.6}
                      />
                    </linearGradient>

                    <linearGradient id="draftGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#f59e0b"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                  />

                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.label}
                        fill={
                          entry.label === "Published"
                            ? "url(#publishedGradient)"
                            : "url(#draftGradient)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent books */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Recent books
                </h2>
                <p className="text-[11px] text-slate-500">
                  Latest titles you created or updated.
                </p>
              </div>
              {books.length > 0 && (
                <button
                  onClick={() => nav("/my-books")}
                  className="h-8 px-3 rounded-lg text-[11px] font-medium text-slate-700 border border-slate-200 bg-white hover:bg-slate-50"
                >
                  Manage books
                </button>
              )}
            </div>

            {books.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                <p className="text-sm font-medium text-slate-700">
                  You haven’t published any books yet.
                </p>
                <p className="text-[11px] text-slate-500">
                  Create your first book to see it here.
                </p>
                <button
                  onClick={() => nav("/books/new")}
                  className="mt-2 h-9 px-4 rounded-xl bg-slate-900 text-slate-50 text-xs font-semibold hover:bg-slate-800"
                >
                  + Publish your first book
                </button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {books.slice(0, 4).map((b) => (
                  <button
                    key={b._id}
                    onClick={() => nav(`/books/${b._id}`)}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-left hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    <div className="h-12 w-10 rounded-md overflow-hidden bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                      {b.coverImage ? (
                        <img
                          src={b.coverImage}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "No cover"
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">
                        {b.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {b.description || "No description yet"}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className={
                              b.published
                                ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                                : "h-1.5 w-1.5 rounded-full bg-amber-400"
                            }
                          />
                          {b.published ? "Published" : "Draft"}
                        </span>
                        <span>•</span>
                        <span>₹{b.price ?? 0}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{sub}</p>
    </div>
  );
}
