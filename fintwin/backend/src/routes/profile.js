import express from "express";
import { callClaude } from "../services/claudeService.js";

const router = express.Router();

router.post("/profile", async (req, res) => {
  try {
    const userData = req.body;

    const result = await callClaude("", userData);

    res.json(result);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
