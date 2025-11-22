// backend/controllers/dashboardController.js
const mongoose = require("mongoose");
const Book = require("../models/bookModel");
const Order = require("../models/orderModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const ActivityLog = require("../models/activityLogModel");

// --- Helpers ---------------------------------------------------------------

// Use UTC month range so results are stable regardless of server TZ
function getThisMonthUtcRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start, end };
}

function round2(n) {
  return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
}

// --- Author Dashboard ------------------------------------------------------

const getAuthorStats = async (req, res) => {
  try {
    const authorId = req.user.id;

    // 1) Small “books for author” set (ids + status) — used by other calcs
    const books = await Book.find({ author: authorId }, "_id published title")
      .sort({ createdAt: -1 })
      .lean();

    const bookIds = books.map((b) => b._id);
    const totalBooks = books.length;
    const publishedCount = books.filter(b => b.published).length;
    const draftCount = totalBooks - publishedCount;

    if (bookIds.length === 0) {
      return res.json({
        totalBooks,
        publishedCount,
        draftCount,
        totalSales: 0,
        thisMonthRevenue: 0,
        avgRating: null,
        latestOrders: [],
      });
    }

    // 2) Sales + latest orders via aggregation (fast + filtered)
    const [{ totalSales = 0, thisMonthRevenue = 0 } = {}] = await Order.aggregate([
      { $match: { status: "paid", book: { $in: bookIds } } },
      {
        $facet: {
          sales: [{ $count: "count" }],
          monthRevenue: [
            { $match: (() => {
              const { start, end } = getThisMonthUtcRange();
              return { createdAt: { $gte: start, $lt: end } };
            })() },
            { $group: { _id: null, sum: { $sum: { $ifNull: ["$amount", 0] } } } },
          ],
        },
      },
      {
        $project: {
          totalSales: { $ifNull: [{ $arrayElemAt: ["$sales.count", 0] }, 0] },
          thisMonthRevenue: { $ifNull: [{ $arrayElemAt: ["$monthRevenue.sum", 0] }, 0] },
        },
      },
    ]);

    const latestOrdersDocs = await Order.find(
      { status: "paid", book: { $in: bookIds } },
      "amount createdAt book"
    )
      .populate("book", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const latestOrders = latestOrdersDocs.map((o) => ({
      id: o._id,
      bookTitle: o.book?.title || "Untitled",
      amount: round2(o.amount),
      createdAt: o.createdAt,
    }));

    // 3) Average rating across author’s books
    const [{ avg = null } = {}] = await Review.aggregate([
      { $match: { book: { $in: bookIds } } },
      { $group: { _id: null, avg: { $avg: { $ifNull: ["$rating", 0] } } } },
      { $project: { _id: 0, avg: { $round: ["$avg", 1] } } }, // 1 decimal for UI
    ]);

    return res.json({
      totalBooks,
      publishedCount,
      draftCount,
      totalSales,
      thisMonthRevenue: round2(thisMonthRevenue),
      avgRating: avg, // e.g., 4.3 or null
      latestOrders,
    });
  } catch (err) {
    console.error("Author dashboard error:", err);
    return res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

// --- Admin Dashboard -------------------------------------------------------

const getAdminStats = async (req, res) => {
  try {
    // Do the heavy work in Mongo with $facet
    const [totalsAgg, latestOrdersDocs, recentUsers, recentBooks, rawLogs] = await Promise.all([
      Order.aggregate([
        { $match: { status: "paid" } },
        {
          $facet: {
            count: [{ $count: "c" }],
            revenue: [{ $group: { _id: null, sum: { $sum: { $ifNull: ["$amount", 0] } } } }],
          },
        },
        {
          $project: {
            totalSales: { $ifNull: [{ $arrayElemAt: ["$count.c", 0] }, 0] },
            totalRevenue: { $ifNull: [{ $arrayElemAt: ["$revenue.sum", 0] }, 0] },
          },
        },
      ]),
      Order.find({ status: "paid" }, "amount createdAt book buyer")
        .populate("book", "title")
        .populate("buyer", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      User.find({}, "name email createdAt role").sort({ createdAt: -1 }).limit(7).lean(),
      Book.find({}, "title author published createdAt")
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .limit(7)
        .lean(),
      ActivityLog.find({})
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    const [{ totalSales = 0, totalRevenue = 0 } = {}] = totalsAgg || [];

    const latestOrders = latestOrdersDocs.map((o) => ({
      id: o._id,
      bookTitle: o.book?.title || "Untitled",
      buyerName: o.buyer?.name || "Unknown",
      amount: round2(o.amount),
      createdAt: o.createdAt,
    }));

    // ✅ Guaranteed recentActivity, even if ActivityLog is empty
    // Merge “signals” (orders, books, users) + actual ActivityLog
    const synthesizedFromSignals = [
      ...latestOrders.map((o) => ({
        id: `order-${o.id}`,
        type: "order",
        title: `₹${o.amount} • ${o.bookTitle}`,
        subtitle: o.buyerName || "Unknown buyer",
        when: o.createdAt,
      })),
      ...recentBooks.map((b) => ({
        id: `book-${b._id}`,
        type: "book",
        title: b.title || "Untitled",
        subtitle: `${b.author?.name || "Unknown"} • ${b.published ? "Published" : "Draft"}`,
        when: b.createdAt,
      })),
      ...recentUsers.map((u) => ({
        id: `user-${u._id}`,
        type: "user",
        title: u.name || "New user",
        subtitle: u.email || "",
        when: u.createdAt,
      })),
    ];

    const mappedActivityLogs = rawLogs.map((log) => ({
      id: String(log._id),
      type: log.entityType || "activity",
      title: log.action || "Activity",
      subtitle: `${log.user?.name || "Unknown"} • ${log.user?.email || ""}`.trim(),
      when: log.createdAt,
    }));

    const recentActivity = [...mappedActivityLogs, ...synthesizedFromSignals]
      .sort((a, b) => new Date(b.when) - new Date(a.when))
      .slice(0, 20);

    const [totalUsers, totalBooks] = await Promise.all([
      User.estimatedDocumentCount(),
      Book.estimatedDocumentCount(),
    ]);

    return res.json({
      totals: {
        totalUsers,
        totalBooks,
        totalSales,
        totalRevenue: round2(totalRevenue),
      },
      latestOrders,
      recentActivity,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    return res.status(500).json({ message: "Failed to load admin dashboard stats" });
  }
};

module.exports = {
  getAuthorStats,
  getAdminStats,
};
