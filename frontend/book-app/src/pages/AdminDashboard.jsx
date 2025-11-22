// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { serverUrl } from "../config/server";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const { user, token } = useSelector((state) => state.user) || {};
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const finalToken = token || localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      if (!finalToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${serverUrl}/dashboard/admin`, {
          headers: { Authorization: `Bearer ${finalToken}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Admin dashboard error:", err);
        toast.error(
          err?.response?.data?.message || "Failed to load admin stats"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [finalToken]);

  // ---- derive data for cards + chart ----
  const totals = stats?.totals || {};
  const recentUsers = stats?.recentUsers || [];
  const recentBooks = stats?.recentBooks || [];
  const latestOrders = stats?.latestOrders || [];

  const chartData = useMemo(
    () => [
      { label: "Users", value: totals.totalUsers ?? 0 },
      { label: "Books", value: totals.totalBooks ?? 0 },
      { label: "Sales", value: totals.totalSales ?? 0 },
    ],
    [totals]
  );

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <ClipLoader size={40} />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-lg font-semibold">Admin dashboard unavailable</p>
        <p className="text-sm text-slate-500">
          You must be logged in as an admin to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <p className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-slate-50 px-3 py-1 text-[11px] font-medium shadow-sm">
            🛡 Admin dashboard
          </p>
          <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-slate-900">
            Welcome back {user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of users, books and sales across the entire platform.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => nav("/")}
            className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            View marketplace
          </button>
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Total users
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {totals.totalUsers ?? 0}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Total books
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {totals.totalBooks ?? 0}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Total sales
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {totals.totalSales ?? 0}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Total revenue
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            ₹{totals.totalRevenue ?? 0}
          </p>
        </div>
      </section>

      {/* Cool bar chart */}
      <section className="mb-8 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Platform overview
        </h2>
        <p className="text-[11px] text-slate-500 mb-3">
          High-level counts for users, books and sales.
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={45}>
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="booksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.6} />
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
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={
                      entry.label === "Users"
                        ? "url(#usersGradient)"
                        : entry.label === "Books"
                        ? "url(#booksGradient)"
                        : "url(#salesGradient)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3 small tables */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Recent users */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Recent users
          </h2>
          {recentUsers.length === 0 ? (
            <p className="text-xs text-slate-500">No users yet.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {recentUsers.map((u) => (
                <li
                  key={u._id}
                  className="flex items-center justify-between border-b border-slate-100 last:border-none pb-1"
                >
                  <div>
                    <p className="font-medium text-slate-900 line-clamp-1">
                      {u.name}
                    </p>
                    <p className="text-slate-500 line-clamp-1">{u.email}</p>
                  </div>
                  <span className="ml-2 text-[10px] uppercase rounded-full px-2 py-0.5 bg-slate-100 text-slate-600">
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent books */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Recent books
          </h2>
          {recentBooks.length === 0 ? (
            <p className="text-xs text-slate-500">No books yet.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {recentBooks.map((b) => (
                <li
                  key={b._id}
                  className="flex items-center justify-between border-b border-slate-100 last:border-none pb-1"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-slate-900 line-clamp-1">
                      {b.title}
                    </p>
                    <p className="text-slate-500 line-clamp-1">
                      {b.author?.name || "Unknown"} • ₹{b.price ?? 0}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase rounded-full px-2 py-0.5 bg-slate-100 text-slate-600">
                    {b.published ? "Published" : "Draft"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Latest orders */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Latest orders
          </h2>
          {latestOrders.length === 0 ? (
            <p className="text-xs text-slate-500">No paid orders yet.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {latestOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between border-b border-slate-100 last:border-none pb-1"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-slate-900 line-clamp-1">
                      {o.bookTitle}
                    </p>
                    <p className="text-slate-500 line-clamp-1">
                      {o.buyerName || "Unknown buyer"}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-900">
                    ₹{o.amount ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
