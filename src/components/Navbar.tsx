import React from 'react';
import { 
  Sparkles, 
  MessageSquareHeart, 
  FileCheck2, 
  HeartHandshake, 
  PhoneCall, 
  CheckCircle2,
  DollarSign,
  Mail,
  UserCheck,
  Users,
  UserPlus
} from 'lucide-react';
import { MERCHANT_PROFILE } from '../data/packages';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: 'profiles' | 'chats' | 'packages' | 'verify';
  setActiveTab: (tab: 'profiles' | 'chats' | 'packages' | 'verify') => void;
  onOpenQuickCharge: () => void;
  onOpenRegister: () => void;
  onOpenInbox: () => void;
  onOpenRegisterProfile?: () => void;
  profilesCount?: number;
  unlockedChatsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickCharge,
  onOpenRegister,
  onOpenInbox,
  onOpenRegisterProfile,
  profilesCount = 8,
  unlockedChatsCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/40 bg-neutral-950/90 backdrop-blur-md">
      {/* Top Banner: Sacred Purpose Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900/70 to-neutral-950 text-xs py-1.5 px-4 border-b border-emerald-800/40 text-emerald-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">Islamic Habibi Zawaj & Nikah:</span>
            <span className="text-amber-300 font-medium">Helping Muslims Marry Muslims upon Quran & Sunnah</span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-600/40 font-mono">
              All Subscriptions in US Dollars ($ USD)
            </span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
            <button
              onClick={onOpenInbox}
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors font-mono"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Verification Inbox</span>
            </button>
            <span className="hidden sm:inline">·</span>
            <a 
              href={`https://wa.me/${MERCHANT_PROFILE.recipientPhone}`} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Wali Support: +256 744 042 286</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand without any PAY AI / PAY API */}
          <div 
            onClick={() => setActiveTab('profiles')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-emerald-800/40 to-emerald-950 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:border-amber-400 transition-all">
              <span className="text-lg sm:text-xl font-cinzel font-bold text-amber-400 drop-shadow">ح</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 border border-neutral-900 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-amber-200" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-lg sm:text-xl font-bold tracking-wide text-neutral-100 group-hover:text-amber-300 transition-colors">
                  ISLAMIC HABIBI
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 hidden sm:inline-block">
                  MATRIMONIAL & NIKAH
                </span>
              </div>
              <p className="text-[11px] font-amiri text-emerald-400 tracking-wide">
                حبيب الإسلام · تيسير زواج المسلمين على هدي الكتاب والسنة
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/60 p-1.5 rounded-xl border border-neutral-800/80">
            <button
              onClick={() => setActiveTab('profiles')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'profiles'
                  ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-600/50 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Browse Profiles</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                {profilesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'chats'
                  ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-600/50 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <MessageSquareHeart className="w-4 h-4 text-amber-400" />
              <span>Halal Chats</span>
              {unlockedChatsCount > 0 ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500 text-neutral-950 font-bold">
                  {unlockedChatsCount} Active
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Paid
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'packages'
                  ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-600/50 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>Zawaj Packages</span>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'verify'
                  ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-600/50 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              <span>Verify Status</span>
            </button>
          </nav>

          {/* Controls: USD Badge, Register & Subscribe CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* USD Currency Indicator */}
            <div className="flex items-center bg-neutral-900 border border-emerald-900/50 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-amber-300">
              <span>$ USD</span>
            </div>

            {/* Register Profile Quick Button */}
            {onOpenRegisterProfile && (
              <button
                onClick={onOpenRegisterProfile}
                className="hidden sm:inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-200 hover:text-white font-semibold text-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Join / Register</span>
              </button>
            )}

            {/* Registration with Email Code button */}
            <button
              onClick={onOpenRegister}
              className="hidden md:inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-300 hover:text-emerald-300 font-semibold text-xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify</span>
            </button>

            {/* PWA Install App Button */}
            <PWAInstallButton />

            {/* Quick Subscribe / Charge CTA */}
            <button
              onClick={onOpenQuickCharge}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 text-neutral-950 font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <DollarSign className="w-4 h-4 text-neutral-950" />
              <span>Subscribe Now</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-neutral-800/60 overflow-x-auto text-[11px] gap-1">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md shrink-0 ${
              activeTab === 'profiles' ? 'text-amber-400 bg-neutral-800 font-semibold' : 'text-neutral-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Profiles ({profilesCount})
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md shrink-0 ${
              activeTab === 'chats' ? 'text-amber-400 bg-neutral-800 font-semibold' : 'text-neutral-400'
            }`}
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-amber-400" />
            Chats {unlockedChatsCount > 0 ? `(${unlockedChatsCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md shrink-0 ${
              activeTab === 'packages' ? 'text-amber-400 bg-neutral-800 font-semibold' : 'text-neutral-400'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            Zawaj Plans
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md shrink-0 ${
              activeTab === 'verify' ? 'text-amber-400 bg-neutral-800 font-semibold' : 'text-neutral-400'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Verify
          </button>
          {onOpenRegisterProfile && (
            <button
              onClick={onOpenRegisterProfile}
              className="flex items-center gap-1 py-1 px-2 rounded-md text-emerald-400 shrink-0 font-medium"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Join
            </button>
          )}
          <button
            onClick={onOpenRegister}
            className="flex items-center gap-1 py-1 px-2 rounded-md text-neutral-300 shrink-0"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Verify
          </button>
          <button
            onClick={onOpenInbox}
            className="flex items-center gap-1 py-1 px-2 rounded-md text-amber-300 shrink-0"
          >
            <Mail className="w-3.5 h-3.5" />
            Inbox
          </button>
        </div>
      </div>
    </header>
  );
};
