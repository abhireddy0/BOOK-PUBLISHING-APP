 // controllers/dashboardController.js
const Book = require("../models/bookModel");
const Order = require("../models/orderModel");
const Review = require("../models/reviewModel");

const getAuthorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const myBooks = await Book.find({ author: userId }).lean();
    const myBookIds = myBooks.map(b => b._id);

    const mySales = await Order.find({ book: { $in: myBookIds }, status: "paid" }).lean();
    const totalRevenue = mySales.reduce((s, o) => s + (o.amount || 0), 0);

    const reviews = await Review.find({ book: { $in: myBookIds } }).sort({ createdAt: -1 }).lean();

    return res.json({
      booksCount: myBooks.length,
      totalSales: mySales.length,
      totalRevenue,
      recentBooks: myBooks.slice(-5).reverse(),
      recentReviews: reviews.slice(0, 5),
    });
  } catch (err) {
    console.error("getAuthorDashboard error:", err);
    return res.status(500).json({ message: "Server error building dashboard" });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const bookCount = await Book.countDocuments();
    const paidOrders = await Order.find({ status: "paid" }).lean();
    const orderCount = paidOrders.length;
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.amount || 0), 0);

    return res.json({ bookCount, orderCount, totalRevenue });
  } catch (err) {
    console.error("getAdminDashboard error:", err);
    return res.status(500).json({ message: "Server error building admin dashboard" });
  }
};

module.exports = { getAuthorDashboard, getAdminDashboard };
