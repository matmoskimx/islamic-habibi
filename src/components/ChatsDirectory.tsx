import React, { useState } from 'react';
import { 
  MessageSquareHeart, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  Search, 
  ArrowRight,
  Clock,
  Heart,
  DollarSign
} from 'lucide-react';
import { MatrimonialProfile, ChatSession } from '../types';
import { formatUSD } from '../utils/formatters';

interface ChatsDirectoryProps {
  profiles: MatrimonialProfile[];
  chats: ChatSession[];
  onOpenChat: (profile: MatrimonialProfile) => void;
  onOpenUnlockModal: (profile: MatrimonialProfile) => void;
  onBrowseProfiles: () => void;
}

export const ChatsDirectory: React.FC<ChatsDirectoryProps> = ({
  profiles,
  chats,
  onOpenChat,
  onOpenUnlockModal,
  onBrowseProfiles
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [search, setSearch] = useState('');

  const unlockedCount = chats.filter((c) => c.isUnlocked).length;

  const combinedList = profiles.map((prof) => {
    const chat = chats.find((c) => c.candidateId === prof.id);
    return {
      profile: prof,
      chat,
      isUnlocked: !!chat?.isUnlocked,
      lastMessage: chat?.lastMessageText || 'Chat ready to be unlocked for halal direct messaging.',
      lastTime: chat?.lastMessageTime
    };
  });

  const filtered = combinedList.filter((item) => {
    if (filter === 'unlocked' && !item.isUnlocked) return false;
    if (filter === 'locked' && item.isUnlocked) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.profile.fullName.toLowerCase().includes(q) ||
        item.profile.city.toLowerCase().includes(q) ||
        item.profile.profession.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-900/60 bg-gradient-to-r from-emerald-950 via-neutral-900 to-neutral-950 p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-600/50 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Wali Supervised · Halal Direct Messaging</span>
          </div>

          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-neutral-100 tracking-tight">
            Halal Candidate Chats
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            To safeguard our brothers and sisters and eliminate casual dating or time-wasters, direct communication is a paid service. 
            All chats are conducted under Quranic adab, with designated Walis notified of introductory exchanges.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-emerald-300">{unlockedCount}</span>
              <span>Active Unlocked Chats</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>30-Day Chat Pass: $3.00 USD</span>
            </div>

            <button
              onClick={onBrowseProfiles}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-colors ml-auto"
            >
              <span>Browse All Profiles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900/80 p-3 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-emerald-600 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Candidates ({combinedList.length})
          </button>

          <button
            onClick={() => setFilter('unlocked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'unlocked'
                ? 'bg-emerald-600 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Unlocked ({unlockedCount})</span>
          </button>

          <button
            onClick={() => setFilter('locked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'locked'
                ? 'bg-emerald-600 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Locked ({combinedList.length - unlockedCount})</span>
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, city, or profession..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Chats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(({ profile, chat, isUnlocked, lastMessage, lastTime }) => (
          <div
            key={profile.id}
            className={`group rounded-2xl border p-5 transition-all flex flex-col justify-between ${
              isUnlocked
                ? 'bg-neutral-900/90 border-emerald-700/60 shadow-lg hover:border-emerald-500'
                : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div>
              {/* Top Row */}
              <div className="flex items-start gap-3.5 mb-3">
                <div className="relative shrink-0">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-neutral-800 group-hover:scale-105 transition-transform"
                  />
                  {isUnlocked && (
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 border border-neutral-950 shadow-sm">
                      <Unlock className="w-2.5 h-2.5 text-neutral-950" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-sm text-neutral-100 truncate">
                      {profile.fullName}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isUnlocked
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-neutral-800 text-amber-300 border border-neutral-700'
                    }`}>
                      {isUnlocked ? 'Unlocked' : 'Paid Chat'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {profile.profession} · {profile.city}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 mt-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    <span className="truncate">Wali: {profile.waliRelation || 'Father'} {profile.waliName ? `(${profile.waliName})` : ''}</span>
                  </div>
                </div>
              </div>

              {/* Last Message Snippet */}
              <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 mb-4">
                <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                  {isUnlocked ? 'Conversation Preview:' : 'Introduction Teaser:'}
                </span>
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed italic">
                  "{lastMessage}"
                </p>
                {lastTime && (
                  <span className="text-[9px] font-mono text-neutral-500 block mt-1.5">
                    Updated {new Date(lastTime).toLocaleDateString()} · {new Date(lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-neutral-400">
                {isUnlocked ? '30-Day Active Pass' : '$3.00 USD Unlock'}
              </span>

              {isUnlocked ? (
                <button
                  onClick={() => onOpenChat(profile)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-neutral-950 font-bold text-xs shadow-md transition-all hover:scale-105"
                >
                  <MessageSquareHeart className="w-4 h-4 text-neutral-950" />
                  <span>Open Chat</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenUnlockModal(profile)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all hover:scale-105"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Unlock Chat</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Why Chat Is Paid (Sharia Assurance FAQ) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-cinzel text-base sm:text-lg font-bold text-neutral-100">
            Why Does Islamic Habibi Charge for Direct Messaging?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <span className="font-bold text-amber-300 block">1. Sincerity & Serious Marriage Intentions</span>
            <p className="text-neutral-400 leading-relaxed">
              Casual dating apps create frivolity. A nominal paid pass ($3.00) ensures suitors are serious Muslims ready for Nikah and respect our candidates' time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <span className="font-bold text-emerald-300 block">2. Wali & Chaperone Supervision</span>
            <p className="text-neutral-400 leading-relaxed">
              Every unlocked conversation automatically notifies the candidate's designated Wali. We facilitate Islamic introductions with dignity, modesty, and family approval.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <span className="font-bold text-teal-300 block">3. Safety & Zero Harassment Guarantee</span>
            <p className="text-neutral-400 leading-relaxed">
              Payment verification authenticates suitors and enables immediate banning of anyone breaching Islamic adab, ensuring a sanctuary for practicing Muslim women and men.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
