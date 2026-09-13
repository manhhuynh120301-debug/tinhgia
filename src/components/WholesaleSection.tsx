/**
 * @file components/WholesaleSection.tsx
 * Section 5: Bảng giá sỉ tự động theo số lượng (1-49, 50-99, 100+).
 */

import React from 'react';
import { Percent, TrendingUp, Check, ArrowRight, ShoppingBag } from 'lucide-react';
import { PricingResult, WholesaleTierId } from '../types';
import { formatVND, formatNumberVN } from '../lib/formatters';
import { WHOLESALE_TIERS } from '../lib/calculations';

interface WholesaleSectionProps {
  pricing: PricingResult;
  quantity: number;
  onSetQuantity: (qty: number) => void;
}

export const WholesaleSection: React.FC<WholesaleSectionProps> = ({
  pricing,
  quantity,
  onSetQuantity,
}) => {
  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
            5
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
            Giá sỉ theo số lượng
          </h2>
        </div>
        <span className="text-[11px] text-teal-400 font-mono">
          Tự động nhận diện mức giá theo số lượng đặt
        </span>
      </div>

      {/* 3-Level Visual Indicator */}
      <div>
        <span className="text-xs font-semibold text-slate-300 block mb-2.5">
          Các mức chiết khấu số lượng:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WHOLESALE_TIERS.map((tier) => {
            const isActive = pricing.activeTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => onSetQuantity(tier.minQty)}
                className={`relative rounded-xl p-3.5 border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 border-teal-500/80 shadow-md shadow-teal-950/40 ring-1 ring-teal-500/50'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500 text-slate-950 flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Đang áp dụng
                  </span>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold ${
                      isActive ? 'text-teal-300' : 'text-slate-300'
                    }`}
                  >
                    {tier.rangeLabel}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      tier.discountPercent > 0
                        ? isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tier.discountPercent === 0 ? 'Giá lẻ' : `Giảm ${tier.discountPercent}%`}
                  </span>
                </div>

                <div className="text-sm font-mono font-bold text-slate-100">
                  {tier.id === 'retail'
                    ? formatVND(pricing.retailPrice)
                    : tier.id === 'wholesale_50'
                    ? formatVND(pricing.retailPrice * 0.9)
                    : formatVND(pricing.retailPrice * 0.8)}
                  <span className="text-[10px] font-normal text-slate-400 font-sans ml-1">
                    / cái
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown Details Grid */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Chi tiết đơn hàng đang chọn
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
            {pricing.tierName}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Số lượng đặt:</span>
            <span className="font-mono font-bold text-slate-100 text-sm">
              {formatNumberVN(quantity)} cái
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Giá lẻ 1 sản phẩm:</span>
            <span className="font-mono font-semibold text-slate-300 text-sm">
              {formatVND(pricing.retailPrice)}/cái
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Giá áp dụng 1 sản phẩm:</span>
            <span className="font-mono font-bold text-teal-300 text-sm">
              {formatVND(pricing.applicableUnitPrice)}/cái
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Lợi nhuận trên 1 SP:</span>
            <span className="font-mono font-semibold text-emerald-400 text-sm">
              +{formatVND(pricing.unitProfit)}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-slate-400 block mb-0.5">Tổng tiền đơn hàng:</span>
            <span className="font-mono font-black text-emerald-400 text-base sm:text-lg">
              {formatVND(pricing.orderTotal)}
            </span>
            <span className="text-[11px] text-emerald-500/80 font-mono block mt-0.5">
              (Tổng lợi nhuận: +{formatVND(pricing.totalOrderProfit)})
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
