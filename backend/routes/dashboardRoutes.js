const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Order = require("../models/orderModel");
const Book = require("../models/bookModel");
const Review = require("../models/reviewModel");

// quick summary numbers for author
router.get("/dashboard/author/summary", auth, async (req, res) => {
  const authorId = req.user.id;

  const [booksCount, orders, avg] = await Promise.all([
    Book.countDocuments({ author: authorId }),
    Order.find({ status: "paid" }).populate({ path: "book", match: { author: authorId }, select: "_id price" }),
    Review.aggregate([
      { $match: { /* only reviews on this author's books */ } }
    ])
  ]);

  // filter orders that matched the author
  const paidForMyBooks = orders.filter(o => o.book);
  const totalSales = paidForMyBooks.length;

  // simple average rating (adjust once review model is set)
  const avgRating = (avg?.[0]?.avg || 4.8); // fallback until reviews wired

  // revenue last 6 months
  const since = new Date();
  since.setMonth(since.getMonth() - 5); since.setHours(0,0,0,0);
  const revRows = await Order.aggregate([
    { $match: { status: "paid" } },
    { $lookup: { from: "books", localField: "book", foreignField: "_id", as: "b" } },
    { $unwind: "$b" },
    { $match: { "b.author": require("mongoose").Types.ObjectId(authorId) } },
    { $match: { createdAt: { $gte: since } } },
    { $group: {
        _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
        revenue: { $sum: "$amount" }
    }},
    { $sort: { "_id.y": 1, "_id.m": 1 } }
  ]);

  res.json({
    booksCount,
    totalSales,
    avgRating,
    revenueSeries: revRows.map(r => ({
      year: r._id.y, month: r._id.m, revenue: r.revenue
    }))
  });
});

module.exports = router;
