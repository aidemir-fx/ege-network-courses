import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { User, SupportMessage } from '../types';
import { getStoredSupportMessages, sendSupportMessage, fetchServerSupportMessages } from '../utils/adminStore';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userTgId = currentUser?.telegramId || currentUser?.id || 'guest-user';
  const userName = currentUser?.name || 'Ученик';

  const loadMessages = async () => {
    const allMsgs = await fetchServerSupportMessages();
    // Filter messages for current user
    const userMsgs = allMsgs.filter(m => m.userTelegramId === userTgId);
    setMessages(userMsgs);
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userTgId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = sendSupportMessage({
      userTelegramId: userTgId,
      userName: userName,
      sender: 'user',
      text: inputText.trim(),
      isRead: false,
    });

    setInputText('');
    loadMessages();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#151C2C] w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1B2438] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">Служба поддержки</h3>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Операторы на связи 24/7
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#0F1523]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center text-orange-400">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Задайте нам вопрос</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Опишите вашу проблему с доступом, оплатой или материалами. Мы ответим прямо здесь!
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-[#FF6B35] to-amber-500 text-white rounded-br-xs shadow-md shadow-[#FF6B35]/10'
                        : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60'
                    }`}
                  >
                    {!isUser && (
                      <div className="text-[11px] font-bold text-orange-400 mb-1">
                        Поддержка EGE NETWORK
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        isUser ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {m.createdAt}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-[#1B2438] border-t border-slate-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Введите ваше сообщение поддержке..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-amber-500 hover:opacity-90 disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-[#FF6B35]/20 transition-all cursor-pointer shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
