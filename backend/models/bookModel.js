const mongoose = require('mongoose')
const bookSchema = new mongoose.Schema({
    title:{type:String,required:true},
    price:{type:Number,required:true},
    description:{type:String,required:true},
    coverImage:{type:String},
    fileUrl:{type:String},
    author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    status:{type:String,enum:['draft','published'],default:'draft'},
   },
 {timestamps:true}
)
const Book = mongoose.model('Book',bookSchema);
module.exports = Book;