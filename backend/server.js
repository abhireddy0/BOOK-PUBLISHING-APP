const express = require('express') 
const dotenv = require('dotenv')
const configureDB = require("./config/db")
dotenv.config()
configureDB()

const app = express()
app.use(express.json())
app.get("/",(req,res)=>{
  res.send("Book publishing app api is running suucesfuuly")
})

const PORT = process.env || 3990;


app.listen(PORT,()=>{
    console.log('✅ server is running on port 3990 ');
    
})