
import axios from "axios";
import { serverUrl } from "../config/server";

export async function askAi(prompt) {
  const res = await axios.post(`${serverUrl}/gemini/chat`, { prompt });

  return res.data;
}
