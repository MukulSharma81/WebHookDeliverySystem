// workers/worker.js
// Background worker — polls MongoDB and delivers pending webhooks

import axios from "axios";
import Webhook from "../models/Webhook.js";
import logger from "../utils/logger.js";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────
const MAX_RETRIES = 3;             // Max delivery attempts
const POLL_INTERVAL_MS = 10_000;  // Poll every 10 seconds

// Exponential backoff delays (in ms) indexed by retryCount
// retryCount 1 → 1 min, 2 → 2 min, 3 → 5 min
const RETRY_DELAYS_MS = {
  1: 1 * 60 * 1000,   // 60,000 ms  → 1 minute
  2: 2 * 60 * 1000,   // 120,000 ms → 2 minutes
  3: 5 * 60 * 1000,   // 300,000 ms → 5 minutes
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

    if (newRetryCount >= MAX_RETRIES) {
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
      // 🔄 Schedule next retry using exponential backoff
      const delayMs = RETRY_DELAYS_MS[newRetryCount] || 60_000;
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
    const now = new Date();

    // Fetch webhooks that are:
    //   - status = "pending"
    //   - AND (nextRetryAt is null OR nextRetryAt <= now)
    const pendingWebhooks = await Webhook.find({
      status: "pending",
      $or: [
        { nextRetryAt: null },
        { nextRetryAt: { $lte: now } },
      ],
    });

    if (pendingWebhooks.length === 0) {
      logger.debug("[Worker] No pending webhooks to process.");
      return;
    }

    logger.info(`[Worker] Found ${pendingWebhooks.length} pending webhook(s). Processing...`);

    // Process all pending webhooks concurrently
    await Promise.allSettled(pendingWebhooks.map(deliverWebhook));

  } catch (error) {
    logger.error("[Worker] Error during polling cycle", { message: error.message });
  }
};

// ──────────────────────────────────────────────
// Start the worker polling loop
// ──────────────────────────────────────────────
export const startWorker = () => {
  logger.info(`[Worker] 🚀 Started — polling every ${POLL_INTERVAL_MS / 1000}s`);

  // Run immediately on start, then on each interval
  processPendingWebhooks();
  setInterval(processPendingWebhooks, POLL_INTERVAL_MS);
};
