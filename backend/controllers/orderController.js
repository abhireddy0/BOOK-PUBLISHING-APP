const Order = require("../models/orderModel");
const Book = require("../models/bookModel");


const createOrder = async (req, res) => {
  try {
    const { bookId } = req.params;


    const book = await Book.findById(bookId);
   
    if (!book || !book.published) {
      return res
        .status(404)
        .json({ message: "Book not available for purchase" });
    }

   
    if (String(book.author) === String(req.user.id)) {
      return res
        .status(400)
        .json({ message: "You can't buy your own book" });
    }


    const existing = await Order.findOne({
      book: bookId,
      buyer: req.user.id,
      status: "paid",
    });

    if (existing) {
      return res.status(400).json({ message: "Already purchased" });
    }

    
    const order = await Order.create({
      book: bookId,
      buyer: req.user.id,
      amount: book.price ?? 0,
      status: "paid",
    });

    return res.status(201).json({
      message: "Purchase successful",
      order,
    });
  } catch (error) {
    console.log("createOrder error", error);
    return res
      .status(500)
      .json({ message: "Server error creating order" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      buyer: req.user.id,
      status: "paid",
    }).populate("book", "title coverImage price fileUrl published");

    return res.json(orders);
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res
      .status(500)
      .json({ message: "Server error fetching orders" });
  }
};


const checkAccess = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

 
    const isAuthor = String(book.author) === String(req.user.id);
    if (isAuthor) {
      return res.json({
        canAccess: true,
        fileUrl: book.fileUrl,
      });
    }


    const order = await Order.findOne({
      book: bookId,
      buyer: req.user.id,
      status: "paid",
    });

    if (!order) {
      return res.json({
        canAccess: false,
        message: "You haven't purchased this book",
      });
    }

    return res.json({
      canAccess: true,
      fileUrl: book.fileUrl,
    });
  } catch (error) {
    console.log("checkAccess error:", error);
    return res
      .status(500)
      .json({ message: "Server error checking access" });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  checkAccess,
};
