const Book = require("../models/bookModel");
const Order = require("../models/orderModel") 
const cloudinary = require("../config/cloudinary");


const uploadStream = (options, buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

const uploadBookCover = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const isOwner = String(book.author) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed to update this book" });
    }
    if (!req.file) return res.status(400).json({ message: "No cover file provided" });

    const result = await uploadStream(
      { folder: "books/covers", resource_type: "image" },
      req.file.buffer
    );

    book.coverImage = result.secure_url;
    await book.save();
    return res.json({ message: "Cover uploaded", coverImage: book.coverImage, book });
  } catch (error) {
    console.error("uploadBookCover error:", error);
    return res.status(500).json({ message: "Error uploading cover" });
  }
};

const uploadBookFile = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const isOwner = String(book.author) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed to update this book" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // upload to cloudinary as raw file:
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "books/files", resource_type: "raw" },
        (error, resUpload) => (error ? reject(error) : resolve(resUpload))
      );
      stream.end(req.file.buffer);
    });

    book.fileUrl = result.secure_url;
    await book.save();

    return res.json({
      message: "File uploaded",
      fileUrl: book.fileUrl,
      book,
    });
  } catch (error) {
    console.log("uploadBookFile error:", error);
    return res.status(500).json({ message: "Error uploading file" });
  }
};

const setPublish = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "book Not Found" });

    const isOwner = String(book.author) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "not allowed" });

    const { published } = req.body || {};
    if (typeof published !== "boolean") {
      return res.status(400).json({ message: "published must be true/false" });
    }
    book.published = published;
    await book.save();
    res.json({ message: "Publish state updated", published: book.published, book });
  } catch (error) {
    res.status(400).json({ message: "Invalid book id " });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({})
      .populate("author", "name email role")
      .sort({ createdAt: -1 });
    return res.json(books);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching books" });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "author",
      "name email role"
    );
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.json(book);
  } catch {
    return res.status(400).json({ message: "Invalid book id" });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, description, tags, price } = req.body || {};
    if (!title) return res.status(400).json({ message: "Title is required" });

    const book = await Book.create({
      title,
      description: description || "",
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      price,
      author: req.user.id,
    });

    return res.status(201).json({ message: "Book Created", book });
  } catch (error) {
    return res.status(500).json({ message: "Server error creating book" });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const isOwner = String(book.author) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed to update this book" });
    }

    const { title, description, tags, price, published } = req.body || {};
    if (title !== undefined) book.title = title;
    if (description !== undefined) book.description = description;
    if (tags !== undefined) book.tags = Array.isArray(tags) ? tags : [tags];
    if (price !== undefined) book.price = price;
    if (published !== undefined) book.published = published;

    await book.save();
    return res.json({ message: "Book updated", book });
  } catch {
    return res.status(400).json({ message: "Invalid book id" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const isOwner = String(book.author) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed to delete this book" });
    }

    await book.deleteOne();
    return res.json({ message: "Book deleted" });
  } catch {
    return res.status(400).json({ message: "Invalid book id" });
  }
};



const getReadableBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("getReadableBook called for", bookId, "by", userId);

    const book = await Book.findById(bookId).populate("author", "name email");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const isAuthor = String(book.author._id || book.author) === String(userId);
    const isAdmin = userRole === "admin";

    // Author can always read own book
    if (isAuthor) {
      return res.json({ canRead: true, reason: "author", book });
    }

    // Admin can always read
    if (isAdmin) {
      return res.json({ canRead: true, reason: "admin", book });
    }

    // If not published → only author/admin
    if (!book.published) {
      return res.status(403).json({
        canRead: false,
        reason: "unpublished",
        message: "This book is not published yet.",
      });
    }

    // Check if user has paid order
    const paidOrder = await Order.findOne({
      book: bookId,
      buyer: userId,
      status: "paid",
    });

    if (paidOrder) {
      return res.json({ canRead: true, reason: "purchased", book });
    }

    // Free books
    if (!book.price || Number(book.price) === 0) {
      return res.json({ canRead: true, reason: "free", book });
    }

    // Otherwise no access
    return res.status(403).json({
      canRead: false,
      reason: "not_purchased",
      message: "You need to purchase this book to read it.",
    });
  } catch (err) {
    console.error("getReadableBook error:", err);
    return res
      .status(500)
      .json({ message: "Server error while checking book access" });
  }
};









module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  uploadBookCover,
  uploadBookFile,
  setPublish,
  getReadableBook, 
};
