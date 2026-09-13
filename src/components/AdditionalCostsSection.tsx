/**
 * @file components/AdditionalCostsSection.tsx
 * Section 2: Chi phí phụ trợ (Đóng gói, Phụ trợ khác).
 */

import React from 'react';
import { Package, Wrench } from 'lucide-react';
import { AdditionalCosts } from '../types';
import { formatVND } from '../lib/formatters';

interface AdditionalCostsSectionProps {
  costs: AdditionalCosts;
  onChange: (updated: Partial<AdditionalCosts>) => void;
}

export const AdditionalCostsSection: React.FC<AdditionalCostsSectionProps> = ({
  costs,
  onChange,
}) => {
  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
            Chi phí phụ trợ (Tùy chọn)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Mặc định: 0đ
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Chi phí đóng gói */}
        <div>
          <label
            htmlFor="packagingCost"
            className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Chi phí đóng gói</span>
            </span>
            {costs.packagingCost > 0 && (
              <span className="text-amber-400 font-mono text-[11px]">
                {formatVND(costs.packagingCost)}
              </span>
            )}
          </label>
          <div className="relative">
            <input
              id="packagingCost"
              type="number"
              min="0"
              step="500"
              value={costs.packagingCost === 0 ? '' : costs.packagingCost}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                onChange({ packagingCost: Math.max(0, isNaN(val) ? 0 : val) });
              }}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm font-bold transition-all outline-hidden pr-10"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
              đ
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Hộp carton, bọc bóng khí, túi niêm phong...
          </p>
        </div>

        {/* Chi phí phụ trợ khác */}
        <div>
          <label
            htmlFor="otherCost"
            className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Chi phí phụ trợ khác</span>
            </span>
            {costs.otherCost > 0 && (
              <span className="text-amber-400 font-mono text-[11px]">
                {formatVND(costs.otherCost)}
              </span>
            )}
          </label>
          <div className="relative">
            <input
              id="otherCost"
              type="number"
              min="0"
              step="500"
              value={costs.otherCost === 0 ? '' : costs.otherCost}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                onChange({ otherCost: Math.max(0, isNaN(val) ? 0 : val) });
              }}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm font-bold transition-all outline-hidden pr-10"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
              đ
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Keo dán, ốc vít nam châm, hậu kỳ nhám ráp...
          </p>
        </div>
      </div>
    </section>
  );
};
