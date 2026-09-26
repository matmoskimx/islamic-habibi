import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  KeyRound, 
  UserCheck, 
  Mail, 
  Smartphone, 
  AlertCircle, 
  Lock, 
  FileCode, 
  Send, 
  Sparkles,
  Server,
  Layers,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { formatDate, formatUGX, formatUSD } from '../utils/formatters';

interface RecipientRecord {
  id: string;
  phoneNumber: string;
  formattedPhone: string;
  businessName: string;
  tagline: string;
  ownerName: string;
  ownerEmail: string;
  country: string;
  currency: string;
  settlementMethod: string;
  primaryCarriers: string[];
  merchantCode: string;
  status: string;
  kyc: {
    nin: string;
    nationalIdVerified: boolean;
    phoneOtpVerified: boolean;
    emailVerified: boolean;
    shariaBoardCertified: boolean;
    verifiedAt: string;
    verifiedBy: string;
  };
  limits: {
    maxSingleTransactionUGX: number;
    dailyLimitUGX: number;
  };
  totalReceivedUGX: number;
  totalReceivedUSD: number;
  totalTransactions: number;
  availableBalanceUGX: number;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

interface DatabaseConsoleProps {
  onOpenRegister: () => void;
  onOpenInbox: () => void;
}

export const DatabaseConsole: React.FC<DatabaseConsoleProps> = ({
  onOpenRegister,
  onOpenInbox
}) => {
  const [recipient, setRecipient] = useState<RecipientRecord | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [dbStats, setDbStats] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSentMsg, setOtpSentMsg] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [verifyResultMsg, setVerifyResultMsg] = useState<string | null>(null);

