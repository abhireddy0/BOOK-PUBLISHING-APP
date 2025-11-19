// controllers/dashboardController.js
const Book = require("../models/bookModel");
const Order = require("../models/orderModel");
const Review = require("../models/reviewModel");

const getAuthorStats = async (req, res) => {
  try {
    const authorId = req.user.id; // authMiddleware sets { id, role }

    // 1) all books by this author
    const books = await Book.find({ author: authorId }, "_id title");
    const bookIds = books.map((b) => b._id);

    const totalBooks = books.length;

    // 2) all PAID orders for this author's books
    //    (Order schema: { book, buyer, amount, status })
    const paidOrders = await Order.find({
      status: "paid",
      book: { $in: bookIds },
    })
      .populate("book", "title author")
      .sort({ createdAt: -1 });

    const totalSales = paidOrders.length;

    // 3) this month revenue
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1); // first of month
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1); // first of next month

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

    // optional: top 5 recent orders to show in dashboard
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

module.exports = { getAuthorStats };
