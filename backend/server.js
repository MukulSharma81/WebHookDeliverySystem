// server.js
// Entry point for the Webhook Delivery Guarantee System

import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import indexRouter from "./routes/index.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import logger from "./utils/logger.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
// CORS — allow requests from React frontend
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Idempotency-Key"],
  credentials: true,
}));

app.use(express.json());         // Parse incoming JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use("/", indexRouter);
app.use("/api/webhooks", webhookRoutes);

// 404 Handler — catch undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error("Unhandled server error", { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
const startServer = async () => {
  await connectDB(); // Connect to MongoDB first

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`, {
      environment: process.env.NODE_ENV,
      port: PORT,
    });
  });
};

startServer();

export default app;
