// controllers/dashboardController.js
const Book = require("../models/bookModel");
const Order = require("../models/orderModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel"); 

// ---------- AUTHOR STATS (you already had this) ----------
const getAuthorStats = async (req, res) => {
  try {
    const authorId = req.user.id;

    const books = await Book.find({ author: authorId }, "_id title");
    const bookIds = books.map((b) => b._id);
    const totalBooks = books.length;

    const paidOrders = await Order.find({
      status: "paid",
      book: { $in: bookIds },
    })
      .populate("book", "title author")
      .sort({ createdAt: -1 });

    const totalSales = paidOrders.length;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const thisMonthOrders = paidOrders.filter(
      (o) => o.createdAt >= start && o.createdAt < end
    );

    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    let avgRating = null;
    if (bookIds.length > 0) {
      const reviews = await Review.find(
        { book: { $in: bookIds } },
        "rating"
      );
      if (reviews.length > 0) {
        const totalRating = reviews.reduce(
          (sum, r) => sum + (r.rating || 0),
          0
        );
        avgRating = totalRating / reviews.length;
      }
    }

    const latestOrders = paidOrders.slice(0, 5).map((o) => ({
      id: o._id,
      bookTitle: o.book?.title || "Untitled",
      amount: o.amount,
      createdAt: o.createdAt,
    }));

    return res.json({
      totalBooks,
      totalSales,
      thisMonthRevenue,
      avgRating,
      latestOrders,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({
      message: "Failed to load dashboard stats",
    });
  }
};

// ---------- ADMIN STATS (NEW) ----------
const getAdminStats = async (req, res) => {
  try {
    // 1) Top-level counts
    const [totalUsers, totalBooks, paidOrders] = await Promise.all([
      User.countDocuments({}),
      Book.countDocuments({}),
      Order.find({ status: "paid" })
        .populate("book", "title")
        .populate("buyer", "name email")
        .sort({ createdAt: -1 }),
    ]);

    const totalSales = paidOrders.length;
    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    // 2) Recent lists (for small tables)
    const [recentUsers, recentBooks] = await Promise.all([
      User.find({}, "name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(5),
      Book.find({}, "title author price published createdAt")
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const latestOrders = paidOrders.slice(0, 5).map((o) => ({
      id: o._id,
      bookTitle: o.book?.title || "Untitled",
      buyerName: o.buyer?.name || "Unknown",
      amount: o.amount,
      createdAt: o.createdAt,
    }));

    return res.json({
      totals: {
        totalUsers,
        totalBooks,
        totalSales,
        totalRevenue,
      },
      recentUsers,
      recentBooks,
      latestOrders,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    return res.status(500).json({ message: "Failed to load admin stats" });
  }
};

module.exports = { getAuthorStats, getAdminStats };
