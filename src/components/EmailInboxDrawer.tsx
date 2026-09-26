import React, { useState, useEffect } from 'react';
import { 
  X, 
  Inbox, 
  Mail, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  KeyRound, 
  Trash2 
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface EmailItem {
  id: string;
  to: string;
  subject: string;
  code: string;
  purpose: string;
  bodyText: string;
  sentAt: string;
  status: 'DELIVERED';
}

interface EmailInboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCode?: (code: string) => void;
}

export const EmailInboxDrawer: React.FC<EmailInboxDrawerProps> = ({
  isOpen,
  onClose,
  onSelectCode
}) => {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInbox = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/inbox');
      if (res.ok) {
        const data = await res.json();
        setEmails(data.inbox || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInbox();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (email: EmailItem) => {
    navigator.clipboard.writeText(email.code);
    setCopiedId(email.id);
    if (onSelectCode) {
      onSelectCode(email.code);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-neutral-100">
                  Virtual Email & OTP Inbox
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-neutral-400">
                Live delivery for verification codes & registration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={fetchInbox}
              disabled={isLoading}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
              title="Refresh inbox"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Recipient Notice */}
        <div className="bg-emerald-950/40 p-3 px-4 border-b border-emerald-900/40 flex items-center justify-between text-[11px] font-mono text-emerald-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Recipient in DB:</span>
          </div>
          <span className="font-bold text-amber-300">+256 744 042 286</span>
        </div>

        {/* Emails List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {emails.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 space-y-2 text-xs font-mono">
              <Mail className="w-8 h-8 mx-auto text-neutral-700" />
              <p>No verification emails received yet.</p>
              <p className="text-[11px] text-neutral-600">
                Click &quot;Send Verification Code&quot; in Registration or Merchant Verification to receive real-time codes here.
              </p>
            </div>
          ) : (
            emails.map((eml) => (
              <div
                key={eml.id}
                className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-800/80 transition-all space-y-2.5 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                      {eml.purpose.replace('_', ' ')}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-100 line-clamp-1">
                      {eml.subject}
                    </h4>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono whitespace-nowrap">
                    {formatDate(eml.sentAt)}
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 font-mono">
                  To: <strong className="text-neutral-200">{eml.to}</strong>
                </div>

                {/* 6-Digit Code Box */}
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-base font-extrabold tracking-widest text-amber-300">
                      {eml.code}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(eml)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold transition-colors"
                  >
                    {copiedId === eml.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <details className="text-[11px] text-neutral-400">
                  <summary className="cursor-pointer hover:text-neutral-200">
                    View Full Email Message
                  </summary>
                  <pre className="mt-2 p-2.5 rounded-lg bg-black text-[10px] font-mono text-neutral-400 whitespace-pre-wrap leading-relaxed">
                    {eml.bodyText}
                  </pre>
                </details>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 text-center text-[11px] text-neutral-500 font-mono">
          Islamic Habibi Identity & Email Service Active
        </div>
      </div>
    </div>
  );
};
