// src/api/ai.js
import axios from "axios";
import { serverUrl } from "../config/server";

// This calls your backend: POST /gemini/chat { prompt }
export async function askAi(prompt) {
  const res = await axios.post(`${serverUrl}/gemini/chat`, { prompt });
  // backend returns: { ok: true, reply }
  return res.data;
}
