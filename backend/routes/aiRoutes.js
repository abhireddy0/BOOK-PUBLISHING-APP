const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ message: "prompt required" });

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({ message: text });
    }

    const json = await resp.json();
    const reply =
      json?.candidates?.[0]?.content?.parts?.[0]?.text || "no reply generated";

    res.json({ ok: true, reply });
  } catch (e) {
    res.status(500).json({ message: "gemini error", detail: e.message });
  }
});

module.exports = router;
