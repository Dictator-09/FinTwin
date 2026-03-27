import express from "express";
import { callClaude } from "../services/claudeService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const userData = req.body;

    if (!userData || !userData.income) {
      return res.status(400).json({ error: "Invalid request body. Financial data is required." });
    }

    const result = await callClaude("", userData);
    res.json(result);
  } catch (error) {
    console.error("Profile generation error:", error.message);

    // Give the frontend a meaningful error message
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Failed to generate financial twin profile.";

    res.status(status).json({ error: message });
  }
});

export default router;
