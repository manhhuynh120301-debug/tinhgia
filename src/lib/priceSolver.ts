/**
 * @file lib/priceSolver.ts
 * Reverse-calculation price solver for TikTok Shop listing prices.
 *
 * Automatically finds the lowest practical listing price such that:
 * Estimated Net Received >= Applicable Target Price - ALLOWED_DIFFERENCE (500 VND)
 */

import {
  ALLOWED_DIFFERENCE,
  TikTokFeeSettings,
  TikTokResult,
} from '../types';

export const DEFAULT_TIKTOK_FEES: TikTokFeeSettings = {
  transactionFeePercent: 6, // 6%
  commissionFeePercent: 14.5, // 14.5%
  voucherExtraType: 'percentage',
  voucherExtraValue: 5, // 5%
  orderProcessingFee: 3000, // 3.000 VND
  vatFeePercent: 1, // 1% VAT TikTok khấu trừ
  personalIncomeTaxPercent: 0.5, // 0.5% Thuế TNCN TikTok khấu trừ
  sellerShippingFee: 0, // 0 VND (editable)
  otherFee: 0, // 0 VND (editable)
};

/**
 * Calculates itemized fees and net payout for a specific proposed listing price.
 */
export function calculateTikTokBreakdownForPrice(
  listingPrice: number,
  applicableTargetPrice: number,
  productionCost: number,
  feeSettings: TikTokFeeSettings,
  quantity = 1
): TikTokResult {
  const price = Math.max(0, listingPrice);
  const target = Math.max(0, applicableTargetPrice);
  const qty = Math.max(1, quantity);

  // 1. Transaction fee
  const transactionFee = price * (Math.max(0, feeSettings.transactionFeePercent || 0) / 100);

  // 2. Marketplace commission fee
  const commissionFee = price * (Math.max(0, feeSettings.commissionFeePercent || 0) / 100);

  // 3. Voucher Extra fee
  let voucherExtraFee = 0;
  if (feeSettings.voucherExtraType === 'percentage') {
    voucherExtraFee = price * (Math.max(0, feeSettings.voucherExtraValue || 0) / 100);
  } else if (feeSettings.voucherExtraType === 'fixed') {
    voucherExtraFee = Math.max(0, feeSettings.voucherExtraValue || 0);
  }

  // 4. VAT & Personal Income Tax (TNCN) deducted by TikTok
  const vatFee = price * (Math.max(0, feeSettings.vatFeePercent || 0) / 100);
  const personalIncomeTaxFee = price * (Math.max(0, feeSettings.personalIncomeTaxPercent || 0) / 100);

  // 5. Fixed fees
  const orderProcessingFee = Math.max(0, feeSettings.orderProcessingFee || 0);
  const sellerShippingFee = Math.max(0, feeSettings.sellerShippingFee || 0);
  const otherFee = Math.max(0, feeSettings.otherFee || 0);

  // Total fees deducted per unit
  const totalFees =
    transactionFee +
    commissionFee +
    voucherExtraFee +
    orderProcessingFee +
    vatFee +
    personalIncomeTaxFee +
    sellerShippingFee +
    otherFee;

  // Net received per unit
  const estimatedNetReceived = price - totalFees;

  // Difference compared to target quote
  const difference = estimatedNetReceived - target;

  // Net profit per unit after TikTok fees and manufacturing cost
  const profitAfterFees = estimatedNetReceived - productionCost;
  const totalProfitAfterFees = profitAfterFees * qty;

  return {
    applicableTargetPrice: target,
    listingPrice: price,
    transactionFee,
    commissionFee,
    voucherExtraFee,
    orderProcessingFee,
    vatFee,
    personalIncomeTaxFee,
    sellerShippingFee,
    otherFee,
    totalFees,
    estimatedNetReceived,
    difference,
    profitAfterFees,
    totalProfitAfterFees,
  };
}

/**
 * Automatically solves for the lowest practical TikTok Shop listing price that achieves the target net payout.
 */
export function solveTikTokListingPrice(
  applicableTargetPrice: number,
  productionCost: number,
  feeSettings: TikTokFeeSettings,
  quantity = 1
): TikTokResult {
  const target = Math.max(0, applicableTargetPrice);
  const targetMinNet = Math.max(0, target - ALLOWED_DIFFERENCE);

  if (target <= 0) {
    return calculateTikTokBreakdownForPrice(0, 0, productionCost, feeSettings, quantity);
  }

  // 1. Percentage fees sum
  let percentRate =
    Math.max(0, feeSettings.transactionFeePercent || 0) +
    Math.max(0, feeSettings.commissionFeePercent || 0) +
    Math.max(0, feeSettings.vatFeePercent || 0) +
    Math.max(0, feeSettings.personalIncomeTaxPercent || 0);

  if (feeSettings.voucherExtraType === 'percentage') {
    percentRate += Math.max(0, feeSettings.voucherExtraValue || 0);
  }

  // 2. Fixed fees sum
  let fixedFees =
    Math.max(0, feeSettings.orderProcessingFee || 0) +
    Math.max(0, feeSettings.sellerShippingFee || 0) +
    Math.max(0, feeSettings.otherFee || 0);

  if (feeSettings.voucherExtraType === 'fixed') {
    fixedFees += Math.max(0, feeSettings.voucherExtraValue || 0);
  }

  // Guard against fee percentage >= 95%
  const safePercentRate = Math.min(90, percentRate);
  const decimalRate = safePercentRate / 100;

  // Theoretical exact price: (targetMinNet + fixedFees) / (1 - decimalRate)
  const rawPrice = (targetMinNet + fixedFees) / (1 - decimalRate);

  // Round candidate to nearest 500 VND step
  const step = 500;
  let candidatePrice = Math.round(rawPrice / step) * step;

  let testResult = calculateTikTokBreakdownForPrice(
    candidatePrice,
    target,
    productionCost,
    feeSettings,
    quantity
  );

  // If below minimum target, round up
  if (testResult.estimatedNetReceived < targetMinNet) {
    candidatePrice = Math.ceil(rawPrice / step) * step;
    testResult = calculateTikTokBreakdownForPrice(
      candidatePrice,
      target,
      productionCost,
      feeSettings,
      quantity
    );
  }

  // Fine-tuning step up if discrete math leaves it slightly under
  let safetyLoop = 0;
  while (testResult.estimatedNetReceived < targetMinNet - 0.01 && safetyLoop < 15) {
    candidatePrice += step;
    testResult = calculateTikTokBreakdownForPrice(
      candidatePrice,
      target,
      productionCost,
      feeSettings,
      quantity
    );
    safetyLoop++;
  }

  return testResult;
}
