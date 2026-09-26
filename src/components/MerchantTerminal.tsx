import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  Search, 
  Download, 
  RefreshCw, 
  Smartphone, 
  CheckCircle2, 
  Receipt, 
  Send, 
  TrendingUp, 
  PlusCircle, 
  HeartHandshake,
  Loader2
} from 'lucide-react';
import { Transaction, ServicePackage } from '../types';
import { MERCHANT_PROFILE } from '../data/packages';
import { formatDate, formatUSD, formatUGX } from '../utils/formatters';

interface MerchantTerminalProps {
  transactions: Transaction[];
  packages: ServicePackage[];
  onSelectReceipt: (txn: Transaction) => void;
  onRefresh: () => void;
  onQuickCharge: () => void;
}

export const MerchantTerminal: React.FC<MerchantTerminalProps> = ({
  transactions,
  packages,
  onSelectReceipt,
  onRefresh,
  onQuickCharge
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [resendingRef, setResendingRef] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const completedTxns = transactions.filter((t) => t.status === 'completed');
  const totalRevenueUSD = completedTxns.reduce((sum, t) => sum + (t.amountUSD || 0), 0);
  const totalRevenueUGX = completedTxns.reduce((sum, t) => sum + (t.amountUGX || 0), 0);
  const avgTicketUSD = completedTxns.length > 0 ? Math.round(totalRevenueUSD / completedTxns.length) : 0;

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.reference.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.customerPhone.includes(q) ||
      t.packageName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleResendPush = async (txn: Transaction) => {
    setResendingRef(txn.reference);
    try {
      await fetch('/api/charge/resend-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: txn.reference })
      });
      setResendSuccess(`Payment push re-sent to ${txn.customerPhone} for ${txn.reference}`);
      setTimeout(() => setResendSuccess(null), 4000);
    } catch {
      alert('Could not resend prompt.');
    } finally {
      setResendingRef(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Reference', 'Date', 'Customer/Wali', 'Phone', 'Matrimonial Subscription', 'Amount USD', 'Amount UGX', 'Method', 'Status'];
    const rows = transactions.map((t) => [
      t.reference,
      t.createdAt,
      `"${t.customerName}"`,
      t.customerPhone,
      `"${t.packageName}"`,
      t.amountUSD,
      t.amountUGX,
      t.paymentMethod,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Islamic_Habibi_Matrimonial_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Merchant Header Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-950 via-emerald-950/70 to-neutral-950 border border-emerald-800/60 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
                Matrimonial Merchant Terminal
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/40">
                All Revenue in US Dollars ($ USD)
              </span>
            </div>

            <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-neutral-100">
              {MERCHANT_PROFILE.businessName} Matrimonial Ledger
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Real-time monitoring of all incoming Muslim matrimonial subscriptions, Wali family concierges, 
              and sacred Nikah solemnization contracts credited to merchant recipient <strong>+256 744 042 286</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onQuickCharge}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-neutral-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-neutral-950" />
              <span>Charge Subscription ($)</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={exportCSV}
              className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPIs in USD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue in USD */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Total Matrimonial Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-100">
            {formatUSD(totalRevenueUSD)} USD
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>≈ {formatUGX(totalRevenueUGX)}</span>
          </div>
        </div>

        {/* Card 2: Completed Subscriptions */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Active Subscriptions & Nikahs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-100">
            {completedTxns.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 font-mono">
            Across {packages.length} matrimonial tiers
          </div>
        </div>

        {/* Card 3: Average Subscription Ticket */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Average Subscription</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/50 flex items-center justify-center text-blue-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-100">
            {formatUSD(avgTicketUSD)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 font-mono">
            Per matrimonial client
          </div>
        </div>

        {/* Card 4: Purpose Badge */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-neutral-950 border border-emerald-700/60 shadow-md">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-2">
            <span>Sacred Mission</span>
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-amber-300">
            Helping Muslims Marry Muslims
          </div>
          <div className="text-[11px] text-emerald-300 mt-2">
            Upon Quran & Sunnah
          </div>
        </div>
      </div>

      {resendSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{resendSuccess}</span>
        </div>
      )}

      {/* Ledger Table Section */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, Wali, or phone..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'all' ? 'bg-neutral-800 text-neutral-100 font-bold' : 'text-neutral-400'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'completed' ? 'bg-emerald-900/60 text-emerald-300 font-bold' : 'text-neutral-400'
                }`}
              >
                Active / Paid ({completedTxns.length})
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-mono text-[11px] border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Reference</th>
                <th className="py-3.5 px-4 font-semibold">Client / Wali</th>
                <th className="py-3.5 px-4 font-semibold">Matrimonial Plan</th>
                <th className="py-3.5 px-4 font-semibold">Amount (USD)</th>
                <th className="py-3.5 px-4 font-semibold">Method</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 font-mono text-xs">
                    No matrimonial transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                      {txn.reference}
                      <div className="text-[10px] text-neutral-500 font-normal">
                        {formatDate(txn.createdAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-200">{txn.customerName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{txn.customerPhone}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="text-neutral-300 font-medium line-clamp-1">
                        {txn.packageName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-neutral-100 text-sm">
                        {formatUSD(txn.amountUSD)}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {formatUGX(txn.amountUGX)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800 font-mono text-[11px] capitalize">
                        <Smartphone className="w-3 h-3 text-emerald-400" />
                        {txn.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ACTIVE
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => onSelectReceipt(txn)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 transition-colors inline-flex items-center gap-1 text-xs"
                        title="View Official Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>

                      <button
                        onClick={() => handleResendPush(txn)}
                        disabled={resendingRef === txn.reference}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 text-xs disabled:opacity-50"
                        title="Resend Payment Prompt"
                      >
                        {resendingRef === txn.reference ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Push</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
