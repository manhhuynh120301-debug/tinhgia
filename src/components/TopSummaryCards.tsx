/**
 * @file components/TopSummaryCards.tsx
 * 4 prominent metric cards showing the most crucial price points at a glance.
 */

import React from 'react';
import { Layers, Tag, ShoppingCart, TrendingUp, Sparkles } from 'lucide-react';
import { formatVND } from '../lib/formatters';
import { PricingResult, TikTokResult } from '../types';

interface TopSummaryCardsProps {
  pricingResult: PricingResult;
  isTikTokEnabled: boolean;
  tiktokResult?: TikTokResult;
  quantity: number;
}

export const TopSummaryCards: React.FC<TopSummaryCardsProps> = ({
  pricingResult,
  isTikTokEnabled,
  tiktokResult,
  quantity,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Giá vốn */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-4 shadow-lg shadow-black/40 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Giá vốn (1 SP)</span>
          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-100">
            {formatVND(pricingResult.productionCost)}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
            Nhựa + Điện + Khấu hao máy
          </span>
        </div>
      </div>

      {/* 2. Giá báo khách (Giá lẻ) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-4 shadow-lg shadow-black/40 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Giá báo khách</span>
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Tag className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-cyan-300">
            {formatVND(pricingResult.retailPrice)}
          </div>
          <span className="text-[11px] text-cyan-400/80 font-mono mt-0.5 block">
            Giá lẻ chuẩn (Hệ số x{pricingResult.retailMultiplier || 2.5})
          </span>
        </div>
      </div>

      {/* 3. Giá áp dụng */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-4 shadow-lg shadow-black/40 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Giá áp dụng (1 SP)</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              pricingResult.activeTier === 'wholesale_100'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : pricingResult.activeTier === 'wholesale_50'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
            }`}
          >
            {pricingResult.activeTier === 'wholesale_100'
              ? 'Sỉ 100+ (-20%)'
              : pricingResult.activeTier === 'wholesale_50'
              ? 'Sỉ 50+ (-10%)'
              : 'Giá lẻ (SL: ' + quantity + ')'}
          </span>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-teal-300">
            {formatVND(pricingResult.applicableUnitPrice)}
          </div>
          <span className="text-[11px] text-teal-400/80 font-mono mt-0.5 block">
            {pricingResult.activeTier === 'retail'
              ? 'Đơn giá bán lẻ'
              : `Đã chiết khấu ${pricingResult.discountPercent}%`}
          </span>
        </div>
      </div>

      {/* 4. Giá đăng TikTok hoặc Tổng tiền đơn hàng */}
      {isTikTokEnabled && tiktokResult ? (
        <div className="bg-slate-900/90 rounded-2xl border border-rose-500/40 p-4 shadow-lg shadow-rose-950/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium text-rose-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-400" />
              Giá đăng TikTok
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              TikTok Shop
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-rose-400">
              {formatVND(tiktokResult.listingPrice)}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
              Thực nhận: {formatVND(tiktokResult.estimatedNetReceived)}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-4 shadow-lg shadow-black/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">Tổng tiền đơn hàng</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-emerald-400">
              {formatVND(pricingResult.orderTotal)}
            </div>
            <span className="text-[11px] text-emerald-400/80 font-mono mt-0.5 block">
              Cho {quantity} sản phẩm
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
