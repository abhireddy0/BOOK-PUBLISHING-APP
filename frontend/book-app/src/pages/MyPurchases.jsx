// src/pages/MyPurchases.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { serverUrl } from "../config/server";
import { useNavigate } from "react-router-dom";

export default function MyPurchases() {
  const { token } = useSelector((state) => state.user) || {};
  const finalToken = token || localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!finalToken) {
        toast.info("Please login to view your purchases");
        nav("/login");
        return;
      }

      try {
        const res = await axios.get(`${serverUrl}/orders/my`, {
          headers: {
            Authorization: `Bearer ${finalToken}`,
          },
        });

        setOrders(res.data?.orders || []);
      } catch (err) {
        console.error("MyPurchases error:", err);
        toast.error(
          err?.response?.data?.message || "Failed to load purchases"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [finalToken, nav]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <ClipLoader size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          My Library
        </h1>
      </header>

      {orders.length === 0 ? (
        <p className="text-sm text-slate-500">
          You haven't purchased any books yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {orders.map((o) => {
            const b = o.book || {};
            return (
              <div
                key={o._id}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex flex-col"
              >
                {b.coverImage && (
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}

                <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {b.title || "Untitled"}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Price: ₹{b.price ?? o.amount ?? 0}
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  Purchased on{" "}
                  {new Date(o.createdAt).toLocaleDateString("en-IN")}
                </p>

                <div className="mt-3 flex gap-2">
                  {b.fileUrl && (
                    <a
                      href={b.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-slate-900 text-white text-xs hover:bg-slate-800"
                    >
                      Read / Download
                    </a>
                  )}

                  <button
                    onClick={() => nav(`/books/${b._id}`)}
                    className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white hover:bg-slate-100"
                  >
                    View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
