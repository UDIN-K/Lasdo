import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, Sparkles, 
  Calendar, CreditCard, Clock, Building2, ChevronRight, HelpCircle 
} from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function ChatbotWidget({ onOpenSchedule, onOpenQris }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Halo! Saya asisten virtual resmi Lasdo Family Futsal (Kelolaan Christino Hirasdo Wiryawan). Ada yang bisa saya bantu seputar jadwal sewa, tarif, atau fasilitas kami?',
      time: 'Baru saja',
    },
  ]);

  const messagesEndRef = useRef(null);

  // Auto scroll saat ada pesan baru
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Quick Questions
  const quickQuestions = [
    'Berapa tarif sewa lapangan & gedung serbaguna?',
    'Kapan jam operasional buka?',
    'Bagaimana cara bayar via QRIS?',
    'Fasilitas apa saja yang tersedia?',
    'Bagaimana cara booking lapangan?',
  ];

  const handleSend = async (textToSend = inputMessage) => {
    if (!textToSend || !textToSend.trim()) return;

    const userText = textToSend.trim();
    setInputMessage('');

    // Tambah pesan user ke list
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userText);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply,
        suggestedAction: response.suggestedAction,
        source: response.source,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Maaf, terjadi kendala saat memproses pertanyaan Anda. Silakan coba lagi atau cek langsung jadwal di website.',
        suggestedAction: 'Buka Jadwal & Pemesanan',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-5 right-5 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            </div>
            <span className="hidden sm:inline">Tanya Chatbot FAQ</span>
          </button>
        )}
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-96 h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-emerald-800 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                <Bot className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>Asisten Lasdo Futsal</span>
                  <span className="text-[10px] bg-emerald-900/80 px-1.5 py-0.2 rounded text-emerald-300 font-semibold">
                    AI FAQ
                  </span>
                </h4>
                <p className="text-[11px] text-emerald-200">
                  Online • Siap membantu info sewa
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                  {/* Tombol aksi kontekstual jika disarankan bot */}
                  {m.suggestedAction && (
                    <div className="pt-1.5 border-t border-slate-100">
                      {m.suggestedAction.includes('Jadwal') || m.suggestedAction.includes('Pemesanan') ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            if (onOpenSchedule) onOpenSchedule();
                          }}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Buka Jadwal & Pemesanan</span>
                        </button>
                      ) : m.suggestedAction.includes('QRIS') ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            if (onOpenQris) onOpenQris();
                          }}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Cek Status QRIS</span>
                        </button>
                      ) : null}
                    </div>
                  )}

                  <span
                    className={`text-[9px] block text-right ${
                      m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-slate-500">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="p-2 bg-white border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-[10px] font-medium shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5"
          >
            <input
              type="text"
              placeholder="Ketik pertanyaan seputar sewa..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
