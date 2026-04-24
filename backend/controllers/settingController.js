// backend/controllers/settingController.js
import Setting from "../models/Setting.js";
import Webhook from "../models/Webhook.js";
import logger from "../utils/logger.js";

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public (Should be private in production)
export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.getSingleton();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    logger.error("Failed to fetch settings", { message: error.message });
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update system settings
// @route   PATCH /api/settings
// @access  Public
export const updateSettings = async (req, res) => {
  try {
    const settings = await Setting.getSingleton();
    
    // Update fields
    const fieldsToUpdate = [
      "maxRetries", 
      "pollIntervalMs", 
      "signingSecret", 
      "appName", 
      "autoPurgeDays"
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    settings.updatedAt = Date.now();
    await settings.save();

    logger.info("System settings updated", { updatedBy: "user" });
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    logger.error("Failed to update settings", { message: error.message });
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Manually purge successful logs
// @route   POST /api/settings/purge
// @access  Public
export const purgeLogs = async (req, res) => {
  try {
    const result = await Webhook.deleteMany({ status: "success" });
    
    logger.warn("Manual log purge executed", { deletedCount: result.deletedCount });
    
    res.status(200).json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} successful webhook logs.` 
    });
  } catch (error) {
    logger.error("Purge logs failed", { message: error.message });
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
