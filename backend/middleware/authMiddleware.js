// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  const token = bearer || req.query.token;   // 👈 accept token from query for new-tab links

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
