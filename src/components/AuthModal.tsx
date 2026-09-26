import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Phone, 
  User, 
  Copy, 
  Check, 
  Inbox
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime } from '../utils/formatters';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string; email: string; phone: string; role: string }) => void;
  onOpenInbox: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenInbox
}) => {
  const [mode, setMode] = useState<'register' | 'verify_merchant'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+256 ');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'enter_details' | 'enter_code' | 'completed'>('enter_details');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dispatchedCodeNotice, setDispatchedCodeNotice] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const target = mode === 'register' ? email.trim() : '256744042286';
    const purpose = mode === 'register' ? 'REGISTRATION' : 'MERCHANT_VERIFY';

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!phone.trim() || phone.trim().length < 9) {
        setErrorMsg('Please enter a valid telephone number.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          purpose,
          name: mode === 'register' ? name : 'Islamic Habibi Merchant'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      setDispatchedCodeNotice(data.emailDispatch.code);
      setStep('enter_code');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending verification code.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code.trim() || code.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            code: code.trim()
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Verification failed.');
        }

        setStep('completed');
        playSuccessChime();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        onSuccess(data.user);
      } else {
        // Merchant verification
        const res = await fetch('/api/merchant/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code.trim()
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Merchant verification failed.');
        }

        setStep('completed');
        playSuccessChime();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification error.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyNoticeCode = () => {
    if (!dispatchedCodeNotice) return;
    navigator.clipboard.writeText(dispatchedCodeNotice);
    setCode(dispatchedCodeNotice);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleReset = () => {
    setStep('enter_details');
    setErrorMsg('');
    setDispatchedCodeNotice(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-emerald-800/60 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-cinzel text-base font-bold text-neutral-100">
              {mode === 'register' ? 'Register Client / Beneficiary' : 'Verify Merchant +256744042286'}
            </h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-neutral-800 text-xs font-medium bg-neutral-950/40">
          <button
            onClick={() => {
              setMode('register');
              setStep('enter_details');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center transition-all ${
              mode === 'register'
                ? 'text-emerald-400 border-b-2 border-emerald-500 font-bold bg-neutral-900'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            New User Registration
          </button>
          <button
            onClick={() => {
              setMode('verify_merchant');
              setStep('enter_details');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center transition-all ${
              mode === 'verify_merchant'
                ? 'text-emerald-400 border-b-2 border-emerald-500 font-bold bg-neutral-900'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Verify Merchant (256744042286)
          </button>
        </div>

        {/* STEP 1: ENTER DETAILS */}
        {step === 'enter_details' && (
          <form onSubmit={handleSendCode} className="p-6 space-y-4">
            {mode === 'register' ? (
              <>
                <p className="text-xs text-neutral-300">
                  Register your account with Islamic Habibi. We will send a secure 6-digit confirmation code 
                  to your email to verify and activate your profile in our database.
                </p>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Fatima Nalubega"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Email Address (Receives 6-Digit Code) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. mosesmatovu082@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Telephone Number (Mobile Money) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 701 234 567"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-emerald-900/60 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Database Recipient Phone:</span>
                    <span className="font-bold text-amber-300">+256 744 042 286</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Merchant Name:</span>
                    <span className="text-neutral-200">Islamic Habibi</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Merchant Officer Email:</span>
                    <span className="text-emerald-400">mosesmatovu082@gmail.com</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Storage Engine:</span>
                    <span className="text-neutral-300">Live JSON Database</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  Triggering merchant verification will send an authorization security code to the 
                  registered recipient email (<strong className="text-neutral-200">mosesmatovu082@gmail.com</strong>) 
                  and SMS gateway to verify and activate receiving privileges.
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Security Code...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send 6-Digit Email Verification Code</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: ENTER CODE */}
        {step === 'enter_code' && (
          <form onSubmit={handleVerifyAndSubmit} className="p-6 space-y-5">
            {/* Live Notification simulated banner showing code */}
            {dispatchedCodeNotice && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-neutral-950 to-neutral-950 border border-emerald-600/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email Code Dispatched to: {mode === 'register' ? email : 'mosesmatovu082@gmail.com'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNoticeCode}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700 hover:border-amber-400"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Auto-filled!' : 'Auto-Fill'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-extrabold tracking-widest text-amber-300">
                    {dispatchedCodeNotice}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Expires in 15 mins
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Enter 6-Digit Verification Code *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-lg font-mono tracking-widest text-center focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => setStep('enter_details')}
                className="hover:text-neutral-200 underline"
              >
                Change details / Resend
              </button>

              <button
                type="button"
                onClick={onOpenInbox}
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Open Virtual Inbox</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying in Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Code & Activate Profile</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: COMPLETED */}
        {step === 'completed' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="font-cinzel text-lg font-bold text-neutral-100">
              {mode === 'register' ? 'Registration Verified & Active!' : 'Merchant 256744042286 Verified!'}
            </h3>

            <p className="text-xs text-neutral-300 max-w-sm mx-auto">
              Your profile has been saved and verified in the Islamic Habibi database. 
              You can now book packages, receive invoices, and authorize direct charges.
            </p>

            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-colors"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
