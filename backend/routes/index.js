// routes/index.js
// Root-level router — aggregates all sub-routes

import express from "express";

const router = express.Router();

// Health check route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Webhook Delivery Guarantee System is running 🚀",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

export default router;
