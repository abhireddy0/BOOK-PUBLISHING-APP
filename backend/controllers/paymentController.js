
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Order = require("../models/orderModel");
const Book  = require("../models/bookModel");   

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function initiateCheckout(req, res) {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (!book.published) return res.status(400).json({ message: "Book is not published" });

    const amountInPaise = Math.round(Number(book.price || 0) * 100);
    if (amountInPaise <= 0) return res.status(400).json({ message: "This book is free" });

    const localOrder = await Order.create({
      book: book._id,
      buyer: userId,
      amount: amountInPaise,
      currency: "INR",
      status: "pending",
      provider: "razorpay",
    });

    const rzpOrder = await razor.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: String(localOrder._id),
      notes: { bookId: String(book._id), buyerId: String(userId) },
    });

    localOrder.providerOrderId = rzpOrder.id;
    await localOrder.save();

    return res.json({
      message: "Checkout initiated",
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: rzpOrder.id,
      localOrderId: String(localOrder._id),
    });
  } catch (err) {
    console.error("initiateCheckout error:", err);
    return res.status(500).json({ message: "Failed to create checkout" });
  }
}

async function verifyPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      localOrderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment fields" });
    }

    const toSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(toSign)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findById(localOrderId);
    if (!order) return res.status(404).json({ message: "Local order not found" });

    order.status = "paid";
    order.providerPaymentId = razorpay_payment_id;
    order.providerOrderId   = razorpay_order_id;
    order.verifiedAt        = new Date();
    await order.save();

    return res.json({ message: "Payment verified", orderId: String(order._id) });
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
}

module.exports = { initiateCheckout, verifyPayment };
