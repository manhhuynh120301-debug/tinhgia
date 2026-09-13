/**
 * @file components/CostBreakdownSection.tsx
 * Section 3: Chi phí sản xuất & Giá vốn 1 sản phẩm (Chi tiết nhựa, điện, máy, phụ trợ).
 */

import React from 'react';
import { Layers, Zap, Cpu, Package, Sparkles } from 'lucide-react';
import { ProductionCostResult, PrintingParams } from '../types';
import { formatVND, formatNumberVN } from '../lib/formatters';

interface CostBreakdownSectionProps {
  breakdown: ProductionCostResult;
  params: PrintingParams;
}

export const CostBreakdownSection: React.FC<CostBreakdownSectionProps> = ({
  breakdown,
  params,
}) => {
  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
            Chi phí sản xuất & Giá vốn
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Tự động tính theo định mức cố định
        </span>
      </div>

      {/* Prominent Total Callout */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-teal-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Tổng giá vốn sản xuất (1 sản phẩm)
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng: Tiền nhựa + Tiền điện + Chi phí máy + Phụ trợ
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white block">
            {formatVND(breakdown.totalProductionCost)}
          </span>
        </div>
      </div>

      {/* Itemized Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* 1. Tiền nhựa */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              Tiền nhựa
            </span>
            <span className="font-mono text-[10px] text-slate-400">150đ/g</span>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-teal-300">
              {formatVND(breakdown.materialCost)}
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {formatNumberVN(params.filamentWeightGrams)}g × 150đ
            </p>
          </div>
        </div>

        {/* 2. Tiền điện */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Tiền điện
            </span>
            <span className="font-mono text-[10px] text-slate-400">4.000đ/kg</span>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-amber-300">
              {formatVND(breakdown.electricityCost)}
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              ({formatNumberVN(params.filamentWeightGrams)} / 1000) × 4.000đ
            </p>
          </div>
        </div>

        {/* 3. Chi phí máy */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Chi phí máy
            </span>
            <span className="font-mono text-[10px] text-slate-400">2.500đ/h</span>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-cyan-300">
              {formatVND(breakdown.machineCost)}
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {formatNumberVN(params.printingTimeHours, 2)} giờ × 2.500đ
            </p>
          </div>
        </div>

        {/* 4. Chi phí phụ trợ */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-purple-400" />
              Chi phí phụ trợ
            </span>
            <span className="font-mono text-[10px] text-slate-400">Đóng gói + Khác</span>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-purple-300">
              {formatVND(breakdown.additionalCost)}
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Đóng gói + Vật tư phụ
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
