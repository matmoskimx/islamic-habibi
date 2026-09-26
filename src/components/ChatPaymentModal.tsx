import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  MessageSquareHeart, 
  Lock, 
  CheckCircle2, 
  DollarSign, 
  Smartphone, 
  CreditCard, 
  Users, 
  Sparkles,
  AlertCircle,
  Clock,
  Heart
} from 'lucide-react';
import { MatrimonialProfile, PaymentMethod, Transaction } from '../types';
import { formatUSD } from '../utils/formatters';

interface ChatPaymentModalProps {
  profile: MatrimonialProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onChatUnlocked: (candidateId: string, transaction: Transaction) => void;
  onOpenPackages: () => void;
}

export const ChatPaymentModal: React.FC<ChatPaymentModalProps> = ({
  profile,
  isOpen,
  onClose,
  onChatUnlocked,
  onOpenPackages
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'single_chat' | 'starter_pass' | 'gold_pass'>('single_chat');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !profile) return null;

  const planOptions = [
    {
      id: 'single_chat' as const,
      title: `30-Day Chat Pass with ${profile.nickname || profile.fullName}`,
      priceUSD: 3,
      priceUGX: 11250,
      description: 'Dedicated 1-on-1 supervised messaging with this candidate.',
      badge: 'Most Popular'
    },
    {
      id: 'starter_pass' as const,
      title: 'Zawaj Starter Pass (5 Candidate Chats)',
      priceUSD: 19,
      priceUGX: 71250,
      description: 'Unlock direct chats with 5 verified candidates of your choice.',
      badge: 'Best Value'
    },
    {
      id: 'gold_pass' as const,
      title: 'Nikah Gold Pass (15 Candidate Chats)',
      priceUSD: 49,
      priceUGX: 183750,
      description: 'Unlock 15 candidate chats + direct Wali matchmaking support.',
      badge: 'Comprehensive'
    }
  ];

  const currentPlan = planOptions.find((p) => p.id === selectedPlan) || planOptions[0];

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your full name and mobile contact number.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/chats/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: profile.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          paymentMethod,
          planType: selectedPlan,
          amountUSD: currentPlan.priceUSD
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to unlock chat pass.');
      }

      onChatUnlocked(profile.id, data.transaction);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during payment processing.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-neutral-900 to-amber-950/70 p-5 sm:p-6 border-b border-emerald-900/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold font-mono">
                Sharia Guarded · Paid Chat Access
              </span>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-neutral-100">
                Unlock Halal Direct Chat
              </h3>
            </div>
          </div>

          <p className="text-xs text-neutral-300">
            To maintain serious matrimonial intentions and protect our candidates from time-wasters, direct messaging is a paid feature supervised under Islamic etiquette.
          </p>
        </div>

        {/* Candidate Summary Card */}
        <div className="p-4 sm:p-5 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center gap-3.5">
          <img
            src={profile.avatarUrl}
            alt={profile.fullName}
            className="w-14 h-14 rounded-2xl object-cover border border-emerald-700/60 shadow-md shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-neutral-100 truncate">
                {profile.fullName}
              </h4>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                {profile.age} yrs
              </span>
            </div>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {profile.profession} · {profile.city}, {profile.country}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-amber-300">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Wali: {profile.waliName || 'Guardian'} ({profile.waliRelation || 'Father'})</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUnlockSubmit} className="p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Plan Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              1. Select Chat Pass Option:
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {planOptions.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                        : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-neutral-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-100">{plan.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
                            {plan.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{plan.description}</p>
                      </div>
                    </div>

                    <div className="text-right pl-3 shrink-0">
                      <div className="font-bold text-sm text-emerald-400 font-mono">
                        {formatUSD(plan.priceUSD)}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        ~{plan.priceUGX.toLocaleString()} UGX
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              2. Select Payment Channel:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('mtn_momo')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'mtn_momo'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">MTN MoMo</span>
                <span className="text-[10px] font-mono text-neutral-500">*165#</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('airtel_money')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'airtel_money'
                    ? 'bg-red-950/60 border-red-500 text-red-200 shadow-md ring-1 ring-red-500/50'
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold">Airtel Money</span>
                <span className="text-[10px] font-mono text-neutral-500">*185#</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'bg-teal-950/60 border-teal-500 text-teal-200 shadow-md ring-1 ring-teal-500/50'
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold">Visa / Master</span>
                <span className="text-[10px] font-mono text-neutral-500">Instant</span>
              </button>
            </div>
          </div>

          {/* Customer Inputs */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              3. Your Details (For Wali & Receipt):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Your Full Name (Suitor)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brother Yusuf Kigozi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Mobile Money / Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0772 123 456 or +256..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Email Address (Optional for Receipt)</label>
              <input
                type="email"
                placeholder="suitor@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Sharia Oversight & Merchant Transparency */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-[11px] space-y-1.5 text-neutral-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Halal Matrimonial Guarantee</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Charges are processed to official Islamic Habibi merchant (+256 744 042 286). 
              Both parties' designated Walis are notified to maintain honor, decency, and serious progress toward Nikah.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPackages();
              }}
              className="text-xs text-amber-300 hover:text-amber-200 underline underline-offset-4"
            >
              Or browse all Matrimonial Packages
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 text-neutral-950 font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <MessageSquareHeart className="w-4 h-4 text-neutral-950" />
                  <span>Pay {formatUSD(currentPlan.priceUSD)} & Unlock Chat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
