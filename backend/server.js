const express = require("express");
const dotenv = require("dotenv");
const configureDB = require("./config/db");
const cors = require("cors");

dotenv.config();
configureDB();

const app = express();

/**
 * Trust proxy (required for Render / rate-limit / correct IPs)
 */
app.set("trust proxy", 1);

/**
 * ✅ ALLOWED ORIGINS
 * IMPORTANT: include your Vercel frontend URL here
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "https://book-publishing-app-11.onrender.com", // ✅ PRODUCTION FRONTEND
];

/**
 * ✅ CORS MIDDLEWARE
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server & Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked: ${origin} not allowed`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * ✅ VERY IMPORTANT — allow preflight requests
 */
app.options("*", cors());

/**
 * Body parser
 */
app.use(express.json());

/**
 * Request logger (safe after CORS)
 */
const requestLogger = require("./middleware/requestLogger");
app.use(requestLogger);


app.use("/auth", require("./routes/authRoutes"));
app.use("/books", require("./routes/bookRoutes"));
app.use("/", require("./routes/reviewRoutes"));
app.use("/", require("./routes/orderRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
app.use("/gemini", require("./routes/aiRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/payments", require("./routes/paymentRoutes"));

/**
 * Health check
 */
app.get("/status", (req, res) => {
  res.status(200).send("OK");
});

/**
 * Start server
 */
const PORT = process.env.PORT || 3990;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
