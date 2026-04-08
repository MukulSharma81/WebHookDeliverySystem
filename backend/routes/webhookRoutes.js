// routes/webhookRoutes.js
// Defines all /api/webhooks route endpoints

import express from "express";
import {
  createWebhook,
  getAllWebhooks,
  getWebhookById,
} from "../controllers/webhookController.js";

const router = express.Router();

// POST   /api/webhooks       → Create a new webhook
router.post("/", createWebhook);

// GET    /api/webhooks       → Get all webhooks
router.get("/", getAllWebhooks);

// GET    /api/webhooks/:id   → Get a single webhook by ID
router.get("/:id", getWebhookById);

export default router;
