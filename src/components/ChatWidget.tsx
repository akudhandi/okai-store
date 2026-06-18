"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Maximize2, Minimize2, Trash2 } from "lucide-react"; // 👈 Tambah Trash2

interface ChatMessage {
  role: "bot" | "user";
  text: string;
}

const DEFAULT_MESSAGE: ChatMessage = { 
  role: "bot", 
  text: "Halo Kanda! 👋 Aku Ami, asisten KAMBI. Ada yang bisa Ami bantu hari ini? (Tanya produk atau cek resi)" 
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]); // 👈 Dikosongkan awal, diisi via useEffect
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. CEK TOKEN LOGIN & MUAT RIWAYAT OBROLAN
  useEffect(() => {
    const savedToken = localStorage.getItem("kambi_token"); 
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }

    // 🔥 TARIK INGATAN DARI LOCAL STORAGE
    const savedChat = localStorage.getItem("ami_chat_history");
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setMessages([DEFAULT_MESSAGE]);
    }
  }, []);

  // 2. SIMPAN SETIAP ADA PESAN BARU KE LOCAL STORAGE
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ami_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isExpanded]);

  // 3. FUNGSI HAPUS RIWAYAT (CLEAR CHAT)
  const handleClearChat = () => {
    if (window.confirm("Yakin ingin menghapus riwayat obrolan dengan Ami?")) {
      setMessages([DEFAULT_MESSAGE]);
      localStorage.removeItem("ami_chat_history");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token) return;

    const userText = input.trim();
    // Update UI langsung
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    try {
      // Saring pesan bawaan (Halo Kanda...) agar tidak dikirim ke AI berulang kali
      const chatHistoryForAI = messages.filter(m => m.text !== DEFAULT_MESSAGE.text);

      const response = await fetch("http://localhost:8000/api/chat/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          message: userText,
          history: chatHistoryForAI // 👈 Kirim memori obrolan ke Laravel
        }),
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

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-black text-[#2C352D]">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          <br />
        </React.Fragment>
      );
    });
  };

  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div 
          className={`bg-white rounded-3xl shadow-2xl border border-[#EAE6D9] flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in origin-bottom-right transition-all duration-300 ease-in-out ${
            isExpanded 
              ? "w-[90vw] sm:w-[80vw] md:w-[600px] h-[80vh] max-h-[800px]" 
              : "w-[350px] sm:w-[400px] h-[500px]"
          }`}
        >
          
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
            
            {/* 👈 KUMPULAN TOMBOL NAVIGASI HEADER */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleClearChat} 
                className="hover:bg-red-500/80 p-2 rounded-full transition-colors"
                title="Hapus Obrolan"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                title={isExpanded ? "Perkecil Layar" : "Perbesar Layar"}
              >
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Tutup Obrolan"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[#FDFCF8] space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-[#D4A373] text-white rounded-tr-sm" 
                    : "bg-white border border-[#EAE6D9] text-[#4d5c4e] rounded-tl-sm shadow-sm"
                }`}>
                  {formatMessage(msg.text)}
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