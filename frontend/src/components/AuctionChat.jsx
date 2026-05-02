import { useEffect, useState, useRef } from "react";
import { getAuctionChat, sendAuctionMessage } from "../services/chatService";
import { subscribeToChat } from "../services/socketService";
import useAuth from "../hooks/useAuth";
import { formatDate } from "../utils/helpers";

const AuctionChat = ({ productId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!productId) return;
    getAuctionChat(productId).then(setMessages).catch(() => {});
    subscribeToChat(productId, (msg) => {
      if (msg.type === "CHAT") {
        setMessages(prev => [...prev, msg]);
      }
    });
  }, [productId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user?.id) return;
    try {
      setLoading(true);
      await sendAuctionMessage(productId, user.id, input.trim());
      setInput("");
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span className="font-bold text-gray-800 text-sm">Auction Chat</span>
          {messages.length > 0 && (
            <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-3xl mb-2">💬</span>
                <p className="text-gray-400 text-sm">No messages yet</p>
                <p className="text-gray-300 text-xs">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.senderId === user?.id || msg.sender?.id === user?.id;
                const name = msg.senderName || msg.sender?.fullName || "User";
                const text = msg.message || msg.text;
                const time = msg.sentAt || msg.sent_at;
                return (
                  <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      {!isMe && <p className="text-xs text-gray-400 font-medium px-1">{name}</p>}
                      <div className={`px-3 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                      }`}>
                        {text}
                      </div>
                      <p className="text-[10px] text-gray-400 px-1">
                        {time ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {user ? (
            <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-gray-100 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={500}
              />
              <button type="submit" disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
                {loading ? "..." : "Send"}
              </button>
            </form>
          ) : (
            <div className="p-3 text-center text-sm text-gray-400 border-t border-gray-100">
              <a href="/login" className="text-indigo-600 font-medium">Login</a> to chat
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuctionChat;
