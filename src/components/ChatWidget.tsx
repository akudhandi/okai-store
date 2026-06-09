"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface ChatMessage {
  role: "bot" | "user";
  text: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Halo Kanda! 👋 Aku Ami, asisten KAMBI. Ada yang bisa Ami bantu hari ini? (Tanya produk atau cek resi)" }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // State untuk mengecek apakah user sudah login
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cek token saat komponen dimuat pertama kali
  useEffect(() => {
    // 👇 UBAH DARI "token" MENJADI "kambi_token"
    const savedToken = localStorage.getItem("kambi_token"); 
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` // 👈 Bawa token VIP ke Laravel
        },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: "Maaf Kanda, Ami sedang gangguan sinyal. Coba lagi nanti ya! 😥" }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "bot", text: "Waduh, koneksi ke server Ami terputus nih." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 🔥 JIKA BELUM LOGIN, WIDGET TIDAK AKAN MUNCUL SAMA SEKALI
  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* BOX CHAT */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-[#EAE6D9] w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right">
          
          <div className="bg-[#3A5034] p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Ami - Asisten KAMBI</h3>
                <p className="text-[10px] text-white/70 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online 24/7
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[#FDFCF8] space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-[#D4A373] text-white rounded-tr-sm" 
                    : "bg-white border border-[#EAE6D9] text-[#2C352D] rounded-tl-sm shadow-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#EAE6D9] text-[#2C352D] p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-[#D4A373] rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#D4A373] rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-[#D4A373] rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#EAE6D9] flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pesan ke Ami..."
              disabled={isTyping}
              className="flex-1 py-2.5 px-4 bg-[#FDFCF8] border border-[#EAE6D9] rounded-full text-sm focus:outline-none focus:border-[#D4A373] disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 flex items-center justify-center bg-[#3A5034] text-white rounded-full hover:bg-[#2C352D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} className="ml-1" />
            </button>
          </form>
        </div>
      )}

      {/* TOMBOL MENGAMBANG */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"} transition-all duration-300 w-16 h-16 bg-[#D4A373] hover:bg-[#C28E5C] text-white rounded-full shadow-2xl flex items-center justify-center relative group`}
      >
        <MessageCircle size={32} />
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
      </button>
    </div>
  );
}