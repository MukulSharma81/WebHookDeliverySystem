// workers/worker.js
// Background worker — polls MongoDB and delivers pending webhooks

import axios from "axios";
import Webhook from "../models/Webhook.js";
import Setting from "../models/Setting.js";
import logger from "../utils/logger.js";

// Runtime configuration (updated dynamically)
let CONFIG = {
  maxRetries: 3,
  pollIntervalMs: 10000,
  signingSecret: "whsec_..."
};

// ──────────────────────────────────────────────
// Deliver a single webhook
// ──────────────────────────────────────────────
const deliverWebhook = async (webhook) => {
  logger.info(`[Worker] Attempting delivery`, {
    id: webhook._id,
    url: webhook.url,
    retryCount: webhook.retryCount,
  });

  try {
    // Send HTTP POST with the stored payload
    const response = await axios.post(webhook.url, webhook.payload, {
      timeout: 10_000, // 10s timeout per request
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Id": webhook._id.toString(),
        "X-Idempotency-Key": webhook.idempotencyKey,
        "X-Webhook-Signature": CONFIG.signingSecret, // Added signing signature
      },
    });

    // ✅ Success — update status
    await Webhook.findByIdAndUpdate(webhook._id, {
      status: "success",
      nextRetryAt: null,
    });

    logger.info(`[Worker] ✅ Delivered successfully`, {
      id: webhook._id,
      statusCode: response.status,
    });

  } catch (error) {
    const newRetryCount = webhook.retryCount + 1;

    if (newRetryCount >= CONFIG.maxRetries) {
      // ❌ Max retries reached — permanently mark as failed
      await Webhook.findByIdAndUpdate(webhook._id, {
        status: "failed",
        retryCount: newRetryCount,
        nextRetryAt: null,
      });

      logger.error(`[Worker] ❌ Max retries reached — marked as FAILED`, {
        id: webhook._id,
        totalAttempts: newRetryCount,
        error: error.message,
      });

    } else {
      // 🔄 Schedule next retry using exponential backoff (2^retryCount minutes)
      const delayMs = Math.pow(2, newRetryCount) * 60 * 1000;
      const nextRetryAt = new Date(Date.now() + delayMs);

      await Webhook.findByIdAndUpdate(webhook._id, {
        retryCount: newRetryCount,
        nextRetryAt,
        status: "pending", // Keep as pending until max retries
      });

      logger.warn(`[Worker] 🔄 Delivery failed — scheduled retry`, {
        id: webhook._id,
        retryCount: newRetryCount,
        nextRetryAt: nextRetryAt.toISOString(),
        delayMinutes: delayMs / 60_000,
        error: error.message,
      });
    }
  }
};

// ──────────────────────────────────────────────
// Poll DB and process all due pending webhooks
// ──────────────────────────────────────────────
const processPendingWebhooks = async () => {
  try {
    // 1. Refresh Dynamic Configuration from DB
    const settings = await Setting.getSingleton();
    CONFIG = {
      maxRetries: settings.maxRetries,
      pollIntervalMs: settings.pollIntervalMs,
      signingSecret: settings.signingSecret,
    };

    const now = new Date();

    // Fetch webhooks that are:
    // status = "pending" AND (nextRetryAt is null OR nextRetryAt <= now)
    const pendingWebhooks = await Webhook.find({
      status: "pending",
      $or: [
        { nextRetryAt: null },
        { nextRetryAt: { $lte: now } },
      ],
    });

    if (pendingWebhooks.length > 0) {
      logger.info(`[Worker] Found ${pendingWebhooks.length} pending webhook(s). Processing...`);
      await Promise.allSettled(pendingWebhooks.map(deliverWebhook));
    }

  } catch (error) {
    logger.error("[Worker] Error during polling cycle", { message: error.message });
  } finally {
    // Schedule next run based on dynamic interval
    setTimeout(processPendingWebhooks, CONFIG.pollIntervalMs);
  }
};

// ──────────────────────────────────────────────
// Start the worker polling loop
// ──────────────────────────────────────────────
export const startWorker = () => {
  logger.info(`[Worker] 🚀 Started with Dynamic Configuration`);
  
  // Start the recursive timeout loop
  processPendingWebhooks();
};
