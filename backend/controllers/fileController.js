// controllers/fileController.js
const fetch = require("node-fetch"); // npm i node-fetch@2
const Book = require("../models/bookModel");
const Order = require("../models/orderModel");

async function canUserRead(book, user) {
  if (!book) return { ok: false, code: 404, msg: "Book not found" };
  if (String(book.author) === String(user.id)) return { ok: true };
  if (user.role === "admin") return { ok: true };
  if (!book.published) return { ok: false, code: 403, msg: "Unpublished" };

  const paid = await Order.findOne({ book: book._id, buyer: user.id, status: "paid" });
  if (paid) return { ok: true };
  if (!book.price || Number(book.price) === 0) return { ok: true };

  return { ok: false, code: 403, msg: "Purchase required" };
}

exports.streamBookFileInline = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || !book.fileUrl) return res.status(404).json({ message: "File not found" });

    const access = await canUserRead(book, req.user);
    if (!access.ok) return res.status(access.code || 403).json({ message: access.msg || "Forbidden" });

    const r = await fetch(book.fileUrl);
    if (!r.ok || !r.body) return res.status(502).json({ message: "Unable to fetch file" });

    res.setHeader("Content-Type", "application/pdf");
    const safe = String(book.title || "book").replace(/[^\w.\- ]+/g, "_");
    res.setHeader("Content-Disposition", `inline; filename="${safe}.pdf"`);

    r.body.pipe(res);
  } catch (e) {
    console.error("streamBookFileInline error:", e);
    res.status(500).json({ message: "Failed to stream file" });
  }
};