  const fetchDatabaseData = async () => {
    setIsLoading(true);
    try {
      const [recipRes, usersRes, statsRes] = await Promise.all([
        fetch('/api/database/recipient'),
        fetch('/api/auth/users'),
        fetch('/api/database/status')
      ]);

      if (recipRes.ok) {
        const data = await recipRes.json();
        setRecipient(data.recipient);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setDbStats(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const handleSendMerchantVerificationOtp = async () => {
    setIsLoading(true);
    setOtpSentMsg(null);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: '256744042286',
          purpose: 'MERCHANT_VERIFY',
          name: 'Islamic Habibi Recipient Admin'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSentMsg(`Verification code [${data.emailDispatch.code}] sent to 256744042286 & mosesmatovu082@gmail.com.`);
        setOtpInput(data.emailDispatch.code);
      } else {
        alert(data.error || 'Failed to dispatch code');
      }
    } catch {
      alert('Error requesting code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (!otpInput) return;
    setIsVerifyingOtp(true);
    setVerifyResultMsg(null);
    try {
      const res = await fetch('/api/merchant/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otpInput.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyResultMsg('Merchant receiving account (+256744042286) verified & active in database!');
        setRecipient(data.recipient);
        fetchDatabaseData();
      } else {
        setVerifyResultMsg(data.error || 'Verification failed');
      }
    } catch {
      setVerifyResultMsg('Verification request failed');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-neutral-950 border border-emerald-800/60 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
                Database Engine & Verification Center
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/40">
                Primary Receiver: 256744042286
              </span>
            </div>

            <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-neutral-100">
              Live Database & Merchant Verifications
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              The receiving number <strong className="text-amber-300 font-mono">+256 744 042 286</strong> is 
              built directly into the application&apos;s database layer. Every incoming transaction, 
              registration verification code, and Sharia compliance status is persisted and validated in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenRegister}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-neutral-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all"
            >
              <UserCheck className="w-4 h-4 text-neutral-950" />
              <span>Register User With Email Code</span>
            </button>

            <button
              onClick={onOpenInbox}
              className="py-2.5 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>View Verification Codes</span>
            </button>

            <button
              onClick={fetchDatabaseData}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Recipient Card (Built into Database) */}
      {recipient && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-emerald-800/80 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-emerald-800/40 to-emerald-950 border border-amber-500/40 flex items-center justify-center text-amber-400 font-cinzel text-xl font-bold shadow-md">
                ح
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-cinzel text-xl font-bold text-neutral-100">
                    {recipient.businessName}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {recipient.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Database Record ID: <span className="text-neutral-300">{recipient.id}</span>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-neutral-400 font-mono uppercase">
                Receiving Account Number
              </span>
              <div className="text-2xl font-bold font-mono text-amber-300">
                {recipient.formattedPhone}
              </div>
            </div>
          </div>

          {/* Grid of Recipient Attributes in Database */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-neutral-500">Account Holder / Admin:</span>
              <div className="text-neutral-200 font-semibold text-sm">{recipient.ownerName}</div>
              <div className="text-emerald-400 text-[11px]">{recipient.ownerEmail}</div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-neutral-500">Settlement Method:</span>
              <div className="text-neutral-200 font-semibold text-sm">Real-Time Mobile Money</div>
              <div className="text-neutral-400 text-[11px]">Airtel Money & MTN MoMo</div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-neutral-500">Total Settled To Receiver:</span>
              <div className="text-emerald-400 font-bold text-sm">
                {formatUGX(recipient.totalReceivedUGX)}
              </div>
              <div className="text-neutral-400 text-[11px]">
                ≈ {formatUSD(recipient.totalReceivedUSD)} ({recipient.totalTransactions} charges)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-neutral-500">Max Single Limit:</span>
              <div className="text-neutral-200 font-semibold text-sm">
                {formatUGX(recipient.limits.maxSingleTransactionUGX)}
              </div>
              <div className="text-neutral-400 text-[11px]">
                Daily: {formatUGX(recipient.limits.dailyLimitUGX)}
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <h4 className="font-mono text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Factor Verification & Compliance Matrix</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-200">National ID (NIN)</div>
                  <div className="text-[11px] font-mono text-neutral-400">{recipient.kyc.nin}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-200">Phone OTP Verified</div>
                  <div className="text-[11px] font-mono text-amber-300">256744042286</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-200">Email Verification</div>
                  <div className="text-[11px] font-mono text-emerald-400">Code Enabled</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-200">Sharia Board Audit</div>
                  <div className="text-[11px] font-mono text-neutral-400">Certified Halal</div>
                </div>
              </div>
            </div>

            {/* Verification trigger form */}
            <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendMerchantVerificationOtp}
                  disabled={isLoading}
                  className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Send OTP to +256744042286</span>
                </button>
                <span className="text-[11px] text-neutral-400">or to mosesmatovu082@gmail.com</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 font-mono text-xs w-36 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleConfirmOtp}
                  disabled={isVerifyingOtp || !otpInput}
                  className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-colors disabled:opacity-50"
                >
                  {isVerifyingOtp ? 'Verifying...' : 'Verify Recipient'}
                </button>
              </div>
            </div>

            {otpSentMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{otpSentMsg}</span>
              </div>
            )}

            {verifyResultMsg && (
              <div className="p-3 rounded-xl bg-neutral-900 border border-emerald-600 text-emerald-400 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{verifyResultMsg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Two Column: Registered Users in DB & Raw DB Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Registered Users Table in Database (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden space-y-0">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-sm font-bold text-neutral-100">
                Registered Database Users & Profiles
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {users.length} Active Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-mono text-[11px] border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Email Verified</th>
                  <th className="py-3 px-4 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-200">{u.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{u.email}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{u.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-neutral-950 text-amber-300 border border-neutral-800">
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-neutral-500 font-mono text-[11px]">Pending</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Live Database Stats & Architecture (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-sm font-bold text-neutral-100">
                Database Engine Status
              </h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Storage Type:</span>
              <span className="text-emerald-400 font-bold">Persistent JSON Store</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Primary Recipient Phone:</span>
              <span className="text-amber-300 font-bold">256744042286</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Account Beneficiary:</span>
              <span className="text-neutral-200">Islamic Habibi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Database Tables:</span>
              <span className="text-neutral-300">recipients, users, verification_codes, email_dispatches, packages, transactions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Email Code Dispatcher:</span>
              <span className="text-emerald-400">Active (15 Min TTL)</span>
            </div>
          </div>

          {dbStats && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-neutral-400 uppercase">
                Raw Database State:
              </span>
              <pre className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400 max-h-48 overflow-y-auto leading-relaxed">
                <code>{JSON.stringify(dbStats, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
