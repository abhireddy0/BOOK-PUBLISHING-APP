const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

router.post("/chat", auth, async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ message: "prompt required" });

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "OpenAI API key not configured" });
    }

    const url = "https://api.openai.com/v1/chat/completions";

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("[AI] OpenAI error:", text);
      return res.status(500).json({ message: "AI service error", detail: text });
    }

    const json = await resp.json();
    const reply = json?.choices?.[0]?.message?.content || "no reply generated";

    res.json({ ok: true, reply });
  } catch (e) {
    console.error("[AI] Error:", e.message);
    res.status(500).json({ message: "AI error", detail: e.message });
  }
});

module.exports = router;
