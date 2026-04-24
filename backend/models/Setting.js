// backend/models/Setting.js
import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  maxRetries: {
    type: Number,
    default: 3,
  },
  pollIntervalMs: {
    type: Number,
    default: 10000,
  },
  signingSecret: {
    type: String,
    default: "whsec_" + Math.random().toString(36).substring(7),
  },
  appName: {
    type: String,
    default: "WebhookDeliverySystem",
  },
  autoPurgeDays: {
    type: Number,
    default: 30,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Singleton pattern: Ensure only one settings document exists
settingSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model("Setting", settingSchema);
