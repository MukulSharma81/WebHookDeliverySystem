 // controllers/webhookController.js
// Handles all webhook-related business logic

import Webhook from "../models/Webhook.js";
import logger from "../utils/logger.js";

// ──────────────────────────────────────────────
// POST /api/webhooks
// Create a new webhook (with idempotency check)
// ──────────────────────────────────────────────
export const createWebhook = async (req, res) => {
  try {
    const { url, payload, idempotencyKey } = req.body;

    // Validate required fields
    if (!url || !payload || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "urll, payload, and idempotencyKey are required fields.",
      });
    }

    // Idempotency check — return existing doc if key already used
    const existing = await Webhook.findOne({ idempotencyKey });
    if (existing) {
      logger.warn("Duplicate webhook request blocked", { idempotencyKey });
      return res.status(200).json({
        success: true,
        message: "Duplicate request — returning existing webhook.",
        data: existing,
      });
    }

    // Create and save the new webhook
    const webhook = await Webhook.create({
      url,
      payload,
      idempotencyKey,
    });

    logger.info("Webhook created successfully", { id: webhook._id });

    return res.status(201).json({
      success: true,
      message: "Webhook created successfully.",
      data: webhook,
    });
  } catch (error) {
    logger.error("Error creating webhook", { message: error.message });

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ──────────────────────────────────────────────
// GET /api/webhooks
// Return all webhooks (newest first)
// ──────────────────────────────────────────────
export const getAllWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: webhooks.length,
      data: webhooks,
    });
  } catch (error) {
    logger.error("Error fetching webhooks", { message: error.message });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ──────────────────────────────────────────────
// GET /api/webhooks/:id
// Return a single webhook by MongoDB ID
// ──────────────────────────────────────────────
export const getWebhookById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format before querying
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhookk ID format.",
      });
    }

    const webhook = await Webhook.findById(id);

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: "Webhook not foundd.",
      });
    }

    return res.status(200).json({
      success:true,
      data: webhook,
    });
  } catch (error) {
    logger.error("Error fetching webhook by ID", { message: error.message });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
