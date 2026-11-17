import dotenv from "dotenv";
dotenv.config();
console.log("SMTP ENV CHECK:", {
  userLoaded: Boolean(process.env.SMTP_USER),
  passLoaded: Boolean(process.env.SMTP_PASS),
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT
});
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import superAdminRoutes from "./routes/superadmin.routes.js";
import contentRoutes from "./routes/content.routes.js";
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.31.186:5173",
  "https://calzare-frontend.onrender.com"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.get("/api/health", (_req, res) => res.json({ success: true, message: "Calzare API is healthy" }));
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const start = async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in backend/.env");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    const port = process.env.PORT || 5000;
    app.listen(port, "0.0.0.0", () => {
  console.log(`Calzare API running on port ${port}`);
});
  } catch (error) {
  console.error("STARTUP FAILED:", error);
  console.error("ERROR MESSAGE:", error.message);
  console.error("ERROR STACK:", error.stack);
  process.exit(1);
}
};
start();
