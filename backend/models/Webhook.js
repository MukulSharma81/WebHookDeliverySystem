// models/Webhook.js
// Mongoose schema for Webhook documents

import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Webhook URL is required"],
      trim: true,
      match: [/^https?:\/\/.+/, "Please provide a valid URL (http/https)"],
    },

    payload: {
      type: mongoose.Schema.Types.Mixed, // Accepts any JSON object
      required: [true, "Payload is required"],
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "success", "failed"],
        message: "Status must be one of: pending, success, failed",
      },
      default: "pending",
    },

    retryCount: {
      type: Number,
      default: 0,
      min: [0, "Retry count cannot be negative"],
    },

    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
      trim: true,
      index: true, // Fast lookups on duplicate check
    },

    nextRetryAt: {
      type: Date,
      default: null, // null means eligible immediately
      index: true,   // Indexed for efficient worker polling queries
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
    versionKey: false, // Remove __v field
  }
);

const Webhook = mongoose.model("Webhook", webhookSchema);

export default Webhook;
