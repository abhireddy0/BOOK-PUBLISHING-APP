// controllers/paymentController.js
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/orderModel");
const Book = require("../models/bookModel");

/**
 * Wrap Razorpay orders.create (callback style) into a Promise
 */
function createRazorpayOrder(options) {
  return new Promise((resolve, reject) => {
    razorpay.orders.create(options, (err, order) => {
      if (err) {
        return reject(err);
      }
      resolve(order);
    });
  });
}


// controllers/paymentController.js (init/checkout route)
const Book = require("../models/bookModel");

exports.initiateCheckout = async (req, res) => {
  const { bookId } = req.body;
  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (String(book.author) === String(req.user.id)) {
    return res.status(400).json({ message: "Authors cannot purchase their own book." });
  }

  if (!book.published) {
    return res.status(400).json({ message: "Book is not published yet." });
  }

  // ... proceed to create Razorpay order
};



const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      localOrderId,
      bookId,
    } = req.body || {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !localOrderId ||
      !bookId
    ) {
      return res.status(400).json({ message: "Missing payment fields" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;
    if (!isValid) {
      console.error("Signature mismatch ❌");
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findById(localOrderId);
    if (!order) {
      return res.status(404).json({ message: "Local order not found" });
    }

    if (String(order.buyer) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not your order" });
    }

    if (String(order.book) !== String(bookId)) {
      return res.status(400).json({ message: "Book mismatch" });
    }

    order.status = "paid";
    await order.save();

    return res.json({
      message: "Payment verified & access unlocked",
      order,
    });
  } catch (error) {
    console.error("verifyPayment error RAW:", error);
    const msg =
      error?.error?.description || error?.message || "Unknown verify error";
    return res
      .status(500)
      .json({ message: `Server error verifying payment: ${msg}` });
  }
};

module.exports = { initiateCheckout, verifyPayment };
