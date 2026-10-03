/**
 * @file components/ThreeMF/ThreeMFImportModal.tsx
 * Comprehensive modal for 3MF file import, multi-slicer metadata inspection,
 * multi-plate review, and data application to the 3D price calculator.
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileBox,
  Layers,
  Clock,
  Scale,
  CheckCircle2,
  AlertTriangle,
  X,
  Printer,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  ShieldAlert,
  Cpu,
  Boxes,
} from 'lucide-react';
import {
  ThreeMFProject,
  PlateInfo,
  SlicerEngine,
} from '../../types/threeMF';
import { parseThreeMFFile } from '../../lib/threeMF/parserClient';
import { SlicerEngineRegistry } from '../../lib/threeMF/engines';
import { formatNumberVN, formatSecondsDuration } from '../../lib/formatters';

interface ThreeMFImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (data: {
    filamentWeightGrams: number;
    printingTimeHours: number;
    itemsPerPlate: number;
    sourceSummary: {
      fileName: string;
      slicer?: string;
      printer?: string;
      plateCount: number;
      selectedPlateNames: string[];
      totalPrintTimeSeconds: number;
    };
  }) => void;
}

export const ThreeMFImportModal: React.FC<ThreeMFImportModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [project, setProject] = useState<ThreeMFProject | null>(null);
  const [selectedPlateIds, setSelectedPlateIds] = useState<Set<string>>(new Set());
  const [showEngineDetails, setShowEngineDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const engines: SlicerEngine[] = SlicerEngineRegistry.getAll();

  const handleFileProcess = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.3mf')) {
      alert('Vui lòng chọn tệp tin có định dạng .3mf');
      return;
    }

    setIsLoading(true);
    setLoadingStatus('Đang mở container 3MF...');
    try {
      const parsedProject = await parseThreeMFFile(file, (msg) => {
        setLoadingStatus(msg);
      });
      setProject(parsedProject);
      // Select all plates by default if sliced
      const initialSelected = new Set<string>();
      parsedProject.plates.forEach((p) => initialSelected.add(p.id));
      setSelectedPlateIds(initialSelected);
    } catch (err: unknown) {
      alert(`Không thể phân tích file 3MF: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const togglePlate = (plateId: string) => {
    setSelectedPlateIds((prev) => {
      const next = new Set(prev);
      if (next.has(plateId)) {
        if (next.size > 1) {
          next.delete(plateId);
        }
      } else {
        next.add(plateId);
      }
      return next;
    });
  };

  const selectAllPlates = () => {
    if (!project) return;
    const all = new Set<string>();
    project.plates.forEach((p) => all.add(p.id));
    setSelectedPlateIds(all);
  };

  const selectSinglePlate = (plateId: string) => {
    setSelectedPlateIds(new Set([plateId]));
  };

  // Selected plates calculation
  const selectedPlates: PlateInfo[] = project
    ? project.plates.filter((p) => selectedPlateIds.has(p.id))
    : [];

  const aggregateGrams = Math.round(
    selectedPlates.reduce((sum, p) => sum + p.totalFilamentWeightGrams, 0) * 100
  ) / 100;

  const aggregateSeconds = selectedPlates.reduce((sum, p) => sum + p.printTimeSeconds, 0);
  const aggregateHours = Math.round((aggregateSeconds / 3600) * 100) / 100;
  const aggregateObjects = selectedPlates.reduce((sum, p) => sum + p.objectCount, 0);

  const handleApply = () => {
    if (!project || selectedPlates.length === 0) return;

    onApplyData({
      filamentWeightGrams: aggregateGrams,
      printingTimeHours: aggregateHours,
      itemsPerPlate: aggregateObjects > 0 ? aggregateObjects : 1,
      sourceSummary: {
        fileName: project.fileName,
        slicer: project.metadata.slicer,
        printer: project.metadata.printer,
        plateCount: selectedPlates.length,
        selectedPlateNames: selectedPlates.map((p) => p.name),
        totalPrintTimeSeconds: aggregateSeconds,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <FileBox className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Nhập file 3MF & Tự động phân tích
                <span className="text-[11px] font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded-full">
                  Real Slicer Metadata
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tương thích Creality Print, OrcaSlicer, Bambu Studio, PrusaSlicer (ZIP container)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* File Picker / Dropzone */}
          {!project && !isLoading && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-teal-400 bg-teal-500/10'
                  : 'border-slate-700 hover:border-teal-500/60 bg-slate-950/40 hover:bg-slate-950/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".3mf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-3.5 shadow-lg shadow-teal-500/10">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-200">
                Kéo thả file <span className="text-teal-400 font-mono">.3mf</span> vào đây hoặc bấm để chọn tệp
              </p>
              <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
                Hệ thống sẽ đọc trực tiếp ZIP container, trích xuất cấu hình multi-plate, filament grams, thời gian in và G-code thực tế từ slicer.
              </p>

              {/* Supported slicers bar */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-medium text-slate-400">Hỗ trợ tự động:</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  OrcaSlicer
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  Bambu Studio
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  Creality Print
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  PrusaSlicer
                </span>
              </div>
            </div>
          )}

          {/* Loading state with non-blocking Web Worker */}
          {isLoading && (
            <div className="py-14 text-center space-y-4">
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 animate-ping" />
                <div className="w-12 h-12 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-white">Đang phân tích 3MF trong Web Worker...</h4>
                <p className="text-xs text-teal-400 font-mono">{loadingStatus}</p>
                <p className="text-[11px] text-slate-400">Không làm đơ giao diện người dùng.</p>
              </div>
            </div>
          )}

          {/* Parsed Project Details */}
          {project && (
            <div className="space-y-5">
              {/* Top File & Slicer Badge Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <FileBox className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      {project.fileName}
                      <span className="text-[10px] font-mono text-slate-400">
                        ({Math.round(project.fileSize / 1024)} KB)
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-teal-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        Slicer: <strong>{project.metadata.slicer || 'Không xác định'}</strong>
                      </span>
                      {project.metadata.printer && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Printer className="w-3.5 h-3.5" />
                          Máy in: <strong>{project.metadata.printer}</strong>
                        </span>
                      )}
                      {project.metadata.layerHeightMm && (
                        <span>Layer: {project.metadata.layerHeightMm}mm</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* State Tag & Re-upload button */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      project.state === 'SLICED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : project.state === 'CONFIGURED'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {project.state === 'SLICED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {project.state === 'CONFIGURED' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {project.state === 'MODEL_ONLY' && <Info className="w-3.5 h-3.5" />}
                    {project.state}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setProject(null);
                      setSelectedPlateIds(new Set());
                    }}
                    className="text-xs px-2.5 py-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Đổi file
                  </button>
                </div>
              </div>

              {/* Strict Notice if File is NOT sliced */}
              {project.state !== 'SLICED' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs space-y-2 text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    Không thể xác định chính xác lượng filament và thời gian in từ file này.
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Theo nguyên tắc kỹ thuật <strong>không tạo số liệu giả / ước lượng mơ hồ</strong>: File 3MF này chỉ chứa mô hình 3D hoặc cài đặt thông số sơ bộ, <strong>chưa chứa kết quả cắt lớp (G-code / Slice Info)</strong> từ slicer.
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-amber-500/20">
                    <span className="text-amber-300/80">
                      Gợi ý: Mở file trong Slicer ({project.metadata.slicer || 'Orca/Bambu/Creality/Prusa'}) &rarr; bấm <strong>Slice plate</strong> &rarr; Export 3MF hoặc G-code.
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowEngineDetails(!showEngineDetails)}
                      className="text-amber-400 underline hover:text-amber-300 font-semibold cursor-pointer"
                    >
                      {showEngineDetails ? 'Ẩn Slicer Engine' : 'Xem Slicer Engine'}
                    </button>
                  </div>
                </div>
              )}

              {/* Slicer Engine Registry Panel */}
              {showEngineDetails && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <Cpu className="w-4 h-4 text-teal-400" />
                    Trạng thái các Slicer Engine trong kiến trúc hệ thống
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {engines.map((eng) => (
                      <div
                        key={eng.id}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-white font-medium">{eng.name}</strong>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Browser: Chờ Backend Native
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {eng.unavailabilityReason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plates Multi-Selection List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-400" />
                    <h4 className="text-sm font-bold text-white">
                      Danh sách Bàn in ({project.plates.length} plate)
                    </h4>
                  </div>
                  {project.plates.length > 1 && (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={selectAllPlates}
                        className="text-teal-400 hover:underline cursor-pointer font-medium"
                      >
                        Chọn tất cả plates
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {project.plates.map((plate) => {
                    const isSelected = selectedPlateIds.has(plate.id);
                    return (
                      <div
                        key={plate.id}
                        className={`rounded-xl border transition-all p-4 ${
                          isSelected
                            ? 'bg-slate-900/90 border-teal-500/60 shadow-lg shadow-teal-500/5'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => togglePlate(plate.id)}
                              className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-teal-500 text-slate-950'
                                  : 'border border-slate-600 bg-slate-800'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-white">{plate.name}</h5>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                  {plate.objectCount} mẫu
                                </span>
                                {plate.source === 'SLICER_RESULT' && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                                    Slicer Metadata
                                  </span>
                                )}
                                {plate.source === 'GCODE_ANALYSIS' && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold">
                                    G-Code Analyzed
                                  </span>
                                )}
                              </div>

                              {/* Objects list */}
                              {plate.objects.length > 0 && (
                                <p className="text-xs text-slate-400 mt-1">
                                  Chi tiết: {plate.objects.map((o) => o.name).join(', ')}
                                </p>
                              )}

                              {/* Filament breakdown tags */}
                              {plate.filament.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                  {plate.filament.map((f, fIdx) => (
                                    <span
                                      key={fIdx}
                                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300"
                                    >
                                      {f.color && (
                                        <span
                                          className="w-2.5 h-2.5 rounded-full border border-slate-600"
                                          style={{ backgroundColor: f.color }}
                                        />
                                      )}
                                      <span>
                                        {f.material || 'PLA'}:{' '}
                                        <strong className="text-white">
                                          {formatNumberVN(f.weightGrams, 1)}g
                                        </strong>
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Plate Metrics */}
                          <div className="flex items-center gap-4 sm:text-right shrink-0">
                            <div>
                              <div className="text-[11px] text-slate-400">Khối lượng nhựa</div>
                              <div className="text-sm font-bold text-teal-400 font-mono">
                                {plate.totalFilamentWeightGrams > 0
                                  ? `${formatNumberVN(plate.totalFilamentWeightGrams, 1)}g`
                                  : 'Chưa có dữ liệu'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[11px] text-slate-400">Thời gian in</div>
                              <div className="text-sm font-bold text-cyan-400 font-mono">
                                {plate.printTimeSeconds > 0
                                  ? formatSecondsDuration(plate.printTimeSeconds)
                                  : 'Chưa có dữ liệu'}
                              </div>
                            </div>
                            {project.plates.length > 1 && (
                              <button
                                type="button"
                                onClick={() => selectSinglePlate(plate.id)}
                                className="text-xs px-2 py-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                              >
                                Chỉ chọn bàn này
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Aggregated Metrics & Action Button */}
        {project && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Boxes className="w-4 h-4 text-teal-400" />
                <span>
                  Đã chọn:{' '}
                  <strong className="text-white">
                    {selectedPlates.length} plate ({aggregateObjects} mẫu)
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Scale className="w-4 h-4 text-teal-400" />
                <span>
                  Tổng nhựa:{' '}
                  <strong className="text-teal-300 font-mono">
                    {formatNumberVN(aggregateGrams, 1)}g
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>
                  Tổng thời gian:{' '}
                  <strong className="text-cyan-300 font-mono">
                    {aggregateSeconds > 0 ? formatSecondsDuration(aggregateSeconds) : '0s'} (
                    {aggregateHours}h)
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={aggregateGrams === 0 && aggregateSeconds === 0}
                onClick={handleApply}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-lg cursor-pointer ${
                  aggregateGrams > 0 || aggregateSeconds > 0
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-teal-500/25'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Áp dụng vào Máy tính giá</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
