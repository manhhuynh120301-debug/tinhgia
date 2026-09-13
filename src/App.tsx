/**
 * @file App.tsx
 * Simplified 3D Printing Price Calculator & TikTok Shop Price Optimizer.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { TopSummaryCards } from './components/TopSummaryCards';
import { PrintingParamsSection } from './components/PrintingParamsSection';
import { AdditionalCostsSection } from './components/AdditionalCostsSection';
import { CostBreakdownSection } from './components/CostBreakdownSection';
import { RetailPricingSection } from './components/RetailPricingSection';
import { WholesaleSection } from './components/WholesaleSection';
import { TikTokShopSection } from './components/TikTokShopSection';

import { PrintingParams, AdditionalCosts, TikTokFeeSettings, DEFAULT_RETAIL_PRICE_MULTIPLIER } from './types';
import { calculateProductionCost, calculatePricingAndWholesale } from './lib/calculations';
import { solveTikTokListingPrice, DEFAULT_TIKTOK_FEES } from './lib/priceSolver';
import { loadTikTokFeeSettings, saveTikTokFeeSettings } from './lib/storage';

const DEFAULT_PARAMS: PrintingParams = {
  filamentWeightGrams: 64,
  printingTimeHours: 4,
  quantity: 1,
};

const DEFAULT_ADDITIONAL_COSTS: AdditionalCosts = {
  packagingCost: 0,
  otherCost: 0,
};

export function App() {
  const [params, setParams] = useState<PrintingParams>(DEFAULT_PARAMS);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCosts>(DEFAULT_ADDITIONAL_COSTS);
  const [retailMultiplier, setRetailMultiplier] = useState<number>(DEFAULT_RETAIL_PRICE_MULTIPLIER);
  const [isTikTokEnabled, setIsTikTokEnabled] = useState<boolean>(true);
  const [tiktokFees, setTiktokFees] = useState<TikTokFeeSettings>(DEFAULT_TIKTOK_FEES);

  // Load fee settings on mount
  useEffect(() => {
    const savedFees = loadTikTokFeeSettings();
    setTiktokFees(savedFees);
  }, []);

  // Update printing parameters
  const handleParamsChange = (updated: Partial<PrintingParams>) => {
    setParams((prev) => ({ ...prev, ...updated }));
  };

  // Update additional costs
  const handleAdditionalCostsChange = (updated: Partial<AdditionalCosts>) => {
    setAdditionalCosts((prev) => ({ ...prev, ...updated }));
  };

  // Update TikTok fee configuration
  const handleUpdateTikTokFees = (updated: Partial<TikTokFeeSettings>) => {
    setTiktokFees((prev) => {
      const next = { ...prev, ...updated };
      saveTikTokFeeSettings(next);
      return next;
    });
  };

  // Reset TikTok fees
  const handleResetTikTokFees = () => {
    setTiktokFees(DEFAULT_TIKTOK_FEES);
    saveTikTokFeeSettings(DEFAULT_TIKTOK_FEES);
  };

  // Reset all parameters to initial state
  const handleResetAll = () => {
    setParams(DEFAULT_PARAMS);
    setAdditionalCosts(DEFAULT_ADDITIONAL_COSTS);
    setRetailMultiplier(DEFAULT_RETAIL_PRICE_MULTIPLIER);
  };

  // 1. Calculate production cost
  const costBreakdown = useMemo(() => {
    return calculateProductionCost(params, additionalCosts);
  }, [params, additionalCosts]);

  // 2. Calculate retail and wholesale pricing
  const pricingResult = useMemo(() => {
    return calculatePricingAndWholesale(
      costBreakdown.totalProductionCost,
      params.quantity,
      retailMultiplier
    );
  }, [costBreakdown.totalProductionCost, params.quantity, retailMultiplier]);

  // 3. Calculate TikTok Shop solver
  const tiktokResult = useMemo(() => {
    if (!isTikTokEnabled) return undefined;
    return solveTikTokListingPrice(
      pricingResult.applicableUnitPrice,
      costBreakdown.totalProductionCost,
      tiktokFees,
      params.quantity
    );
  }, [
    isTikTokEnabled,
    pricingResult.applicableUnitPrice,
    costBreakdown.totalProductionCost,
    tiktokFees,
    params.quantity,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header onReset={handleResetAll} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Top 4 Summary Cards */}
        <TopSummaryCards
          pricingResult={pricingResult}
          isTikTokEnabled={isTikTokEnabled}
          tiktokResult={tiktokResult}
          quantity={params.quantity}
        />

        {/* 1. Thông số in */}
        <PrintingParamsSection
          params={params}
          onChange={handleParamsChange}
        />

        {/* 2. Chi phí phụ trợ */}
        <AdditionalCostsSection
          costs={additionalCosts}
          onChange={handleAdditionalCostsChange}
        />

        {/* 3. Chi phí sản xuất & Giá vốn */}
        <CostBreakdownSection
          breakdown={costBreakdown}
          params={params}
        />

        {/* 4. Định giá & Báo giá khách hàng */}
        <RetailPricingSection
          pricing={pricingResult}
          multiplier={retailMultiplier}
          onMultiplierChange={setRetailMultiplier}
        />

        {/* 5. Giá sỉ theo số lượng */}
        <WholesaleSection
          pricing={pricingResult}
          quantity={params.quantity}
          onSetQuantity={(qty) => handleParamsChange({ quantity: qty })}
        />

        {/* 6. TikTok Shop */}
        <TikTokShopSection
          isEnabled={isTikTokEnabled}
          onToggle={setIsTikTokEnabled}
          pricing={pricingResult}
          tiktokResult={tiktokResult}
          feeSettings={tiktokFees}
          onUpdateFees={handleUpdateTikTokFees}
          onResetFees={handleResetTikTokFees}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 <strong className="text-slate-200">3D Price Calculator</strong> — Công cụ tính giá vốn & tối ưu bán hàng TikTok Shop.
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Định mức: 150đ/g nhựa | 4.000đ/kg điện | 2.500đ/h máy | Hệ số giá lẻ {retailMultiplier}x
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
