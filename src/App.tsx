import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  HeartHandshake, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Filter, 
  DollarSign, 
  Users, 
  Scroll, 
  Crown, 
  Compass, 
  FileCheck2, 
  ShieldCheck, 
  Mail, 
  UserCheck,
  UserPlus,
  MessageSquareHeart,
  Lock
} from 'lucide-react';
import { ServicePackage, Transaction, MatrimonialProfile, ChatSession } from './types';
import { INITIAL_PACKAGES, MERCHANT_PROFILE } from './data/packages';
import { INITIAL_PROFILES } from './data/profiles';
import { Navbar } from './components/Navbar';
import { PackageCard } from './components/PackageCard';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ReceiptTracker } from './components/ReceiptTracker';
import { AuthModal } from './components/AuthModal';
import { EmailInboxDrawer } from './components/EmailInboxDrawer';
import { ProfilesDirectory } from './components/ProfilesDirectory';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { RegisterProfileModal } from './components/RegisterProfileModal';
import { ChatsDirectory } from './components/ChatsDirectory';
import { HalalChatModal } from './components/HalalChatModal';
import { ChatPaymentModal } from './components/ChatPaymentModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { formatUSD } from './utils/formatters';

export default function App() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'chats' | 'packages' | 'verify'>('profiles');
  const [packages, setPackages] = useState<ServicePackage[]>(INITIAL_PACKAGES);
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>(INITIAL_PROFILES);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(['prof-sister-aisha', 'prof-brother-dr-zayd']);
  
  // Profile detail & creation modals
  const [selectedProfile, setSelectedProfile] = useState<MatrimonialProfile | null>(null);
  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  const [isRegisterProfileOpen, setIsRegisterProfileOpen] = useState(false);

  // Chat & Paid Unlock modals
  const [chatTargetProfile, setChatTargetProfile] = useState<MatrimonialProfile | null>(null);
  const [isHalalChatOpen, setIsHalalChatOpen] = useState(false);
  const [isChatPaymentOpen, setIsChatPaymentOpen] = useState(false);

  // Checkout & Receipt Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPackageForCheckout, setSelectedPackageForCheckout] = useState<ServicePackage | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Auth & Email Inbox state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [pkgRes, txnRes, profRes, chatRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/transactions'),
        fetch('/api/profiles'),
        fetch('/api/chats')
      ]);

      if (pkgRes.ok) {
        const pkgs = await pkgRes.json();
        if (Array.isArray(pkgs) && pkgs.length > 0) {
          setPackages(pkgs);
        }
      }

      if (txnRes.ok) {
        const txnData = await txnRes.json();
        if (txnData.transactions && Array.isArray(txnData.transactions)) {
          setTransactions(txnData.transactions);
        }
      }

      if (profRes.ok) {
        const profData = await profRes.json();
        if (profData.profiles && Array.isArray(profData.profiles) && profData.profiles.length > 0) {
          setProfiles(profData.profiles);
        }
      }

      if (chatRes.ok) {
        const chatData = await chatRes.json();
        if (chatData.chats && Array.isArray(chatData.chats)) {
          setChats(chatData.chats);
        }
      }
    } catch {
      setPackages(INITIAL_PACKAGES);
      setProfiles(INITIAL_PROFILES);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unlockedChatIds = chats.filter((c) => c.isUnlocked).map((c) => c.candidateId);

  const handleOpenCheckout = (pkg: ServicePackage) => {
    setSelectedPackageForCheckout(pkg);
    setIsCheckoutOpen(true);
  };

  const handleOpenQuickCharge = () => {
    setSelectedPackageForCheckout(null);
    setIsCheckoutOpen(true);
  };

  const handleSuccessfulCharge = (txn: Transaction) => {
    setTransactions((prev) => [txn, ...prev]);
    setSelectedReceipt(txn);
    setIsReceiptOpen(true);
    fetchData();
  };

  const handleViewProfileDetails = (profile: MatrimonialProfile) => {
    setSelectedProfile(profile);
    setIsProfileDetailOpen(true);
  };

  const handleExpressInterest = (profile: MatrimonialProfile) => {
    setSelectedProfile(profile);
    setIsProfileDetailOpen(true);
  };

  // Start Chat: Check if candidate is unlocked
  const handleStartChat = (profile: MatrimonialProfile) => {
    setChatTargetProfile(profile);
    const isUnlocked = unlockedChatIds.includes(profile.id);
    if (isUnlocked) {
      setIsHalalChatOpen(true);
    } else {
      setIsChatPaymentOpen(true);
    }
  };

  const handleChatUnlocked = (candidateId: string, txn: Transaction) => {
    // Update local state
    setChats((prev) => 
      prev.map((c) => c.candidateId === candidateId ? { ...c, isUnlocked: true } : c)
    );
    setTransactions((prev) => [txn, ...prev]);
    setSelectedReceipt(txn);
    setIsReceiptOpen(true);

    // Open chat room immediately
    const prof = profiles.find((p) => p.id === candidateId) || chatTargetProfile;
    if (prof) {
      setChatTargetProfile(prof);
      setIsHalalChatOpen(true);
    }
    fetchData();
  };

  const handleToggleFavorite = async (profileId: string) => {
    setFavorites((prev) => 
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId]
    );

    try {
      await fetch(`/api/profiles/${profileId}/favorite`, { method: 'POST' });
    } catch {
      // Ignore background favorite failure
    }
  };

  const handleProfileCreated = (newProfile: MatrimonialProfile) => {
    setProfiles((prev) => [newProfile, ...prev]);
    setSelectedProfile(newProfile);
    fetchData();
  };

  const filteredPackages = packages.filter((pkg) => {
    if (selectedCategory === 'all') return true;
    return pkg.category === selectedCategory;
  });

  const categories = [
    { id: 'all', label: 'All Matrimonial Plans', icon: Layers },
    { id: 'singles_search', label: 'Matchmaking Memberships', icon: HeartHandshake },
    { id: 'wali_assisted', label: 'Wali & Family Assisted', icon: Users },
    { id: 'nikah_contract', label: 'Nikah Solemnization', icon: Scroll },
    { id: 'premarital_counseling', label: 'Pre-Marital Harmony', icon: Compass },
    { id: 'vip_concierge', label: 'VIP Spousal Patron', icon: Crown }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickCharge={handleOpenQuickCharge}
        onOpenRegister={() => setIsAuthModalOpen(true)}
        onOpenInbox={() => setIsInboxOpen(true)}
        onOpenRegisterProfile={() => setIsRegisterProfileOpen(true)}
        profilesCount={profiles.length}
        unlockedChatsCount={unlockedChatIds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* TAB 1: PUBLIC REGISTERED PROFILES (DIRECT ACCESS WITH CANDIDATE PHOTOS & PAID CHAT) */}
        {activeTab === 'profiles' && (
          <ProfilesDirectory
            profiles={profiles}
            onViewDetails={handleViewProfileDetails}
            onExpressInterest={handleExpressInterest}
            onOpenRegisterProfile={() => setIsRegisterProfileOpen(true)}
            onOpenSubscribe={() => setActiveTab('packages')}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            onStartChat={handleStartChat}
            unlockedChatIds={unlockedChatIds}
          />
        )}

        {/* TAB 2: HALAL CHATS DIRECTORY (PAID MESSAGING & CONVERSATIONS) */}
        {activeTab === 'chats' && (
          <ChatsDirectory
            profiles={profiles}
            chats={chats}
            onOpenChat={(prof) => {
              setChatTargetProfile(prof);
              setIsHalalChatOpen(true);
            }}
            onOpenUnlockModal={(prof) => {
              setChatTargetProfile(prof);
              setIsChatPaymentOpen(true);
            }}
            onBrowseProfiles={() => setActiveTab('profiles')}
          />
        )}

        {/* TAB 3: ALL MATRIMONIAL PACKAGES */}
        {activeTab === 'packages' && (
          <div className="space-y-12">
            {/* Hero Section: Helping Muslims Marry Muslims */}
            <div className="relative rounded-3xl overflow-hidden border border-emerald-900/60 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-medium">
                  <HeartHandshake className="w-4 h-4 text-emerald-400" />
                  <span>Helping Muslims Marry Muslims upon Quran & Sunnah</span>
                </div>

                <div className="space-y-2">
                  <p className="font-amiri text-xl sm:text-2xl text-amber-300/90 tracking-wide" dir="rtl">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ · حبيب الإسلام للزواج المبارك
                  </p>
                  <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-neutral-100 tracking-tight leading-tight">
                    Halal Muslim Matrimonial & Sacred Nikah Subscriptions
                  </h1>
                </div>

                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
                  Connect with practicing Muslim brothers and sisters ready for marriage. We facilitate verified 
                  Halal introductions, direct Wali-to-Wali communication, pre-marital scholar consultations, and official 
                  Sharia Nikah contract solemnization. All subscriptions billed transparently in <strong>US Dollars ($ USD)</strong>.
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-950/60 px-3 py-1.5 rounded-xl border border-neutral-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Wali Contact Required for Sisters</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-950/60 px-3 py-1.5 rounded-xl border border-neutral-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Identity & Religious Background Vetted</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-950/60 px-3 py-1.5 rounded-xl border border-neutral-800">
                    <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                    <span>Subscriptions in US Dollars ($ USD)</span>
                  </div>
                </div>

                {/* Hero CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={() => setActiveTab('profiles')}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 text-neutral-950 font-bold text-sm shadow-xl shadow-emerald-950 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Browse Public Profiles ({profiles.length})</span>
                    <ArrowRight className="w-4 h-4 text-neutral-950" />
                  </button>

                  <button
                    onClick={() => setActiveTab('chats')}
                    className="py-3 px-5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 text-amber-300 border border-amber-500/40 font-semibold text-xs flex items-center gap-2 transition-colors"
                  >
                    <MessageSquareHeart className="w-4 h-4 text-amber-400" />
                    <span>Candidate Halal Chats</span>
                  </button>

                  <button
                    onClick={() => setIsRegisterProfileOpen(true)}
                    className="py-3 px-5 rounded-xl bg-neutral-850 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 font-semibold text-xs flex items-center gap-2 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>Register Your Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-cinzel text-lg sm:text-xl font-bold text-neutral-100">
                    Matrimonial Subscription Packages
                  </h2>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  {filteredPackages.length} Subscription Tiers
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-neutral-950 font-bold shadow-md shadow-emerald-950'
                          : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Packages Grid in USD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onSelect={handleOpenCheckout}
                />
              ))}
            </div>

            {/* Sacred Ayah / Matrimonial Ethos Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-center max-w-4xl mx-auto">
              <p className="font-amiri text-lg sm:text-xl text-amber-300/90 leading-relaxed" dir="rtl">
                &ldquo;وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 italic max-w-2xl mx-auto">
                &ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.&rdquo; [Surah Ar-Rum 30:21]
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400">
                <span>Verified Matchmaking</span>
                <span>·</span>
                <span>Modest Chaperoned Meetings</span>
                <span>·</span>
                <span>Certified Sharia Nikah Officiation</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RECEIPT TRACKER & VERIFIER */}
        {activeTab === 'verify' && (
          <ReceiptTracker
            onSelectReceipt={(txn) => {
              setSelectedReceipt(txn);
              setIsReceiptOpen(true);
            }}
          />
        )}
      </main>

      {/* Candidate Profile Detail Modal */}
      <ProfileDetailModal
        profile={selectedProfile}
        isOpen={isProfileDetailOpen}
        onClose={() => setIsProfileDetailOpen(false)}
        onExpressInterest={handleExpressInterest}
        onOpenSubscribe={() => {
          setIsProfileDetailOpen(false);
          setActiveTab('packages');
        }}
        onToggleFavorite={handleToggleFavorite}
        isFavorited={selectedProfile ? favorites.includes(selectedProfile.id) : false}
        onStartChat={handleStartChat}
        isChatUnlocked={selectedProfile ? unlockedChatIds.includes(selectedProfile.id) : false}
      />

      {/* Register Candidate Profile Modal */}
      <RegisterProfileModal
        isOpen={isRegisterProfileOpen}
        onClose={() => setIsRegisterProfileOpen(false)}
        onProfileCreated={handleProfileCreated}
      />

      {/* Halal Chat Room Modal */}
      <HalalChatModal
        profile={chatTargetProfile}
        isOpen={isHalalChatOpen}
        onClose={() => setIsHalalChatOpen(false)}
        onOpenUnlockModal={(prof) => {
          setIsHalalChatOpen(false);
          setChatTargetProfile(prof);
          setIsChatPaymentOpen(true);
        }}
      />

      {/* Paid Chat Unlock Payment Modal */}
      <ChatPaymentModal
        profile={chatTargetProfile}
        isOpen={isChatPaymentOpen}
        onClose={() => setIsChatPaymentOpen(false)}
        onChatUnlocked={handleChatUnlocked}
        onOpenPackages={() => setActiveTab('packages')}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPackage={selectedPackageForCheckout}
        onSuccess={handleSuccessfulCharge}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={selectedReceipt}
      />

      {/* User Registration & Email Verification Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
        onOpenInbox={() => {
          setIsAuthModalOpen(false);
          setIsInboxOpen(true);
        }}
      />

      {/* Virtual Email Inbox Drawer */}
      <EmailInboxDrawer
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        onSelectCode={() => {
          setIsInboxOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* PWA In-App Install Banner */}
      <PWAInstallBanner />

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 text-neutral-400 py-10 px-4 sm:px-6 lg:px-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-cinzel text-base font-bold text-neutral-200">
                ISLAMIC HABIBI MATRIMONIAL
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ALL CHARGES IN $ USD
              </span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Dedicated to Helping Muslims Marry Muslims upon Quran & Sunnah
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono">
            <span>Billing: <strong className="text-amber-300">US Dollars ($ USD)</strong></span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('chats')}
              className="text-amber-300 hover:underline"
            >
              Candidate Chats (Paid)
            </button>
            <span>·</span>
            <button
              onClick={() => setIsInboxOpen(true)}
              className="text-neutral-300 hover:underline"
            >
              Email Inbox
            </button>
            <span>·</span>
            <a 
              href={`https://wa.me/${MERCHANT_PROFILE.recipientPhone}`} 
              target="_blank" 
              rel="noreferrer" 
              className="text-emerald-400 hover:underline"
            >
              Wali WhatsApp Line
            </a>
          </div>

          <div className="text-center md:text-right text-[11px] text-neutral-400">
            © {new Date().getFullYear()} Islamic Habibi Matrimonial. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
