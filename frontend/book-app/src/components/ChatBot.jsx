import React, { useState } from "react";
import aiImg from "../assets/ai.png"

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setLoading(true);

    try {
      const reply = await askAi(userMsg.text);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error talking to AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };




  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-black text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl text-2xl"
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white shadow-xl rounded-xl border overflow-hidden flex flex-col">
          <div className="p-3 font-semibold bg-black text-white">
            AI Assistant
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm ${
                  m.sender === "user"
                    ? "bg-blue-100 ml-auto w-fit"
                    : "bg-gray-200 mr-auto w-fit"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <p className="text-xs text-gray-400">Typing...</p>}
          </div>

          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded px-2 text-sm"
              placeholder="Ask something..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={sendMessage}
              className="px-3 bg-black text-white rounded text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
