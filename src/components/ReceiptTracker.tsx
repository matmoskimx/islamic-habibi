import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Receipt, 
  HeartHandshake
} from 'lucide-react';
import { Transaction } from '../types';
import { formatDate, formatUSD, formatUGX } from '../utils/formatters';

interface ReceiptTrackerProps {
  onSelectReceipt: (txn: Transaction) => void;
}

export const ReceiptTracker: React.FC<ReceiptTrackerProps> = ({ onSelectReceipt }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const cleanQuery = query.trim();
      const res = await fetch(`/api/transactions/${cleanQuery}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const listRes = await fetch(`/api/transactions?search=${encodeURIComponent(cleanQuery)}`);
        const listData = await listRes.json();
        if (listData.transactions && listData.transactions.length > 0) {
          setResult(listData.transactions[0]);
        } else {
          setErrorMsg(`No matrimonial record found for "${cleanQuery}". Please verify reference or phone.`);
        }
      }
    } catch {
      setErrorMsg('Error verifying receipt. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-emerald-300 text-xs font-mono">
          <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
          Official Matrimonial Verification
        </div>
        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-neutral-100">
          Verify Matrimonial Subscription & Nikah Certificate
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Verify your official Islamic Habibi matrimonial subscription receipt and Sharia Nikah certificate. 
          Helping Muslims Marry Muslims upon Quran & Sunnah.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Reference (e.g. IH-TXN-847291) or Phone..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-sm placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Verify Receipt</span>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
          <span>Quick test:</span>
          <button
            type="button"
            onClick={() => setQuery('IH-TXN-847291')}
            className="font-mono text-amber-400 hover:underline"
          >
            IH-TXN-847291
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setQuery('IH-TXN-930412')}
            className="font-mono text-amber-400 hover:underline"
          >
            IH-TXN-930412
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-emerald-800/60 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60 mb-1">
                  AUTHENTIC MATRIMONIAL SUBSCRIPTION
                </div>
                <h3 className="font-cinzel text-lg font-bold text-neutral-100">
                  {result.packageName}
                </h3>
              </div>
            </div>

            <button
              onClick={() => onSelectReceipt(result)}
              className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Full Receipt</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-neutral-500">Transaction Reference:</span>
              <div className="font-bold text-amber-300 text-sm">{result.reference}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-neutral-500">Settled Amount:</span>
              <div className="font-bold text-emerald-400 text-sm">
                {formatUSD(result.amountUSD)} USD ({formatUGX(result.amountUGX)})
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-neutral-500">Client / Wali Name:</span>
              <div className="text-neutral-200 font-sans font-semibold">{result.customerName}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-neutral-500">Payment Channel:</span>
              <div className="text-neutral-200 capitalize">
                {result.paymentMethod.replace('_', ' ')}
              </div>
            </div>
          </div>

          {result.notes && (
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
              <span className="text-neutral-500 font-mono">Spousal Criteria & Notes: </span>
              {result.notes}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800">
            <span>Verified on Islamic Habibi Matrimonial Records</span>
            <span className="font-mono text-emerald-400">{formatDate(result.createdAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
