const express = require("express");
const dotenv = require("dotenv");
const configureDB = require("./config/db");
const cors = require("cors");
const genToken = require("./config/token")

dotenv.config();
configureDB();

const app = express();


app.use(cors({
  origin: true,         
  credentials: true,
}));

app.use(express.json());


const AuthRouter = require("./routes/authRoutes");
const BookRouter = require("./routes/bookRoutes");
const ReviewRouter = require("./routes/reviewRoutes");
const OrderRouter = require("./routes/orderRoutes");
const PaymentRouter = require("./routes/paymentRoutes");
const dashboardRoutes =require("./routes/dashboardRoutes")
const GeminiRouter = require("./routes/aiRoutes");


app.use("/auth", AuthRouter);
app.use("/books", BookRouter);
app.use("/", ReviewRouter);
app.use("/", OrderRouter);
app.use("/dashboard", dashboardRoutes);
app.use("/gemini", GeminiRouter);
app.use("/status",(req,res)=>{res.send(200)})
app.use("/users", require("./routes/userRoutes"));
app.use("/pay", PaymentRouter);


const PORT = process.env.PORT || 3990;
app.listen(PORT, () => {
  console.log(`🚀 server is running on port ${PORT}     ABHISHEK REDDY PUSHED CODE`);
});
