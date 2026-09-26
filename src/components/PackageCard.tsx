import React from 'react';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  HeartHandshake, 
  Clock,
  ShieldCheck,
  MessageSquareHeart
} from 'lucide-react';
import { ServicePackage } from '../types';
import { formatUSD } from '../utils/formatters';

interface PackageCardProps {
  pkg: ServicePackage;
  onSelect: (pkg: ServicePackage) => void;
  onViewApiPayload?: (pkg: ServicePackage) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onSelect
}) => {
  return (
    <div className={`relative flex flex-col rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 bg-gradient-to-b ${
      pkg.popular 
        ? 'from-emerald-950/80 via-neutral-900 to-neutral-950 border-amber-500/50 shadow-2xl shadow-amber-950/20' 
        : 'from-neutral-900/90 to-neutral-950 border-neutral-800 hover:border-emerald-800/80 shadow-lg shadow-neutral-950/40'
    }`}>
      {/* Featured / Popular ribbon */}
      {pkg.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-[11px] uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3 h-3 text-neutral-950" />
            Recommended Matrimonial Plan
          </div>
        </div>
      )}

      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        {/* Top Header */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="font-mono text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              {pkg.code}
            </span>
            <span className="text-xs font-medium text-emerald-400/90 capitalize flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              {pkg.duration}
            </span>
          </div>

          <h3 className="font-cinzel text-lg sm:text-xl font-bold text-neutral-100 mb-1 leading-snug">
            {pkg.title}
          </h3>

          <p className="font-amiri text-base text-amber-300/80 mb-3" dir="rtl">
            {pkg.arabicTitle}
          </p>

          <p className="text-xs text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
            {pkg.description}
          </p>

          {/* Pricing Box in USD */}
          <div className="py-3.5 px-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 mb-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-neutral-100 tracking-tight">
                {formatUSD(pkg.priceUSD)}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                / {pkg.billingType}
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <HeartHandshake className="w-3 h-3 text-emerald-400" />
              <span>Full Sharia Nikah facilitation & verification</span>
            </div>
          </div>

          {/* Suitable For */}
          <div className="text-[11px] text-neutral-300 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-900/40 mb-5">
            <span className="text-neutral-400 font-medium">Ideal For: </span>
            <strong className="text-neutral-200">{pkg.suitableFor}</strong>
          </div>

          {/* Features Deliverables List */}
          <div className="space-y-2.5 mb-6">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Included In Subscription:
            </p>
            {pkg.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                <div className="w-4 h-4 rounded-full bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-neutral-800/80 space-y-2.5">
          <button
            onClick={() => onSelect(pkg)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-950 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Activate Plan ({formatUSD(pkg.priceUSD)})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
