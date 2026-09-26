import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  HeartHandshake,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Transaction } from '../types';
import { MERCHANT_PROFILE } from '../data/packages';
import { formatDate, formatUSD, formatUGX } from '../utils/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*ISLAMIC HABIBI MATRIMONIAL RECEIPT*\n` +
      `Reference: ${transaction.reference}\n` +
      `Package: ${transaction.packageName}\n` +
      `Amount Settled: $${transaction.amountUSD} USD\n` +
      `Client: ${transaction.customerName}\n` +
      `Purpose: Helping Muslims Marry Muslims upon Quran & Sunnah\n` +
      `Status: COMPLETED & VERIFIED`
    );
    window.open(`https://wa.me/${MERCHANT_PROFILE.recipientPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-emerald-800/60 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber-400 font-bold">
              OFFICIAL RECEIPT · {transaction.reference}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              title="Print Receipt"
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              title="Forward to WhatsApp"
              className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-neutral-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-neutral-950">
          {/* Islamic Bismillah & Crest */}
          <div className="text-center space-y-2 border-b border-dashed border-neutral-700/80 pb-6">
            <p className="font-amiri text-lg text-amber-300/90 tracking-wider">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h1 className="font-cinzel text-xl sm:text-2xl font-extrabold text-neutral-100 tracking-wide">
              ISLAMIC HABIBI MATRIMONIAL
            </h1>
            <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase">
              Helping Muslims Marry Muslims upon Quran & Sunnah
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-neutral-300 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-800">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Merchant Recipient: </span>
              <strong className="text-amber-400">{MERCHANT_PROFILE.formattedPhone}</strong>
            </div>
          </div>

          {/* Amount Hero in USD */}
          <div className="text-center py-3 bg-emerald-950/30 rounded-2xl border border-emerald-900/40">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
              Subscription Amount Paid
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-emerald-400 mt-0.5">
              {formatUSD(transaction.amountUSD)} USD
            </div>
            <div className="text-xs font-mono text-neutral-400">
              Local Equivalent: {formatUGX(transaction.amountUGX)}
            </div>
          </div>

          {/* Meta Details Grid */}
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-500">Transaction Reference:</span>
              <span className="font-bold text-amber-300">{transaction.reference}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-500">Matrimonial Package:</span>
              <span className="font-sans font-semibold text-neutral-200 text-right max-w-[240px]">
                {transaction.packageName}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-500">Client / Wali Name:</span>
              <span className="font-sans text-neutral-200">{transaction.customerName}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-500">Contact Number:</span>
              <span className="text-neutral-300">{transaction.customerPhone}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-500">Payment Channel:</span>
              <span className="capitalize text-neutral-200">
                {transaction.paymentMethod.replace('_', ' ')}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-500">Date & Timestamp:</span>
              <span className="text-neutral-300">{formatDate(transaction.createdAt)}</span>
            </div>

            {transaction.preferredDate && (
              <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/60">
                <span className="text-neutral-500">Scheduled Date:</span>
                <span className="text-amber-400 font-bold">
                  {transaction.preferredDate}
                </span>
              </div>
            )}

            {transaction.notes && (
              <div className="py-2 border-b border-neutral-800/60 text-neutral-400 font-sans text-[11px]">
                <strong className="text-neutral-300 font-mono">Spousal Criteria:</strong> {transaction.notes}
              </div>
            )}
          </div>

          {/* Official Islamic Habibi Seal */}
          <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full border-2 border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-200 uppercase font-cinzel">
                  Islamic Habibi Matrimonial Seal
                </p>
                <p className="text-[10px] text-emerald-400 font-mono">
                  Verified Receiver: +256 744 042 286
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                VERIFIED & PAID
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Forward to WhatsApp (+256 744 042 286)</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
