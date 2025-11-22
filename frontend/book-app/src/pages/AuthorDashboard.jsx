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
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import { setUserData } from "../redux/userSlice";

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
        const statsPromise = axios.get(`${serverUrl}/dashboard/author`, {
          headers: { Authorization: `Bearer ${finalToken}` },
        });
        const booksPromise = axios.get(`${serverUrl}/books/mine`, {
          headers: { Authorization: `Bearer ${finalToken}` },
        });

        const [statsRes, booksRes] = await Promise.all([
          statsPromise,
          booksPromise,
        ]);
        const s = statsRes.data || {};

        setStats({
          totalBooks: s.totalBooks ?? booksRes.data?.length ?? 0,
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

  const pubDraftData = useMemo(() => {
    if (!books?.length)
      return [
        { name: "Published", value: 0 },
        { name: "Draft", value: 0 },
      ];
    const published = books.filter((b) => b.published).length;
    const drafts = books.length - published;
    return [
      { name: "Published", value: published },
      { name: "Draft", value: drafts },
    ];
  }, [books]);

  const priceHistogram = useMemo(() => {
    if (!books?.length) return [];
    const prices = books
      .map((b) => Number(b.price || 0))
      .filter((x) => !Number.isNaN(x));
    if (prices.length === 0) return [];
    const max = Math.max(...prices);
    const binSize = 100;
    const binCount = Math.max(5, Math.ceil((max + 1) / binSize));
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${i * binSize}-${i * binSize + (binSize - 1)}`,
      count: 0,
    }));
    prices.forEach((p) => {
      const idx = Math.min(Math.floor(p / binSize), bins.length - 1);
      bins[idx].count += 1;
    });
    while (bins.length > 5 && bins[bins.length - 1].count === 0) bins.pop();
    return bins;
  }, [books]);

  const totalsBarData = useMemo(
    () => [
      { label: "Books", value: Number(stats.totalBooks || 0) },
      { label: "Sales", value: Number(stats.totalSales || 0) },
    ],
    [stats.totalBooks, stats.totalSales]
  );

  const PIE_COLORS = ["#10B981", "#F59E0B"];

  const handleLogout = () => {
    dispatch(setUserData({ user: null, token: null }));
    localStorage.removeItem("storyverse_auth");
    localStorage.removeItem("token");
    nav("/login");
  };

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
            <button
              onClick={handleLogout}
              className="h-9 px-4 rounded-xl border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>

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

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Books split
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Published vs draft titles.
            </p>

            {pubDraftData.every((d) => d.value === 0) ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-500">
                No data to visualize yet.
              </div>
            ) : (
              <div className="h-56 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={pubDraftData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="75%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pubDraftData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: 11 }}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Price distribution
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Histogram of your book prices (₹ per bin).
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priceHistogram}
                  barSize={28}
                  margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {priceHistogram.map((_, idx) => (
                      <Cell key={idx} fill="#3B82F6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Totals
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Compare books and sales at a glance.
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalsBarData} barSize={45}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {totalsBarData.map((d) => (
                      <Cell
                        key={d.label}
                        fill={d.label === "Books" ? "#10B981" : "#F59E0B"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

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
            <EmptyBooksCTA onCreate={() => nav("/books/new")} />
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

function EmptyBooksCTA({ onCreate }) {
  return (
    <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
      <p className="text-sm font-medium text-slate-700">
        You haven’t published any books yet.
      </p>
      <p className="text-[11px] text-slate-500">
        Create your first book to see it here.
      </p>
      <button
        onClick={onCreate}
        className="mt-2 h-9 px-4 rounded-xl bg-slate-900 text-slate-50 text-xs font-semibold hover:bg-slate-800"
      >
        + Publish your first book
      </button>
    </div>
  );
}
