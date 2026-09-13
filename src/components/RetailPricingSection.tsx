/**
 * @file components/RetailPricingSection.tsx
 * Section 4: Định giá & Báo giá khách hàng với các lựa chọn hệ số 2.5x, 3x, 3.5x, 4x, 4.5x.
 */

import React from 'react';
import { Tag, TrendingUp, Sparkles, Check, Sliders } from 'lucide-react';
import { PricingResult } from '../types';
import { formatVND } from '../lib/formatters';

interface RetailPricingSectionProps {
  pricing: PricingResult;
  multiplier: number;
  onMultiplierChange: (multiplier: number) => void;
}

const MULTIPLIER_OPTIONS = [
  { value: 2.5, label: '2.5x', note: 'Mặc định' },
  { value: 3.0, label: '3x', note: 'Phổ thông' },
  { value: 3.5, label: '3.5x', note: 'Biên độ tốt' },
  { value: 4.0, label: '4x', note: 'Hàng chi tiết' },
  { value: 4.5, label: '4.5x', note: 'Cao cấp' },
];

export const RetailPricingSection: React.FC<RetailPricingSectionProps> = ({
  pricing,
  multiplier,
  onMultiplierChange,
}) => {
  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
            4
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
              Định giá & Báo giá khách hàng
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-cyan-300 font-mono flex items-center gap-1 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/30">
            <Sliders className="w-3 h-3 text-cyan-400" />
            Hệ số đang chọn: x{multiplier}
          </span>
        </div>
      </div>

      {/* Multiplier Selector: 2.5x, 3x, 3.5x, 4x, 4.5x */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>Chọn hệ số giá bán lẻ:</span>
            <span className="text-slate-400 font-normal text-[11px] hidden sm:inline">
              (Giá bán = Giá vốn × Hệ số)
            </span>
          </label>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold">
            {multiplier}x vốn
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MULTIPLIER_OPTIONS.map((opt) => {
            const isSelected = Math.abs(multiplier - opt.value) < 0.01;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onMultiplierChange(opt.value)}
                className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50 font-black'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm sm:text-base font-mono font-bold">
                    {opt.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-300 stroke-[3]" />}
                </div>
                <span
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {opt.note}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Multiplier Input (Fine-tuning) */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400 text-[11px]">
            Hoặc tự nhập hệ số tùy chỉnh:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-slate-400">x</span>
            <input
              type="number"
              min="1"
              max="20"
              step="0.1"
              value={multiplier}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 0) {
                  onMultiplierChange(val);
                }
              }}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs font-mono font-bold text-cyan-300 focus:outline-hidden focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Main Retail Price Hero Card */}
      <div className="bg-gradient-to-br from-cyan-950/40 via-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Giá báo khách lẻ (1 sản phẩm)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Công thức: Giá vốn × {multiplier}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Giá bán lẻ đề xuất cho khách mua lẻ (số lượng dưới 50 cái)
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-cyan-300">
            {formatVND(pricing.retailPrice)}
          </div>
          <div className="flex items-center gap-1.5 justify-start sm:justify-end text-xs font-mono text-emerald-400 font-bold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Lợi nhuận: +{formatVND(pricing.unitRetailProfit)} / SP</span>
          </div>
        </div>
      </div>

      {/* 4 Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <span className="text-slate-400 block mb-1">Giá vốn 1 SP</span>
          <span className="font-mono font-bold text-slate-200 text-sm">
            {formatVND(pricing.productionCost)}
          </span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <span className="text-slate-400 block mb-1">Hệ số định giá</span>
          <span className="font-mono font-bold text-cyan-300 text-sm">
            x{multiplier}
          </span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <span className="text-slate-400 block mb-1">Giá báo khách lẻ</span>
          <span className="font-mono font-bold text-cyan-300 text-sm">
            {formatVND(pricing.retailPrice)}
          </span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <span className="text-slate-400 block mb-1">Lợi nhuận dự kiến</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            +{formatVND(pricing.unitRetailProfit)}
          </span>
        </div>
      </div>
    </section>
  );
};
