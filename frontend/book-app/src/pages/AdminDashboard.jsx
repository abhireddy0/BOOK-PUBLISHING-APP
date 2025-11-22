
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { serverUrl } from "../config/server";
import { useNavigate } from "react-router-dom";
import ActivityFeed from "../components/ActivityFeed";
import { setUserData } from "../redux/userSlice";


import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";


const fmtINR = (n = 0) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const lastNDays = (n) => {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
    out.push({ key, label });
  }
  return out;
};

const buildRevenueSeries = (orders = [], days = 14) => {
  const base = Object.fromEntries(lastNDays(days).map((d) => [d.key, 0]));
  orders.forEach((o) => {
    const ts = o?.createdAt || o?.date;
    const amt = Number(o?.amount || 0);
    if (!ts) return;
    const key = new Date(ts).toISOString().slice(0, 10);
    if (key in base) base[key] += amt;
  });
  return lastNDays(days).map((d) => ({
    date: d.label,
    revenue: base[d.key],
  }));
};

const rolePieFromUsers = (users = []) => {
  const counts = users.reduce(
    (acc, u) => {
      const r = (u?.role || "reader").toLowerCase();
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    },
    { reader: 0, author: 0, admin: 0 }
  );
  return [
    { name: "Readers", value: counts.reader || 0 },
    { name: "Authors", value: counts.author || 0 },
    { name: "Admins", value: counts.admin || 0 },
  ];
};

const bookBarsFromBooks = (books = []) => {
  let published = 0;
  let draft = 0;
  books.forEach((b) => (b?.published ? published++ : draft++));
  return [
    { name: "Published", count: published },
    { name: "Draft", count: draft },
  ];
};


const C = {
  grid: "#e2e8f0",
  area: "#818cf8",
  areaFill: "#c7d2fe",
  barPub: "#10b981",
  barDraft: "#f59e0b",
  donut1: "#6366f1",
  donut2: "#22c55e",
  donut3: "#f43f5e",
};

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.user) || {};
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const finalToken = token || localStorage.getItem("token");

  const handleLogout = () => {
    dispatch(setUserData({ user: null, token: null }));
    localStorage.removeItem("storyverse_auth");
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

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

  
  const totals = stats?.totals || {};
  const recentUsers = stats?.recentUsers || [];
  const recentBooks = stats?.recentBooks || [];
  const latestOrders = stats?.latestOrders || [];
  const recentActivity = stats?.recentActivity || [];

  const revenueSeries = useMemo(
    () => buildRevenueSeries(latestOrders, 14),
    [latestOrders]
  );
  const rolePie = useMemo(() => rolePieFromUsers(recentUsers), [recentUsers]);
  const bookBars = useMemo(() => bookBarsFromBooks(recentBooks), [recentBooks]);

  
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
          <button
            onClick={handleLogout}
            className="h-9 px-4 rounded-xl border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </header>

      
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
            {fmtINR(totals.totalRevenue ?? 0)}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3 mb-8">
       
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Revenue — last 14 days
            </h2>
            <span className="text-[11px] text-slate-500">
              Total:{" "}
              {fmtINR(revenueSeries.reduce((s, d) => s + (d.revenue || 0), 0))}
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueSeries}
                margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
              >
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.area} stopOpacity={0.25} />
                    <stop
                      offset="100%"
                      stopColor={C.areaFill}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000 ? `${Math.round(v / 1000)}k` : v
                  }
                  width={40}
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                />
                <Tooltip formatter={(v) => fmtINR(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={C.area}
                  strokeWidth={2}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roles (donut) */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            User roles (recent)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rolePie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  <Cell fill={C.donut1} />
                  <Cell fill={C.donut2} />
                  <Cell fill={C.donut3} />
                </Pie>
                <Legend verticalAlign="bottom" height={24} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

   
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
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
                        {b.author?.name || "Unknown"} • {fmtINR(b.price ?? 0)}
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

          <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Latest orders
            </h2>
            {latestOrders.length === 0 ? (
              <p className="text-xs text-slate-500">No paid orders yet.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {latestOrders.map((o) => (
                  <li
                    key={o.id || o._id}
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
                      {fmtINR(o.amount ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

 
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Books status (recent)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookBars}
                margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
              >
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {bookBars.map((b) => (
                    <Cell
                      key={b.name}
                      fill={b.name === "Published" ? C.barPub : C.barDraft}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <span>
              Published:{" "}
              <strong>
                {bookBars.find((x) => x.name === "Published")?.count || 0}
              </strong>
            </span>
            <span>
              Draft:{" "}
              <strong>
                {bookBars.find((x) => x.name === "Draft")?.count || 0}
              </strong>
            </span>
          </div>
        </div>

   
        <ActivityFeed items={recentActivity} />
      </section>
    </div>
  );
}
