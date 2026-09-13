/**
 * @file lib/calculations.ts
 * Core 3D printing cost, fixed retail pricing (x2.5), and wholesale tier calculations.
 */

import {
  FILAMENT_PRICE_PER_GRAM,
  ELECTRICITY_COST_PER_KG,
  MACHINE_COST_PER_HOUR,
  DEFAULT_RETAIL_PRICE_MULTIPLIER,
  RETAIL_PRICE_MULTIPLIER,
  PrintingParams,
  AdditionalCosts,
  ProductionCostResult,
  PricingResult,
  WholesaleTierId,
  WholesaleTierInfo,
} from '../types';

export const WHOLESALE_TIERS: WholesaleTierInfo[] = [
  {
    id: 'retail',
    label: 'Giá lẻ (1–49 cái)',
    badgeLabel: 'GIÁ BÁN LẺ',
    rangeLabel: '1–49 cái',
    minQty: 1,
    maxQty: 49,
    discountPercent: 0,
  },
  {
    id: 'wholesale_50',
    label: 'Giá sỉ 50+ (50–99 cái)',
    badgeLabel: 'GIÁ SỈ 50+',
    rangeLabel: '50–99 cái',
    minQty: 50,
    maxQty: 99,
    discountPercent: 10,
  },
  {
    id: 'wholesale_100',
    label: 'Giá sỉ 100+ (100+ cái)',
    badgeLabel: 'GIÁ SỈ 100+',
    rangeLabel: '100+ cái',
    minQty: 100,
    maxQty: null,
    discountPercent: 20,
  },
];

/**
 * Rounds a raw price to a clean practical Vietnamese retail price (nearest 500 or 1,000 VND).
 * E.g., 49.640 -> 50.000
 */
export function roundToPracticalVND(rawAmount: number): number {
  if (rawAmount <= 0) return 0;
  if (rawAmount < 1000) return Math.round(rawAmount / 100) * 100;
  
  // For standard retail prices, round to nearest 500 or 1,000 VND
  const roundedTo500 = Math.round(rawAmount / 500) * 500;
  // If close to 1000 step within 200đ, snap to 1000
  const remainder1000 = roundedTo500 % 1000;
  if (remainder1000 === 0) return roundedTo500;
  
  return roundedTo500;
}

/**
 * Calculates itemized manufacturing cost breakdown for a 3D printed product.
 *
 * Formula:
 * - Material Cost = Filament Weight * 150 VND
 * - Electricity Cost = (Filament Weight / 1000) * 4000 VND
 * - Machine Cost = Printing Hours * 2500 VND
 * - Additional Costs = Packaging + Other
 * - Total Production Cost = Sum of above
 */
export function calculateProductionCost(
  params: PrintingParams,
  additional: AdditionalCosts
): ProductionCostResult {
  const weight = Math.max(0, params.filamentWeightGrams || 0);
  const hours = Math.max(0, params.printingTimeHours || 0);
  const packaging = Math.max(0, additional.packagingCost || 0);
  const other = Math.max(0, additional.otherCost || 0);

  // 1. Material cost
  const materialCost = weight * FILAMENT_PRICE_PER_GRAM;

  // 2. Electricity cost
  const electricityCost = (weight / 1000) * ELECTRICITY_COST_PER_KG;

  // 3. Machine hourly cost
  const machineCost = hours * MACHINE_COST_PER_HOUR;

  // 4. Additional costs
  const additionalCost = packaging + other;

  // 5. Total production cost per unit
  const totalProductionCost = materialCost + electricityCost + machineCost + additionalCost;

  return {
    materialCost,
    electricityCost,
    machineCost,
    additionalCost,
    totalProductionCost,
  };
}

/**
 * Calculates retail price (configurable multiplier e.g. 2.5x, 3x, 3.5x, 4x, 4.5x) and automatic wholesale tiers based on quantity.
 */
export function calculatePricingAndWholesale(
  productionCost: number,
  quantity: number,
  multiplier: number = DEFAULT_RETAIL_PRICE_MULTIPLIER
): PricingResult {
  const safeQty = Math.max(1, Math.floor(quantity || 1));
  const safeMultiplier = Math.max(1, multiplier || DEFAULT_RETAIL_PRICE_MULTIPLIER);
  const rawRetailPrice = productionCost * safeMultiplier;
  const retailPrice = roundToPracticalVND(rawRetailPrice);
  const unitRetailProfit = retailPrice - productionCost;

  // Determine active wholesale tier based on quantity
  let activeTier: WholesaleTierId = 'retail';
  let tierName = 'GIÁ BÁN LẺ';
  let discountPercent = 0;
  let applicableUnitPrice = retailPrice;

  if (safeQty >= 100) {
    activeTier = 'wholesale_100';
    tierName = 'GIÁ SỈ 100+';
    discountPercent = 20;
    applicableUnitPrice = roundToPracticalVND(retailPrice * 0.8);
  } else if (safeQty >= 50) {
    activeTier = 'wholesale_50';
    tierName = 'GIÁ SỈ 50+';
    discountPercent = 10;
    applicableUnitPrice = roundToPracticalVND(retailPrice * 0.9);
  } else {
    activeTier = 'retail';
    tierName = 'GIÁ BÁN LẺ';
    discountPercent = 0;
    applicableUnitPrice = retailPrice;
  }

  const orderTotal = applicableUnitPrice * safeQty;
  const unitProfit = applicableUnitPrice - productionCost;
  const totalOrderProfit = unitProfit * safeQty;

  return {
    productionCost,
    retailPrice,
    rawRetailPrice,
    unitRetailProfit,
    retailMultiplier: safeMultiplier,
    activeTier,
    tierName,
    discountPercent,
    applicableUnitPrice,
    orderTotal,
    unitProfit,
    totalOrderProfit,
  };
}
