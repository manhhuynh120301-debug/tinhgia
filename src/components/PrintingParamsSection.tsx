/**
 * @file components/PrintingParamsSection.tsx
 * Section 1: Thông số in (Khối lượng nhựa, Thời gian in, Số lượng).
 */

import React from 'react';
import { Scale, Clock, PackageCheck } from 'lucide-react';
import { PrintingParams } from '../types';

interface PrintingParamsSectionProps {
  params: PrintingParams;
  onChange: (updated: Partial<PrintingParams>) => void;
}

export const PrintingParamsSection: React.FC<PrintingParamsSectionProps> = ({
  params,
  onChange,
}) => {
  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
            Thông số in 3D
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Nhập khối lượng, thời gian & số lượng
        </span>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Khối lượng nhựa (g) */}
        <div>
          <label
            htmlFor="filamentWeight"
            className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5 text-teal-400" />
            <span>Khối lượng nhựa</span>
            <span className="text-slate-400 font-normal">(g)</span>
          </label>
          <div className="relative">
            <input
              id="filamentWeight"
              type="number"
              min="0"
              step="any"
              value={params.filamentWeightGrams === 0 ? '' : params.filamentWeightGrams}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                onChange({ filamentWeightGrams: Math.max(0, isNaN(val) ? 0 : val) });
              }}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-base font-bold transition-all outline-hidden pr-10"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
              g
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Ví dụ: 64g
          </p>
        </div>

        {/* 2. Thời gian in (giờ) */}
        <div>
          <label
            htmlFor="printingTime"
            className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Thời gian in</span>
            <span className="text-slate-400 font-normal">(giờ)</span>
          </label>
          <div className="relative">
            <input
              id="printingTime"
              type="number"
              min="0"
              step="any"
              value={params.printingTimeHours === 0 ? '' : params.printingTimeHours}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                onChange({ printingTimeHours: Math.max(0, isNaN(val) ? 0 : val) });
              }}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-base font-bold transition-all outline-hidden pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
              giờ
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Ví dụ: 4 giờ
          </p>
        </div>

        {/* 3. Số lượng (cái) */}
        <div>
          <label
            htmlFor="quantity"
            className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"
          >
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Số lượng đặt</span>
            <span className="text-slate-400 font-normal">(cái)</span>
          </label>
          <div className="relative">
            <input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={params.quantity === 0 ? '' : params.quantity}
              placeholder="1"
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onChange({ quantity: Math.max(1, isNaN(val) ? 1 : val) });
              }}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-base font-bold transition-all outline-hidden pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
              cái
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {[1, 10, 50, 100].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onChange({ quantity: q })}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  params.quantity === q
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
