const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
  name: {type:String,require:true,trim:true},
  email: {type:String,require:true,lowercase:true,trim:true},
  password: {type:String,require:true,minlength:6 },
  role: {type:String, enum:['reader','author','admin'],default:'reader' },
  avatar:{type:String},
  bio:{type:String,trim:true,maxlength:300},
},
{timestamps:true}
);
const User = mongoose.model("User",userSchema);

module.exports = User;