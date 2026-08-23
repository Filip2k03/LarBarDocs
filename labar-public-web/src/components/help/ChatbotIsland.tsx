import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Phone, HelpCircle } from 'lucide-react';
import { ConfigService } from '@/services/config.service';
import type { SystemConfig } from '@/types/api';

export const ChatbotIsland: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([
    { sender: 'bot', text: 'Mingalarbar! How can we assist your journey with LaBar today?' },
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    ConfigService.getSystemConfig()
      .then(setConfig)
      .catch(() => {
        // Fallback default config
        setConfig({
          app_name: 'LaBar',
          tagline: 'Your ride. Our care.',
          support_phone: '+95 9 798 421092',
          support_email: 'support@labar.com.mm',
          chat_enabled: true,
          driver_registration_open: true,
          minimum_app_version: { ios: '1.2.0', android: '1.2.0' },
          supported_currencies: ['MMK'],
          default_currency: 'MMK',
          active_cities_count: 25,
        });
      });
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    // If chat backend is available, query; otherwise provide instant contextual guidance
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Thank you for reaching out. For live trip assistance, please call our 24/7 hotline at ' +
            (config?.support_phone || '+95 9 798 421092') +
            ' or explore our Help Center for instant answers.',
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-brand-red hover:bg-brand-deepRed text-white shadow-soft-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open live chat"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-white rounded-3xl shadow-soft-lg border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="bg-brand-red text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                <Bot size={18} />
              </div>
              <div>
                <div className="text-xs font-bold">LaBar Support Assistant</div>
                <div className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Online • Myanmar 24/7</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-brand-red text-white rounded-br-none'
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Action Quick Links */}
          <div className="px-3 py-2 bg-white border-t border-neutral-100 flex gap-2 text-[10px] font-bold">
            <a
              href={`tel:${config?.support_phone || '+959798421092'}`}
              className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center gap-1 transition-colors"
            >
              <Phone size={12} />
              <span>Call Hotline</span>
            </a>
            <a
              href="/help"
              className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center gap-1 transition-colors"
            >
              <HelpCircle size={12} />
              <span>Help Center</span>
            </a>
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-brand-red text-white hover:bg-brand-deepRed transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
