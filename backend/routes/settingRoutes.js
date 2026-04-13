// backend/routes/settingRoutes.js
import express from "express";
import { getSettings, updateSettings, purgeLogs } from "../controllers/settingController.js";

const router = express.Router();

router.route("/")
  .get(getSettings)
  .patch(updateSettings);

router.post("/purge", purgeLogs);

export default router;
