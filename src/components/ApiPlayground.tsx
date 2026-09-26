import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  Loader2, 
  FileJson,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { ServicePackage } from '../types';
import { MERCHANT_PROFILE } from '../data/packages';
import { formatUSD } from '../utils/formatters';

interface ApiPlaygroundProps {
  packages: ServicePackage[];
  onTransactionCreated: () => void;
  presetPackage?: ServicePackage | null;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({
  packages,
  onTransactionCreated,
  presetPackage
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'charge' | 'packages' | 'transactions' | 'merchant'>('charge');
  const [selectedPkgId, setSelectedPkgId] = useState<string>(presetPackage ? presetPackage.id : (packages[0]?.id || 'pkg-zawaj-matchmaker'));
  const [customerName, setCustomerName] = useState('Sulaiman Kigozi');
  const [customerPhone, setCustomerPhone] = useState('+256701889922');
  const [amountUSD, setAmountUSD] = useState<number>(39);
  const [paymentMethod, setPaymentMethod] = useState<'airtel_money' | 'mtn_momo' | 'card'>('airtel_money');
  const [notes, setNotes] = useState('Monthly Zawaj Blessed Matchmaker subscription');
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'javascript' | 'python' | 'php'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  const handlePackageChange = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    const p = packages.find(pkg => pkg.id === pkgId);
    if (p) {
      setAmountUSD(p.priceUSD);
    }
  };

  const requestPayload = {
    packageId: selectedPkgId,
    amount: Number(amountUSD),
    currency: 'USD',
    customerName: customerName,
    customerPhone: customerPhone,
    paymentMethod: paymentMethod,
    notes: notes,
    channel: 'API'
  };

  const getCurlSnippet = () => {
    return `curl -X POST "https://api.islamichabibi.ug/api/charge" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ih_live_matrimonial_key" \\
  -d '${JSON.stringify(requestPayload, null, 2)}'`;
  };

  const getJsSnippet = () => {
    return `// JavaScript / TypeScript Matrimonial Subscription Call
const subscriptionPayload = ${JSON.stringify(requestPayload, null, 2)};

async function subscribeMuslimMatrimonial() {
  const response = await fetch('/api/charge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscriptionPayload)
  });

  const data = await response.json();
  console.log('Matrimonial Subscription Confirmed ($ USD):', data);
  return data;
}`;
  };

  const getPythonSnippet = () => {
    return `# Python Requests Example for Islamic Habibi Matrimonial
import requests

url = "https://api.islamichabibi.ug/api/charge"
payload = ${JSON.stringify(requestPayload, null, 4)}

response = requests.post(url, json=payload)
print("Status:", response.status_code)
print("Data:", response.json())`;
  };

  const getPhpSnippet = () => {
    return `<?php
// PHP cURL Example for Matrimonial Subscription
$payload = json_encode(${JSON.stringify(requestPayload, null, 2)});

$ch = curl_init('https://api.islamichabibi.ug/api/charge');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`;
  };

  const handleCopyCode = () => {
    let snippet = getCurlSnippet();
    if (activeCodeTab === 'javascript') snippet = getJsSnippet();
    if (activeCodeTab === 'python') snippet = getPythonSnippet();
    if (activeCodeTab === 'php') snippet = getPhpSnippet();

    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExecuteApi = async () => {
    setIsLoading(true);
    setApiResponse(null);
    const startTime = performance.now();

    try {
      let endpointUrl = '/api/charge';
      let method = 'POST';
      let body: string | null = null;

      if (selectedEndpoint === 'charge') {
        endpointUrl = '/api/charge';
        method = 'POST';
        body = JSON.stringify(requestPayload);
      } else if (selectedEndpoint === 'packages') {
        endpointUrl = '/api/packages';
        method = 'GET';
      } else if (selectedEndpoint === 'transactions') {
        endpointUrl = '/api/transactions';
        method = 'GET';
      } else if (selectedEndpoint === 'merchant') {
        endpointUrl = '/api/merchant';
        method = 'GET';
      }

      const res = await fetch(endpointUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? body : undefined
      });

      const data = await res.json();
      const endTime = performance.now();

      setResponseStatus(res.status);
      setResponseDuration(Math.round(endTime - startTime));
      setApiResponse(JSON.stringify(data, null, 2));

      if (res.ok && selectedEndpoint === 'charge') {
        onTransactionCreated();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'API execution failed';
      setResponseStatus(500);
      setApiResponse(JSON.stringify({ error: message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-neutral-950 border border-emerald-800/50 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 text-xs font-mono">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              Islamic Habibi Matrimonial Subscription API ($ USD)
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-neutral-100">
              Matrimonial API & Subscription Console
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Integrate Muslim matrimonial matchmaking memberships, Wali assisted concierges, 
              and sacred Nikah solemnization contract billings. All amounts are settled in 
              <strong className="text-amber-300 font-mono"> US Dollars ($ USD)</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1.5 shrink-0">
            <div className="text-emerald-400 font-bold">Standard Currency:</div>
            <div className="text-xl font-bold text-amber-300">$ USD</div>
            <div className="text-[11px] text-neutral-400">
              Purpose: Helping Muslims Marry Muslims
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
        <button
          onClick={() => setSelectedEndpoint('charge')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            selectedEndpoint === 'charge'
              ? 'bg-emerald-600 text-neutral-950 shadow-md font-bold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 text-[10px]">POST</span>
          /api/charge (Subscribe in USD)
        </button>

        <button
          onClick={() => setSelectedEndpoint('packages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            selectedEndpoint === 'packages'
              ? 'bg-emerald-600 text-neutral-950 shadow-md font-bold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span className="px-1.5 py-0.5 rounded bg-blue-950/40 text-[10px]">GET</span>
          /api/packages (Matrimonial Tiers)
        </button>

        <button
          onClick={() => setSelectedEndpoint('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            selectedEndpoint === 'transactions'
              ? 'bg-emerald-600 text-neutral-950 shadow-md font-bold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span className="px-1.5 py-0.5 rounded bg-blue-950/40 text-[10px]">GET</span>
          /api/transactions (Ledger)
        </button>

        <button
          onClick={() => setSelectedEndpoint('merchant')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            selectedEndpoint === 'merchant'
              ? 'bg-emerald-600 text-neutral-950 shadow-md font-bold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span className="px-1.5 py-0.5 rounded bg-blue-950/40 text-[10px]">GET</span>
          /api/merchant (Account Status)
        </button>
      </div>

      {/* Two-Column Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Builder */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono text-sm font-bold text-neutral-100">
                  Subscription Payload Parameters
                </h3>
              </div>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Currency: $ USD
              </span>
            </div>

            {selectedEndpoint === 'charge' ? (
              <div className="space-y-4 text-xs">
                {/* Package Selection */}
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">
                    packageId (Select Matrimonial Plan)
                  </label>
                  <select
                    value={selectedPkgId}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.title} (${p.priceUSD} / {p.billingType})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount in USD */}
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">
                    amount (in US Dollars $)
                  </label>
                  <input
                    type="number"
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">customerName</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">customerPhone</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">paymentMethod</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'airtel_money' | 'mtn_momo' | 'card')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="airtel_money">airtel_money (Airtel Uganda *185#)</option>
                    <option value="mtn_momo">mtn_momo (MTN Mobile Money *165#)</option>
                    <option value="card">card (Visa / Mastercard)</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
                <p className="text-emerald-400 font-bold mb-1">Endpoint: {selectedEndpoint.toUpperCase()}</p>
                <p className="text-neutral-400">
                  {selectedEndpoint === 'packages' && 'Returns complete list of active Muslim matrimonial and Nikah packages in US Dollars.'}
                  {selectedEndpoint === 'transactions' && 'Returns historical matrimonial subscriptions and settled payments in USD.'}
                  {selectedEndpoint === 'merchant' && 'Queries merchant profile, verification status, and recipient settings.'}
                </p>
              </div>
            )}

            <button
              onClick={handleExecuteApi}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 text-neutral-950 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Call...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Matrimonial API Call</span>
                </>
              )}
            </button>
          </div>

          {/* Code Snippets Panel */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <h3 className="font-mono text-xs font-bold text-neutral-200">
                  Integration Code ($ USD)
                </h3>
              </div>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono">
              {(['curl', 'javascript', 'python', 'php'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeTab(lang)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    activeCodeTab === lang
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/90 text-neutral-300 font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
              <code>
                {activeCodeTab === 'curl' && getCurlSnippet()}
                {activeCodeTab === 'javascript' && getJsSnippet()}
                {activeCodeTab === 'python' && getPythonSnippet()}
                {activeCodeTab === 'php' && getPhpSnippet()}
              </code>
            </pre>
          </div>
        </div>

        {/* Right: Response Inspector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono text-sm font-bold text-neutral-100">
                  Response Inspector
                </h3>
              </div>

              {responseStatus !== null && (
                <span
                  className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50'
                      : 'bg-rose-950 text-rose-400 border border-rose-600/50'
                  }`}
                >
                  HTTP {responseStatus} ({responseDuration}ms)
                </span>
              )}
            </div>

            {apiResponse ? (
              <pre className="p-4 rounded-xl bg-neutral-950 border border-emerald-900/40 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed">
                <code>{apiResponse}</code>
              </pre>
            ) : (
              <div className="text-center py-16 text-neutral-500 font-mono text-xs space-y-2">
                <Terminal className="w-8 h-8 text-neutral-700 mx-auto" />
                <p>Click &quot;Execute Matrimonial API Call&quot; to test the live endpoint in USD.</p>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-2">
            <h4 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Matrimonial Subscription Plan Codes:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {packages.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => handlePackageChange(p.id)}
                  className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-emerald-700 cursor-pointer flex items-center justify-between text-[11px] transition-colors"
                >
                  <span className="text-emerald-400 font-bold">{p.code}</span>
                  <span className="text-amber-300 font-bold">{formatUSD(p.priceUSD)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
