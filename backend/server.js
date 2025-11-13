const express = require("express");
const dotenv = require("dotenv");
const configureDB = require("./config/db");
const cors = require("cors");

dotenv.config();
configureDB();

const app = express();

// 🔥 SUPER SIMPLE CORS FOR DEV
app.use(cors({
  origin: true,          // reflect request origin (5173, 5174, etc.)
  credentials: true,
}));

app.use(express.json());

// ------- ROUTES -------
const AuthRouter = require("./routes/authRoutes");
const BookRouter = require("./routes/bookRoutes");
const ReviewRouter = require("./routes/reviewRoutes");
const OrderRouter = require("./routes/orderRoutes");
const PaymentRouter = require("./routes/paymentRoutes");
const DashboardRouter = require("./routes/dashboardRoutes");
const GeminiRouter = require("./routes/aiRoutes");

app.use("/auth", AuthRouter);
app.use("/books", BookRouter);
app.use("/", ReviewRouter);
app.use("/", OrderRouter);
app.use("/", PaymentRouter);
app.use("/", DashboardRouter);
app.use("/gemini", GeminiRouter);

// ------- SERVER -------
const PORT = process.env.PORT || 3990;
app.listen(PORT, () => {
  console.log(`🚀 server is running on port ${PORT}`);
});
