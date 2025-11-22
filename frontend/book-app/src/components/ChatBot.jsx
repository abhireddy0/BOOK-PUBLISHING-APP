// src/components/ChatBot.jsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { askAi } from "../api/ai";

export default function ChatBot() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text:
        "Hi! I’m your StoryVerse assistant 💫\n\n" +
        "I can help you with publishing, pricing, buying and reading books here.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const hideOnRoutes = ["/", "/login", "/signup", "/forgot-password"];
  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      setLoading(true);

      const fullPrompt = `
You are an AI assistant inside a digital book platform called "StoryVerse".
You help:

- authors with: how to publish a book here, how to set price, drafts vs publish, dashboards, analytics.
- readers with: how to buy, read, download books, payments, library, orders, access.

Guidelines:
- Answer in short, friendly paragraphs.
- Use bullet points for steps.
- Keep answers focused on how to use the StoryVerse app.
- Max 6–8 lines total.
- Be warm and encouraging.

User question: ${trimmed}
      `.trim();

      const data = await askAi(fullPrompt);
      const replyText =
        data?.reply ||
        "Hmm, I couldn’t generate a reply just now. Try asking in a slightly different way 🙂";

      const botMsg = { from: "bot", text: replyText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Oops, I had trouble talking to the AI right now. Please try again in a few seconds 🙏",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderText = (text) => {
    const paragraphs = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    return paragraphs.map((p, i) => (
      <p key={i} className="mb-1">
        {p}
      </p>
    ));
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 h-11 w-11 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center text-xl z-40 hover:bg-slate-800 active:scale-95 transition"
        aria-label="Open StoryVerse assistant"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-40">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">StoryVerse Assistant</p>
              <p className="text-[11px] text-slate-200">
                Ask anything about publishing or reading here.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-slate-200 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 px-3 py-2 overflow-y-auto bg-slate-50 space-y-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={m.from === "user" ? "text-right" : "text-left"}
              >
                <div
                  className={
                    "inline-block rounded-2xl px-3 py-2 text-xs max-w-[90%] leading-relaxed " +
                    (m.from === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900 border border-slate-200")
                  }
                >
                  {renderText(m.text)}
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-[11px] text-slate-500 mt-1">Thinking…</p>
            )}
          </div>

          <div className="border-t border-slate-200 p-2 bg-white">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask how to publish, price, or buy a book…"
              className="w-full text-xs border border-slate-300 rounded-lg px-2 py-1.5 resize-none outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="mt-1 w-full h-8 rounded-lg bg-slate-900 text-white text-xs font-medium disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
