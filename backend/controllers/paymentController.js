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

const initiateCheckout = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book || !book.published) {
      return res
        .status(404)
        .json({ message: "BOOK NOT AVAILABLE FOR PURCHASE" });
    }

    // user cannot buy own book
    if (String(book.author) === String(req.user.id)) {
      return res.status(400).json({ message: "You cant buy your own book" });
    }

    // check if already paid
    const alreadypaid = await Order.findOne({
      book: bookId,
      buyer: req.user.id,
      status: "paid",
    });
    if (alreadypaid) {
      return res.status(400).json({ message: "already purchased" });
    }

    const amountInRupees = book.price ?? 0;
    const amountPaise = amountInRupees * 100;

    // sanity checks
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ message: "Razorpay keys not configured on server" });
    }

    if (!amountInRupees || amountInRupees <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid book price for checkout" });
    }

    console.log("Creating Razorpay order:", {
      amountPaise,
      bookId,
      userId: req.user.id,
    });

    // ✅ use our Promise wrapper (handles callback correctly)
    const shortReceipt = `rcpt_${bookId.slice(-6)}_${Date.now()
  .toString()
  .slice(-6)}`;

const rpOrder = await createRazorpayOrder({
  amount: amountPaise,
  currency: "INR",
  receipt: shortReceipt,
});
    // create local pending order
    const pendingOrder = await Order.create({
      book: bookId,
      buyer: req.user.id,
      amount: amountInRupees,
      status: "pending",
    });

    return res.json({
      message: "Checkout initiated",
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rpOrder.id,
      amount: amountPaise,
      currency: "INR",
      book: {
        id: book._id,
        title: book.title,
        coverImage: book.coverImage,
        price: book.price,
      },
      localOrderId: pendingOrder._id,
    });
  } catch (error) {
    // 🔍 log the ENTIRE error object so we see what Razorpay says
    console.error("initiateCheckout error RAW:", error);

    const msg =
      error?.error?.description || // Razorpay often puts message here
      error?.message ||
      "Unknown error during checkout";

    return res.status(500).json({
      message: `Error creating checkout: ${msg}`,
    });
  }
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
