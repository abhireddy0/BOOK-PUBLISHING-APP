// controllers/orderController.js
const Order = require("../models/orderModel");
const Book = require("../models/bookModel");

/**
 * GET /orders/my
 * Return all PAID orders of the logged-in user
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id; // set by authMiddleware

    const orders = await Order.find({
      buyer: userId,
      status: "paid",
    })
      .populate("book", "title coverImage price fileUrl author")
      .sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res
      .status(500)
      .json({ message: "Failed to load your orders" });
  }
};

/**
 * GET /orders/:bookId/access
 * Check if the logged-in user has access to a specific book
 */
// controllers/orderController.js
const checkAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const order = await Order.findOne({
      buyer: userId,
      book: bookId,
      status: "paid",
    });

    return res.json({ hasAccess: !!order });
  } catch (err) {
    console.error("checkAccess error:", err);
    return res
      .status(500)
      .json({ message: "Error checking access", hasAccess: false });
  }
};


module.exports = {
  getMyOrders,
  checkAccess,
};
