import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Calendar, CreditCard } from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function ChatbotWidget({ onOpenSchedule, onOpenQris }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Halo! Ada yang bisa dibantu soal tarif sewa, jam buka, pembayaran QRIS, atau fasilitas Lasdo Family Futsal?',
      time: 'Sekarang',
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    'Tarif sewa lapangan & gedung',
    'Jam operasional buka',
    'Cara bayar via QRIS',
    'Fasilitas yang tersedia',
  ];

  const handleSend = async (textToSend = inputMessage) => {
    if (!textToSend || !textToSend.trim()) return;

    const userText = textToSend.trim();
    setInputMessage('');

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
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Maaf, terjadi kendala saat memproses pertanyaan Anda. Silakan cek jadwal langsung di halaman ini.',
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
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Tanya Pengelola Lasdo Family Futsal"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Tanya Pengelola</span>
          </button>
        </div>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Pusat Bantuan Lasdo Family Futsal"
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 w-[92vw] sm:w-96 h-[520px] max-h-[82vh] bg-white rounded-lg shadow-xl border border-stone-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-zinc-900 text-white flex items-center justify-between">
            <div>
              <h4 className="font-heading font-bold text-sm leading-tight">
                Pusat Bantuan Lasdo
              </h4>
              <p className="text-[11px] text-zinc-300">
                Info tarif sewa, jadwal kosong, dan QRIS
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup jendela bantuan"
              className="p-1.5 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#fafaf8] text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                  {m.suggestedAction && (
                    <div className="pt-2 border-t border-slate-100">
                      {m.suggestedAction.includes('Jadwal') || m.suggestedAction.includes('Pemesanan') ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            if (onOpenSchedule) onOpenSchedule();
                          }}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Lihat Jadwal Kosong</span>
                        </button>
                      ) : m.suggestedAction.includes('QRIS') ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            if (onOpenQris) onOpenQris();
                          }}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Cek Status QRIS</span>
                        </button>
                      ) : null}
                    </div>
                  )}

                  <span
                    className={`text-[10px] block text-right ${
                      m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 w-fit">
                <span>Mengetik jawaban...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Grid (Wraps cleanly, easy to click) */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex flex-wrap gap-1.5">
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
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
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <label htmlFor="chatbot-input" className="sr-only">
              Tulis pertanyaan
            </label>
            <input
              id="chatbot-input"
              type="text"
              placeholder="Tulis pertanyaan Anda..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              aria-label="Kirim pesan"
              className="p-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
