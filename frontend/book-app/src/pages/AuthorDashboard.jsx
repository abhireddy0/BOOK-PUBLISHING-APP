// src/pages/AuthorDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../config/server";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AuthorDashboard() {
  const { user, token } = useSelector((state) => state.user) || {};
  const finalToken = token || localStorage.getItem("token");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!finalToken) {
          toast.info("Please login as an author to view dashboard");
          nav("/login");
          return;
        }
        const res = await axios.get(`${serverUrl}/dashboard/author`, {
          headers: { Authorization: `Bearer ${finalToken}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("AuthorDashboard error:", err);
        toast.error(
          err?.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [finalToken, nav]);

  if (loading || !stats) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
        <ClipLoader size={40} />
      </div>
    );
  }

  const { totalBooks, totalSales, thisMonthRevenue, avgRating, latestOrders } =
    stats;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-6">
      {/* top bar */}
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Author Dashboard</h1>
          <p className="text-sm text-slate-400">
            Welcome back, {user?.name || "Author"} ✍️
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => nav("/my-books")}
            className="px-3 h-9 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            My books
          </button>
          <button
            onClick={() => nav("/")}
            className="px-3 h-9 rounded-lg border border-slate-600 hover:bg-slate-800"
          >
            View store
          </button>
        </div>
      </header>

      {/* stats cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Total books</p>
          <p className="text-2xl font-semibold">{totalBooks ?? 0}</p>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Total sales</p>
          <p className="text-2xl font-semibold">{totalSales ?? 0}</p>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">
            Revenue (this month)
          </p>
          <p className="text-2xl font-semibold">
            ₹{thisMonthRevenue ?? 0}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Average rating</p>
          {avgRating ? (
            <p className="text-2xl font-semibold">
              {avgRating.toFixed(1)}{" "}
              <span className="text-base text-amber-300">★</span>
            </p>
          ) : (
            <p className="text-sm text-slate-500">No ratings yet</p>
          )}
        </div>
      </div>

      {/* latest orders section */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Recent sales
          </h2>
          <p className="text-xs text-slate-500">
            Last {latestOrders?.length || 0} orders
          </p>
        </div>

        {(!latestOrders || latestOrders.length === 0) ? (
          <p className="text-xs text-slate-500">
            No sales yet. Share your book link with readers!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="py-2 text-left">Book</th>
                  <th className="py-2 text-left">Amount</th>
                  <th className="py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-900">
                    <td className="py-2 pr-2 text-slate-100">
                      {o.bookTitle}
                    </td>
                    <td className="py-2 pr-2 text-slate-300">
                      ₹{o.amount ?? 0}
                    </td>
                    <td className="py-2 text-slate-400">
                      {new Date(o.createdAt).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
