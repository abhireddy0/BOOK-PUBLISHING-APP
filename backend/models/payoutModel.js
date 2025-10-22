const mongoose = require('mongoose')
const payoutSchema = new mongoose.Schema({
    author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    amount:{type:Number,required:true},
    period: {type:String},
    status:{type:String,enum:['pending','paid'],default:'pending'},
    notes:{type:String}
},
{timestamps:true}
);
const Payout = mongoose.model("Payout",payoutSchema);
module.exports=Payout 