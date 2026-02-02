
import { api } from "./axios";

export async function askAi(prompt) {
  const res = await api.post("/gemini/chat", { prompt });

  return res.data;
}
