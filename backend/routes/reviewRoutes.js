const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addReview, getReviews } = require("../controllers/reviewController");


router.post("/books/:bookId/review", auth, addReview);


router.get("/books/:bookId/reviews", getReviews);

module.exports = router;
