// backend/routes/bookRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const roles = require("../middleware/rolesMiddleware");
const { uploadCover, uploadFile } = require("../middleware/uploadMiddleware");

const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  uploadBookCover,
  uploadBookFile,
  setPublish,
  getReadableBook,
} = require("../controllers/bookController");

router.get("/", getAllBooks);
router.get("/mine", auth, async (req, res) => {
  const Book = require("../models/bookModel");
  const books = await Book.find({ author: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(books);
});
router.get("/:id/read", auth, getReadableBook);
router.get("/:id", getBookById);

router.post("/", auth, roles("author", "admin"), createBook);
router.patch("/:id", auth, updateBook);
router.delete("/:id", auth, deleteBook);

router.patch("/:id/cover", auth, uploadCover, uploadBookCover);
router.patch("/:id/file", auth, uploadFile, uploadBookFile);

router.patch("/:id/publish", auth, setPublish);

module.exports = router;
