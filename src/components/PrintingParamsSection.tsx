/**
 * @file components/PrintingParamsSection.tsx
 * Section 1: Thông số in (Khối lượng nhựa, Thời gian in, Số lượng mẫu trên bàn in, Số lượng đặt).
 */

import React from 'react';
import { Scale, Clock, Boxes, PackageCheck, Info, FileBox, Sparkles, X } from 'lucide-react';
import { PrintingParams } from '../types';
import { formatNumberVN, formatSecondsDuration } from '../lib/formatters';

export interface ImportedSourceSummary {
  fileName: string;
  slicer?: string;
  printer?: string;
  plateCount: number;
  selectedPlateNames: string[];
  totalPrintTimeSeconds: number;
}

interface PrintingParamsSectionProps {
  params: PrintingParams;
  onChange: (updated: Partial<PrintingParams>) => void;
  onOpenThreeMFModal: () => void;
  importedSourceSummary?: ImportedSourceSummary | null;
  onClearImportedSource?: () => void;
}

export const PrintingParamsSection: React.FC<PrintingParamsSectionProps> = ({
  params,
  onChange,
  onOpenThreeMFModal,
  importedSourceSummary,
  onClearImportedSource,
}) => {
  const itemsPerPlate = Math.max(1, params.itemsPerPlate || 1);
  const unitWeight = params.filamentWeightGrams / itemsPerPlate;
  const unitHours = params.printingTimeHours / itemsPerPlate;

  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40 space-y-4">
      {/* Header with 3MF Import Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
              Thông số in 3D
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Nhập thủ công hoặc trích xuất tự động từ file .3MF
            </span>
          </div>
        </div>

        {/* Action Button: Import .3MF */}
        <button
          type="button"
          onClick={onOpenThreeMFModal}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 border border-teal-500/40 text-teal-300 hover:text-white text-xs font-bold transition-all shadow-sm hover:shadow-teal-500/20 cursor-pointer"
        >
          <FileBox className="w-4 h-4 text-teal-400" />
          <span>Import File .3MF</span>
          <span className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
            Orca • Bambu • Creality • Prusa
          </span>
        </button>
      </div>

      {/* Active 3MF Sync Banner */}
      {importedSourceSummary && (
        <div className="bg-teal-950/40 border border-teal-500/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-300 flex items-center gap-2">
                <span>Đã nạp số liệu từ: {importedSourceSummary.fileName}</span>
                {importedSourceSummary.slicer && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {importedSourceSummary.slicer}
                  </span>
                )}
                {importedSourceSummary.printer && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {importedSourceSummary.printer}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {importedSourceSummary.plateCount} bàn in ({importedSourceSummary.selectedPlateNames.join(', ')}) •{' '}
                {importedSourceSummary.totalPrintTimeSeconds > 0 &&
                  `${formatSecondsDuration(importedSourceSummary.totalPrintTimeSeconds)} • `}
                {formatNumberVN(params.filamentWeightGrams, 1)}g nhựa • {params.itemsPerPlate} mẫu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={onOpenThreeMFModal}
              className="text-xs text-teal-300 hover:text-white underline font-medium cursor-pointer"
            >
              Xem / Đổi plate
            </button>
            {onClearImportedSource && (
              <button
                type="button"
                onClick={onClearImportedSource}
                title="Bỏ liên kết file 3MF"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {itemsPerPlate > 1
              ? `≈ ${formatNumberVN(unitWeight, 1)}g / 1 mẫu`
              : 'Tổng nhựa cả bàn in'}
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
            {itemsPerPlate > 1
              ? `≈ ${formatNumberVN(unitHours, 2)}h / 1 mẫu`
              : 'Tổng thời gian cả bàn'}
          </p>
        </div>

        {/* 3. Số lượng mẫu trên bàn in (MỚI) */}
        <div>
          <label
            htmlFor="itemsPerPlate"
            className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"
          >
            <Boxes className="w-3.5 h-3.5 text-violet-400" />
            <span>Mẫu trên bàn in</span>
            <span className="text-slate-400 font-normal">(mẫu)</span>
          </label>
          <div className="relative">
            <input
              id="itemsPerPlate"
              type="number"
              min="1"
              step="1"
              value={params.itemsPerPlate === 0 ? '' : params.itemsPerPlate}
              placeholder="1"
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onChange({ itemsPerPlate: Math.max(1, isNaN(val) ? 1 : val) });
              }}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-base font-bold transition-all outline-hidden pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
              mẫu
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {[1, 2, 4, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ itemsPerPlate: n })}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  itemsPerPlate === n
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Số lượng đặt (cái) */}
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

      {/* Helpful Info Callout when multiple items are on the plate */}
      {itemsPerPlate > 1 && (
        <div className="bg-violet-950/20 border border-violet-500/30 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs text-violet-300">
          <Info className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            Bàn in gồm <strong className="font-mono text-white">{itemsPerPlate} mẫu</strong>. Giá vốn bên dưới được tính chính xác cho <strong className="text-white">1 sản phẩm</strong> ({formatNumberVN(unitWeight, 1)}g nhựa & {formatNumberVN(unitHours, 2)}h máy).
          </span>
        </div>
      )}
    </section>
  );
};
