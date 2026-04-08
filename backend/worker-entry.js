// worker-entry.js
// Standalone entry point for the Webhook Delivery Worker

import "dotenv/config";
import connectDB from "./config/db.js";
import { startWorker } from "./workers/worker.js";
import logger from "./utils/logger.js";

const startStandaloneWorker = async () => {
  logger.info("Initializing Standalone Webhook Worker...");

  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start the worker polling loop
    startWorker();

    logger.info("Worker process is active and polling for webhooks.");

    // Handle process termination gracefully
    process.on("SIGTERM", () => {
      logger.info("Worker shutting down (SIGTERM)...");
      process.exit(0);
    });

    process.on("SIGINT", () => {
      logger.info("Worker shutting down (SIGINT)...");
      process.exit(0);
    });

  } catch (error) {
    logger.error("Failed to start worker process", { message: error.message });
    process.exit(1);
  }
};

startStandaloneWorker();
