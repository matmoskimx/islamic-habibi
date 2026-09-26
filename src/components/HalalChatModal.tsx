import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Phone, 
  Heart, 
  CheckCircle2, 
  Lock, 
  Info,
  Clock,
  MessageSquareHeart,
  ChevronDown
} from 'lucide-react';
import { MatrimonialProfile, ChatSession, ChatMessage } from '../types';

interface HalalChatModalProps {
  profile: MatrimonialProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenUnlockModal: (profile: MatrimonialProfile) => void;
}

export const HalalChatModal: React.FC<HalalChatModalProps> = ({
  profile,
  isOpen,
  onClose,
  onOpenUnlockModal
}) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [senderName, setSenderName] = useState('Brother / Sister');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSession = async () => {
    if (!profile) return;
    setIsLoadingSession(true);
    try {
      const res = await fetch(`/api/chats/${profile.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.chat) {
          setSession(data.chat);
          setMessages(data.chat.messages || []);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    if (isOpen && profile) {
      fetchSession();
    }
  }, [isOpen, profile?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !profile) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    if (!session?.isUnlocked) {
      onOpenUnlockModal(profile);
      return;
    }

    setIsSending(true);
    setInputText('');

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      chatId: session.id,
      senderId: 'current-user',
      senderName,
      senderRole: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/chats/${profile.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          senderName
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      if (data.candidateReply) {
        // Add candidate reply
        setMessages((prev) => [...prev, data.candidateReply]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Message sending failed.';
      alert(msg);
    } finally {
      setIsSending(false);
    }
  };

  const icebreakers = [
    'As-salamu alaykum, what is your desired timeline for Nikah?',
    'Could you tell me more about your daily Islamic routine and prayers?',
    'What qualities are most essential to you in a righteous spouse?',
    'Would you and your family be open to an introductory Wali call?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl h-[90vh] max-h-[750px] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-neutral-950 to-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-12 h-12 rounded-2xl object-cover border border-emerald-600/60 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-950" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-neutral-100 truncate">
                  {profile.fullName}
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60 shrink-0">
                  {profile.age} yrs
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate">
                {profile.profession} · {profile.city}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-amber-300">
                <Users className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">Wali: {profile.waliName || 'Guardian'} ({profile.waliContactPhone || '+256 744 042 286'})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {session?.isUnlocked ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chat Active</span>
              </span>
            ) : (
              <button
                onClick={() => onOpenUnlockModal(profile)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Chat ($3.00)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sharia Etiquette Banner */}
        <div className="bg-emerald-950/40 border-b border-emerald-900/40 px-4 py-2 flex items-center justify-between text-[11px] text-emerald-300 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Islamic Etiquette Observed · Both Walis Notified · Strictly for Marriage</span>
          </div>
          <span className="font-mono text-neutral-400 hidden sm:inline">Habibi Halal Chat</span>
        </div>

        {/* Lock Overlay if Not Unlocked */}
        {!session?.isUnlocked && (
          <div className="bg-gradient-to-r from-amber-950/60 via-neutral-950 to-neutral-900 border-b border-amber-900/50 p-4 shrink-0 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Lock className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-200">
                  Direct Halal Messaging is Currently Locked
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Activate a 30-day chat pass ($3.00) or subscribe to any Zawaj Package to send messages to {profile.nickname || profile.fullName}.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenUnlockModal(profile)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-neutral-950 font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              <MessageSquareHeart className="w-4 h-4 text-neutral-950" />
              <span>Unlock 30-Day Chat ($3.00)</span>
            </button>
          </div>
        )}

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-neutral-950/40">
          {isLoadingSession ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isUser = msg.senderRole === 'user';
                const isSystem = msg.senderRole === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="p-3 rounded-2xl bg-neutral-900/90 border border-emerald-800/40 text-xs text-neutral-300 flex items-start gap-2.5 my-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold text-emerald-400 block text-[11px] mb-0.5">
                          {msg.senderName}
                        </span>
                        <p className="text-neutral-300 leading-relaxed">{msg.text}</p>
                        <span className="text-[10px] text-neutral-500 mt-1 block">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="w-8 h-8 rounded-xl object-cover border border-emerald-700/60 shrink-0 mb-1"
                      />
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-md text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-neutral-950 font-medium rounded-br-none'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={`text-[10px] font-bold ${isUser ? 'text-neutral-950/80' : 'text-emerald-400'}`}>
                          {msg.senderName}
                        </span>
                        <span className={`text-[9px] ${isUser ? 'text-neutral-950/70 font-mono' : 'text-neutral-500 font-mono'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Starters / Icebreakers */}
        {session?.isUnlocked && (
          <div className="px-4 py-2 bg-neutral-950/80 border-t border-neutral-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 text-xs">
            <span className="text-[10px] font-mono uppercase text-neutral-500 shrink-0">Suggested:</span>
            {icebreakers.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(starter)}
                className="whitespace-nowrap px-3 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-emerald-300 text-[11px] transition-colors shrink-0"
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-neutral-900 border-t border-neutral-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                session?.isUnlocked
                  ? `Write a respectful message to ${profile.nickname || profile.fullName}...`
                  : 'Unlock chat pass ($3.00) to type a message...'
              }
              value={inputText}
              disabled={!session?.isUnlocked || isSending}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />

            {session?.isUnlocked ? (
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-neutral-950 font-bold transition-all disabled:opacity-50 shrink-0 shadow-md"
              >
                {isSending ? (
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenUnlockModal(profile)}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors shrink-0 shadow-md"
              >
                <Lock className="w-4 h-4" />
                <span>Pay $3.00</span>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
