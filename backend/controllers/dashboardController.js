// backend/controllers/dashboardController.js
const Book = require("../models/bookModel");
const Order = require("../models/orderModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const ActivityLog = require("../models/activityLogModel");

// 🔹 Author stats
const getAuthorStats = async (req, res) => {
  try {
    const authorId = req.user.id; // authMiddleware sets { id, role }

    // 1) all books by this author
    const books = await Book.find({ author: authorId }, "_id title published");
    const bookIds = books.map((b) => b._id);

    const totalBooks = books.length;

    // 2) all PAID orders for this author's books
    const paidOrders = await Order.find({
      status: "paid",
      book: { $in: bookIds },
    })
      .populate("book", "title author")
      .sort({ createdAt: -1 });

    const totalSales = paidOrders.length;

    // 3) this month revenue
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

    // 4) average rating from all reviews for this author's books
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

    // optional: latest orders for this author
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
      // you can also send books if you want:
      // books,
    });
  } catch (err) {
    console.error("Author dashboard error:", err);
    return res.status(500).json({
      message: "Failed to load dashboard stats",
    });
  }
};

// 🔹 Admin stats + Activity log
const getAdminStats = async (req, res) => {
  try {
    // basic totals
    const [totalUsers, totalBooks, paidOrders] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Order.find({ status: "paid" })
        .populate("book buyer", "title name email")
        .sort({ createdAt: -1 }),
    ]);

    const totalSales = paidOrders.length;
    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    const latestOrders = paidOrders.slice(0, 5).map((o) => ({
      id: o._id,
      bookTitle: o.book?.title || "Untitled",
      buyerName: o.buyer?.name || "Unknown",
      amount: o.amount || 0,
    }));

    // recent activity logs
    const rawLogs = await ActivityLog.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(20);

    const recentActivity = rawLogs.map((log) => ({
      id: log._id,
      userName: log.user?.name || "Unknown",
      userEmail: log.user?.email || "",
      userRole: log.user?.role || "",
      action: log.action,
      entityType: log.entityType,
      createdAt: log.createdAt,
    }));

    return res.json({
      totals: {
        totalUsers,
        totalBooks,
        totalSales,
        totalRevenue,
      },
      latestOrders,
      recentActivity,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    return res
      .status(500)
      .json({ message: "Failed to load admin dashboard stats" });
  }
};

module.exports = {
  getAuthorStats,
  getAdminStats,
};
