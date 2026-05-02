import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getDirectChat, sendDirectMessage } from "../services/chatService";
import { subscribeToDirectChat } from "../services/socketService";
import useAuth from "../hooks/useAuth";
import API from "../services/api";

const DirectChat = () => {
  const { userId2 } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const roomId = user?.id && userId2
    ? Math.min(Number(user.id), Number(userId2)) * 100000 + Math.max(Number(user.id), Number(userId2))
    : null;

  useEffect(() => {
    if (!user?.id || !userId2) return;
    Promise.all([
      getDirectChat(user.id, userId2),
      API.get(`/admin/users/${userId2}`).catch(() => ({ data: { email: "User" } })),
    ]).then(([msgs, userRes]) => {
      setMessages(msgs);
      setOtherUser(userRes.data);
    }).finally(() => setLoading(false));

    if (roomId) {
      subscribeToDirectChat(roomId, (msg) => {
        setMessages(prev => [...prev, msg]);
      });
    }
  }, [user?.id, userId2]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user?.id) return;
    try {
      setSending(true);
      await sendDirectMessage(user.id, userId2, user.id, input.trim());
      setInput("");
    } catch {} finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/profile" className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {otherUser?.fullName?.charAt(0)?.toUpperCase() || otherUser?.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{otherUser?.fullName || otherUser?.email || "User"}</p>
            <p className="text-xs text-emerald-500 font-medium">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-3 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="text-4xl mb-3">💬</span>
            <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === user?.id || msg.sender?.id === user?.id;
            const text = msg.message || msg.text;
            const time = msg.sentAt || msg.sent_at;
            return (
              <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
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
      <div className="bg-white border-t border-gray-100 sticky bottom-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto px-4 py-3 flex gap-3">
          <input type="text" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxLength={500} />
          <button type="submit" disabled={sending || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DirectChat;
