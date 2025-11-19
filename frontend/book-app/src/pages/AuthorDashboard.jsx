// src/pages/AuthorDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { serverUrl } from "../config/server";

// Optional charts (make sure recharts is installed: npm i recharts)
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function AuthorDashboard() {
  const { user, token } = useSelector((state) => state.user) || {};
  const nav = useNavigate();

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalSales: 0,
    thisMonthRevenue: 0,
    avgRating: null,
  });
  const [loading, setLoading] = useState(true);

  const finalToken = token || localStorage.getItem("token");

  // --- Fetch stats once ---
  useEffect(() => {
    const fetchStats = async () => {
      if (!finalToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${serverUrl}/dashboard/author`, {
          headers: { Authorization: `Bearer ${finalToken}` },
        });
        setStats({
          totalBooks: res.data.totalBooks ?? 0,
          totalSales: res.data.totalSales ?? 0,
          thisMonthRevenue: res.data.thisMonthRevenue ?? 0,
          avgRating: res.data.avgRating ?? null,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
        toast.error(
          err?.response?.data?.message || "Failed to load dashboard stats"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [finalToken]);

  // --- Memoised cards (hook ALWAYS called, data can be anything) ---
  const summaryCards = useMemo(
    () => [
      {
        label: "Total Books",
        value: stats.totalBooks,
        sub: "Books you have published or drafted",
      },
      {
        label: "Total Sales",
        value: stats.totalSales,
        sub: "Paid purchases of your books",
      },
      {
        label: "This Month Revenue",
        value: `₹${stats.thisMonthRevenue}`,
        sub: "From 1st of this month till now",
      },
      {
        label: "Average Rating",
        value: stats.avgRating ? stats.avgRating.toFixed(1) : "–",
        sub: "Based on reader reviews",
      },
    ],
    [stats]
  );

  // --- Simple fake chart data using stats (purely UI) ---
  const chartData = useMemo(() => {
    // Just spread thisMonthRevenue across 6 points for now
    const base = stats.thisMonthRevenue || 0;
    return [
      { label: "Week 1", revenue: base * 0.1 },
      { label: "Week 2", revenue: base * 0.2 },
      { label: "Week 3", revenue: base * 0.3 },
      { label: "Week 4", revenue: base * 0.4 },
    ];
  }, [stats.thisMonthRevenue]);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <ClipLoader size={40} />
      </div>
    );
  }

  // --- If somehow user is not author (should be protected already) ---
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
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 flex items-center gap-2">
            Welcome back 👋
          </h1>
          <p className="text-sm text-slate-500">
            Here’s a quick view of your author performance.
          </p>
        </div>

        {/* "Publish new book" action – THIS is the thing you wanted visible */}
        <div className="flex gap-2">
          <button
            onClick={() => nav("/books/new")}
            className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            + Publish new book
          </button>
          <button
            onClick={() => nav("/my-books")}
            className="h-9 px-4 rounded-lg border text-sm border-slate-300 hover:bg-slate-100"
          >
            View all my books
          </button>
        </div>
      </header>

      {/* Summary cards */}
      <section className="grid gap-4 md:grid-cols-4 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm px-5 py-4 flex flex-col gap-1"
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {card.value}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </section>

      {/* Chart + CTA row */}
      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        {/* Revenue chart */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Revenue this month
              </p>
              <p className="text-xs text-slate-500">
                Visual overview of your earnings.
              </p>
            </div>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value) => [`₹${value.toFixed(0)}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f172a"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small side card */}
        <div className="rounded-2xl bg-slate-900 text-white p-4 flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium">Tips</p>
            <p className="text-xs text-slate-300 mt-1">
              Publish more books and share your StoryVerse link with readers to
              grow your sales.
            </p>
          </div>
          <button
            onClick={() => nav("/books/new")}
            className="mt-3 h-9 rounded-lg bg-white text-slate-900 text-sm hover:bg-slate-100"
          >
            Publish another book
          </button>
        </div>
      </section>
    </div>
  );
}
