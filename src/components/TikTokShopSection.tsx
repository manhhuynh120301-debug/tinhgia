/**
 * @file components/TikTokShopSection.tsx
 * Section 6: Tối ưu giá niêm yết & Chi phí sàn TikTok Shop.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings,
  Percent,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Store,
  DollarSign,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { TikTokFeeSettings, TikTokResult, PricingResult } from '../types';
import { formatVND, formatPercentVN, formatNumberVN } from '../lib/formatters';
import { DEFAULT_TIKTOK_FEES } from '../lib/priceSolver';

interface TikTokShopSectionProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  pricing: PricingResult;
  tiktokResult?: TikTokResult;
  feeSettings: TikTokFeeSettings;
  onUpdateFees: (updated: Partial<TikTokFeeSettings>) => void;
  onResetFees: () => void;
}

export const TikTokShopSection: React.FC<TikTokShopSectionProps> = ({
  isEnabled,
  onToggle,
  pricing,
  tiktokResult,
  feeSettings,
  onUpdateFees,
  onResetFees,
}) => {
  const [isFeeSettingsOpen, setIsFeeSettingsOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40 space-y-5">
      {/* Header with Main Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
            6
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Store className="w-4 h-4 text-rose-400" />
              TikTok Shop
            </h2>
            <p className="text-xs text-slate-400">
              Tự động tính giá niêm yết bù trừ các loại phí sàn TikTok
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="flex items-center gap-3 cursor-pointer select-none self-start sm:self-auto bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
          <span className="text-xs font-bold text-slate-200">
            Đăng bán trên TikTok Shop
          </span>
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </div>
        </label>
      </div>

      {/* Main TikTok Content (Only if enabled) */}
      {isEnabled && tiktokResult && (
        <div className="space-y-4">
          {/* Target Price Note */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">
              Mục tiêu thực nhận (Giá áp dụng hiện tại):
            </span>
            <span className="font-mono font-bold text-teal-300">
              {formatVND(pricing.applicableUnitPrice)} / cái ({pricing.tierName})
            </span>
          </div>

          {/* Key Results Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Giá đăng TikTok Shop */}
            <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-900 border border-rose-500/40 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-extrabold uppercase text-rose-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Giá đăng TikTok Shop
              </span>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-400">
                  {formatVND(tiktokResult.listingPrice)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                  Giá niêm yết trên giỏ hàng
                </span>
              </div>
            </div>

            {/* Tổng phí sàn */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 mb-1">
                Tổng phí sàn trừ
              </span>
              <div>
                <span className="text-xl font-bold font-mono text-rose-400">
                  -{formatVND(tiktokResult.totalFees)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                  {formatPercentVN(
                    tiktokResult.listingPrice > 0
                      ? (tiktokResult.totalFees / tiktokResult.listingPrice) * 100
                      : 0,
                    1
                  )}{' '}
                  giá niêm yết
                </span>
              </div>
            </div>

            {/* Tiền thực nhận */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 mb-1">
                Tiền thực nhận
              </span>
              <div>
                <span className="text-xl font-bold font-mono text-teal-300">
                  {formatVND(tiktokResult.estimatedNetReceived)}
                </span>
                <span
                  className={`text-[11px] font-mono block mt-0.5 ${
                    tiktokResult.difference >= 0
                      ? 'text-teal-400'
                      : 'text-amber-400'
                  }`}
                >
                  Chênh lệch: {tiktokResult.difference >= 0 ? '+' : ''}
                  {formatVND(tiktokResult.difference)}
                </span>
              </div>
            </div>

            {/* Lợi nhuận sau phí */}
            <div className="col-span-2 sm:col-span-3 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">
                  Lợi nhuận ròng sau khi trừ phí TikTok:
                </span>
              </div>
              <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                +{formatVND(tiktokResult.profitAfterFees)} / SP
                {tiktokResult.totalProfitAfterFees !== tiktokResult.profitAfterFees && (
                  <span className="text-xs text-slate-400 font-normal ml-2">
                    (Tổng {formatVND(tiktokResult.totalProfitAfterFees)})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Expandable Accordion: Chi tiết phí TikTok Shop */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setIsFeeSettingsOpen(!isFeeSettingsOpen)}
              className="w-full bg-slate-950 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-rose-400" />
                <span>Chi tiết phí TikTok Shop</span>
                <span className="text-[11px] font-normal text-slate-400">
                  (Bấm để tùy chỉnh % hoa hồng, voucher, đóng gói...)
                </span>
              </div>
              {isFeeSettingsOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isFeeSettingsOpen && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Phí hoa hồng sàn (%) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phí hoa hồng sàn (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={feeSettings.commissionFeePercent}
                        onChange={(e) =>
                          onUpdateFees({
                            commissionFeePercent: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        %
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Mặc định: 14.5%
                    </span>
                  </div>

                  {/* Phí giao dịch (%) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phí giao dịch (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={feeSettings.transactionFeePercent}
                        onChange={(e) =>
                          onUpdateFees({
                            transactionFeePercent: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        %
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Mặc định: 6%
                    </span>
                  </div>

                  {/* Voucher Extra (%) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Voucher Extra (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={feeSettings.voucherExtraValue}
                        onChange={(e) =>
                          onUpdateFees({
                            voucherExtraValue: Math.max(0, parseFloat(e.target.value) || 0),
                            voucherExtraType: 'percentage',
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        %
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Mặc định: 5%
                    </span>
                  </div>

                  {/* Phí xử lý đơn hàng (VND) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phí xử lý đơn hàng (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={feeSettings.orderProcessingFee}
                        onChange={(e) =>
                          onUpdateFees({
                            orderProcessingFee: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        đ
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Mặc định: 3.000đ
                    </span>
                  </div>

                  {/* VAT TikTok khấu trừ (%) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      VAT TikTok khấu trừ (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={feeSettings.vatFeePercent}
                        onChange={(e) =>
                          onUpdateFees({
                            vatFeePercent: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        %
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Mặc định: 1%
                    </span>
                  </div>

                  {/* Thuế TNCN TikTok khấu trừ (%) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      TNCN TikTok khấu trừ (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={feeSettings.personalIncomeTaxPercent}
                        onChange={(e) =>
                          onUpdateFees({
                            personalIncomeTaxPercent: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        %
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Mặc định: 0.5%
                    </span>
                  </div>

                  {/* Phí vận chuyển người bán chịu */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phí VC người bán chịu (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={feeSettings.sellerShippingFee}
                        onChange={(e) =>
                          onUpdateFees({
                            sellerShippingFee: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        đ
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Mặc định: 0đ
                    </span>
                  </div>

                  {/* Phí khác (VND) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phí khác (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={feeSettings.otherFee}
                        onChange={(e) =>
                          onUpdateFees({
                            otherFee: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        đ
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Mặc định: 0đ
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={onResetFees}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục biểu phí mặc định sàn</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Deductions Breakdown Accordion */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
              className="w-full bg-slate-950 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-400" />
                <span>Bảng bóc tách từng khoản trừ (Dòng tiền về ví)</span>
              </div>
              {isBreakdownOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isBreakdownOpen && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-200 font-bold">
                  <span>Giá đăng bán niêm yết:</span>
                  <span className="text-rose-400">{formatVND(tiktokResult.listingPrice)}</span>
                </div>

                <div className="flex justify-between py-0.5 text-slate-400">
                  <span>- Phí hoa hồng sàn ({feeSettings.commissionFeePercent}%):</span>
                  <span className="text-rose-400">-{formatVND(tiktokResult.commissionFee)}</span>
                </div>

                <div className="flex justify-between py-0.5 text-slate-400">
                  <span>- Phí giao dịch ({feeSettings.transactionFeePercent}%):</span>
                  <span className="text-rose-400">-{formatVND(tiktokResult.transactionFee)}</span>
                </div>

                {tiktokResult.voucherExtraFee > 0 && (
                  <div className="flex justify-between py-0.5 text-slate-400">
                    <span>- Voucher Extra ({feeSettings.voucherExtraValue}%):</span>
                    <span className="text-rose-400">-{formatVND(tiktokResult.voucherExtraFee)}</span>
                  </div>
                )}

                {tiktokResult.orderProcessingFee > 0 && (
                  <div className="flex justify-between py-0.5 text-slate-400">
                    <span>- Phí xử lý đơn hàng:</span>
                    <span className="text-rose-400">-{formatVND(tiktokResult.orderProcessingFee)}</span>
                  </div>
                )}

                {tiktokResult.vatFee > 0 && (
                  <div className="flex justify-between py-0.5 text-slate-400">
                    <span>- VAT TikTok khấu trừ ({feeSettings.vatFeePercent}%):</span>
                    <span className="text-rose-400">-{formatVND(tiktokResult.vatFee)}</span>
                  </div>
                )}

                {tiktokResult.personalIncomeTaxFee > 0 && (
                  <div className="flex justify-between py-0.5 text-slate-400">
                    <span>- Thuế TNCN TikTok khấu trừ ({feeSettings.personalIncomeTaxPercent}%):</span>
                    <span className="text-rose-400">-{formatVND(tiktokResult.personalIncomeTaxFee)}</span>
                  </div>
                )}

                {tiktokResult.sellerShippingFee > 0 && (
                  <div className="flex justify-between py-0.5 text-slate-400">
                    <span>- Phí vận chuyển người bán chịu:</span>
                    <span className="text-rose-400">-{formatVND(tiktokResult.sellerShippingFee)}</span>
                  </div>
                )}

                {tiktokResult.otherFee > 0 && (
                  <div className="flex justify-between py-0.5 text-slate-400">
                    <span>- Phí khác:</span>
                    <span className="text-rose-400">-{formatVND(tiktokResult.otherFee)}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-t border-dashed border-slate-700 text-teal-300 font-bold text-sm">
                  <span>= Tiền thực nhận về tài khoản:</span>
                  <span>{formatVND(tiktokResult.estimatedNetReceived)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
