const Review = require("../models/reviewModel")
const Book = require("../models/bookModel")

const addReview = async (req,res)=>{
    try {
        const {rating,comment} =req.body;
        const {bookId} = req.params

        const book = await Book.findById(bookId);
        if(!book || !book.published){
            return res.status(404).json({message:'Book not found or not published'})
        }
        const review= await Review.create({
            book:bookId,
            user:req.user.id,
            rating,
            comment,

        })
        res.status(201).json({message:'Review added ',review})
    } catch (error) {

if(error.code===11000){
    return res.status(400).json({message:"you already reviewed this book"})
}
console.log("addReview Error",error);
res.status(500).json({message:"Server error adding review"})

    }
}

const getReviews = async (req,res)=>{
    try {
        const {bookId} = req.params;
        const list = await Review.find({book:bookId})
        .populate("user","name email")
        .sort({createdAt:-1})
     return res.json({list})
    } catch (error) {
        console.log("getReviews:",error);
        res.status(500).json({message:"Server error fetching reviews"})
        
    }
}
module.exports = {addReview,getReviews}