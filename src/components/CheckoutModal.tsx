import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  CreditCard, 
  Building2, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Lock,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ServicePackage, Transaction, PaymentMethod } from '../types';
import { MERCHANT_PROFILE } from '../data/packages';
import { formatUSD, formatUGX, playSuccessChime } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: ServicePackage | null;
  onSuccess: (transaction: Transaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  onSuccess
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+256 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('airtel_money');
  const [notes, setNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [customAmountUSD, setCustomAmountUSD] = useState<string>('39');

  const [step, setStep] = useState<'form' | 'ussd_push' | 'confirmed'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingTxn, setPendingTxn] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const currentPriceUSD = selectedPackage ? selectedPackage.priceUSD : Number(customAmountUSD) || 39;
  const currentPriceUGX = Math.round(currentPriceUSD * 3750);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name (or Wali name).');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      setErrorMessage('Please enter a valid telephone number for mobile money or confirmation.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage ? selectedPackage.id : undefined,
          customPackageTitle: selectedPackage ? selectedPackage.title : 'Custom Muslim Matrimonial Subscription',
          amount: currentPriceUSD,
          currency: 'USD',
          customerName,
          customerPhone,
          customerEmail,
          paymentMethod,
          notes,
          preferredDate,
          channel: 'PORTAL'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process matrimonial subscription.');
      }

      setPendingTxn(data.transaction);
      setStep('ussd_push');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during payment processing.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateUssdPinApproval = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('confirmed');
      playSuccessChime();

      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#047857', '#fbbf24']
      });

      if (pendingTxn) {
        onSuccess(pendingTxn);
      }
    }, 1200);
  };

  const handleResetAndClose = () => {
    setStep('form');
    setErrorMessage('');
    setPendingTxn(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-emerald-900/60 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-cinzel text-lg font-bold text-neutral-100">
                {step === 'ussd_push' ? 'Authorize Payment' : 'Muslim Matrimonial Subscription Checkout'}
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Official merchant billing in US Dollars ($ USD)
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Package Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-neutral-950 to-neutral-950 border border-emerald-800/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono uppercase text-amber-400 font-semibold">
                    {selectedPackage ? `${selectedPackage.code} · ${selectedPackage.billingType}` : 'CUSTOM SUBSCRIPTION'}
                  </span>
                  <h4 className="font-bold text-neutral-100 text-sm sm:text-base">
                    {selectedPackage ? selectedPackage.title : 'Custom Matrimonial Package'}
                  </h4>
                  {selectedPackage && (
                    <p className="text-xs text-emerald-400 font-amiri mt-0.5" dir="rtl">
                      {selectedPackage.arabicTitle}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-extrabold text-amber-400">
                    {formatUSD(currentPriceUSD)}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    ≈ {formatUGX(currentPriceUGX)}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Amount if no package selected */}
            {!selectedPackage && (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Subscription Amount ($ USD)
                </label>
                <input
                  type="number"
                  value={customAmountUSD}
                  onChange={(e) => setCustomAmountUSD(e.target.value)}
                  placeholder="e.g. 39"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-sm font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            )}

            {/* Client / Wali Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Your Full Name (or Wali Name) *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tariq Mukasa or Al-Hajj Adam"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Mobile Number (Receives MoMo Prompt) *
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+256 701 234 567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Email Address (For Verified Receipt & Matches)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Preferred Consultation / Nikah Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('airtel_money')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'airtel_money'
                      ? 'bg-red-950/40 border-red-500 text-red-200'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mb-2 text-red-400" />
                  <span className="text-xs font-bold leading-tight">Airtel Money</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">*185# Push</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('mtn_momo')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'mtn_momo'
                      ? 'bg-yellow-950/40 border-yellow-500 text-yellow-200'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mb-2 text-yellow-400" />
                  <span className="text-xs font-bold leading-tight">MTN MoMo</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">*165# Push</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-2 text-emerald-400" />
                  <span className="text-xs font-bold leading-tight">Card (Visa/MC)</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">International</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-blue-950/40 border-blue-500 text-blue-200'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-2 text-blue-400" />
                  <span className="text-xs font-bold leading-tight">Bank Wire</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">Direct EFT</span>
                </button>
              </div>
            </div>

            {/* Notes / Matrimonial Details */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Spouse Criteria, Wali Involvement, or Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share your age, location, religious practice, preferred qualities in a spouse, or Nikah contract requirements..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 p-3 rounded-xl border border-rose-800/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initiating Payment Prompt...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    Authorize & Subscribe ({formatUSD(currentPriceUSD)})
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: USSD PUSH CONFIRMATION SIMULATOR */}
        {step === 'ussd_push' && pendingTxn && (
          <div className="p-6 space-y-6">
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/60 mb-3 shadow-lg">
                <Smartphone className="w-8 h-8 text-emerald-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
                </span>
              </div>

              <h3 className="text-lg font-bold text-neutral-100">
                Payment Prompt Sent to Your Mobile
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                Authorization requested for <strong className="text-amber-300 font-mono">{formatUSD(pendingTxn.amountUSD)}</strong>{' '}
                (UGX {pendingTxn.amountUGX.toLocaleString()}) to merchant recipient <strong>+256 744 042 286</strong>.
              </p>
            </div>

            {/* Simulated Phone Screen */}
            <div className="max-w-sm mx-auto p-4 rounded-2xl bg-black border-2 border-neutral-700 shadow-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[10px] text-neutral-500 pb-2 border-b border-neutral-800">
                <span>SIM 1 · Mobile Money Push</span>
                <span>AUTHORIZED</span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 space-y-2">
                <p className="text-amber-400 font-bold">
                  Approve {formatUSD(pendingTxn.amountUSD)} (UGX {pendingTxn.amountUGX.toLocaleString()}) for Islamic Habibi Matrimonial?
                </p>
                <div className="text-[11px] text-neutral-400 space-y-1">
                  <div>Merchant: <strong className="text-neutral-200">Islamic Habibi</strong></div>
                  <div>Recipient: <strong className="text-amber-300">256744042286</strong></div>
                  <div>Ref: <span className="text-emerald-400">{pendingTxn.reference}</span></div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSimulateUssdPinApproval}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Confirming Mobile PIN...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Enter Mobile PIN & Confirm Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMED */}
        {step === 'confirmed' && pendingTxn && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto shadow-xl">
              <HeartHandshake className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <h3 className="font-cinzel text-xl font-bold text-neutral-100">
                Matrimonial Subscription Activated!
              </h3>
              <p className="text-xs text-emerald-400 font-amiri text-base mt-1" dir="rtl">
                بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
              </p>
              <p className="text-xs text-neutral-300 mt-2 max-w-sm mx-auto">
                Your payment of <strong className="text-amber-300">{formatUSD(pendingTxn.amountUSD)}</strong> has been settled to Islamic Habibi. 
                Our matrimonial team has received your registration.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left text-xs font-mono space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-neutral-500">Reference:</span>
                <span className="text-amber-400 font-bold">{pendingTxn.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Package:</span>
                <span className="text-neutral-200">{pendingTxn.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Amount Settled:</span>
                <span className="text-emerald-400 font-bold">{formatUSD(pendingTxn.amountUSD)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs shadow-md transition-colors"
            >
              Done & View Official Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
