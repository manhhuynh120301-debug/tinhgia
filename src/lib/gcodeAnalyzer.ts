/**
 * @file lib/gcodeAnalyzer.ts
 * Rigorous G-code parser and analyzer.
 *
 * Capabilities:
 * - Accurately tracks absolute (M82) and relative (M83) extrusion modes.
 * - Handles coordinate resets (G92 E0), tool changes (T0, T1, ...), and retracts.
 * - Never counts retraction or unretraction past current position as filament consumption.
 * - Parses exact slicer metadata comments from Bambu Studio, OrcaSlicer, Creality Print, PrusaSlicer, and Cura.
 * - Calculates filament length, volume, and mass using profile density & diameter.
 */

import { FilamentUsage } from '../types/threeMF';

export interface GcodeAnalysisResult {
  hasSlicerMetadata: boolean;
  slicerDetected?: string;
  printerDetected?: string;
  plateName?: string;
  printTimeSeconds: number; // Stored in seconds
  layerCount: number;
  filaments: FilamentUsage[];
  totalFilamentWeightGrams: number;
  totalFilamentLengthMm: number;
  totalFilamentVolumeMm3: number;
  warnings: string[];
}

export interface GcodeAnalyzerOptions {
  defaultDiameterMm?: number; // default 1.75
  defaultDensityGcm3?: number; // default 1.24 for PLA
  defaultMaterial?: string; // default "PLA"
  filamentProfiles?: Array<{
    toolIndex: number;
    material?: string;
    density?: number;
    diameter?: number;
    color?: string;
  }>;
}

/**
 * Parses time strings like:
 * - "2h 15m 30s"
 * - "1d 2h 45m"
 * - "45m 12s"
 * - "350s"
 * - "125m"
 * Returns integer seconds.
 */
export function parseSlicerTimeString(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toLowerCase();

  // If it's purely a number (e.g. Creality Print ;TIME:8120 or Cura ;TIME:12345)
  if (/^\d+(\.\d+)?$/.test(clean)) {
    return Math.round(parseFloat(clean));
  }

  let totalSeconds = 0;

  // Days
  const daysMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:d|day|days)/);
  if (daysMatch) {
    totalSeconds += parseFloat(daysMatch[1]) * 86400;
  }

  // Hours
  const hoursMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hours?)/);
  if (hoursMatch) {
    totalSeconds += parseFloat(hoursMatch[1]) * 3600;
  }

  // Minutes
  const minsMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins?|minutes?)/);
  if (minsMatch) {
    totalSeconds += parseFloat(minsMatch[1]) * 60;
  }

  // Seconds
  const secsMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|secs?|seconds?)/);
  if (secsMatch) {
    totalSeconds += parseFloat(secsMatch[1]);
  }

  return Math.round(totalSeconds);
}

/**
 * Analyzes G-code text content.
 */
export function analyzeGcode(
  gcodeContent: string,
  options: GcodeAnalyzerOptions = {}
): GcodeAnalysisResult {
  const defaultDiameter = options.defaultDiameterMm ?? 1.75;
  const defaultDensity = options.defaultDensityGcm3 ?? 1.24;
  const defaultMaterial = options.defaultMaterial ?? 'PLA';

  const warnings: string[] = [];
  let slicerDetected: string | undefined;
  let printerDetected: string | undefined;
  let plateName: string | undefined;

  let metadataTimeSeconds = 0;
  let metadataTotalGrams = 0;
  let metadataGramsPerTool = new Map<number, number>();
  let metadataLengthPerTool = new Map<number, number>();
  let metadataDensityPerTool = new Map<number, number>();
  let metadataMaterialPerTool = new Map<number, string>();
  let metadataLayerCount = 0;

  // Extrusion simulation state
  let isRelativeE = false; // M82 is default in reprap/marlin/bambu
  let currentE = 0;
  let maxAbsE = 0;
  let currentTool = 0;
  let maxZ = 0;
  let layerCountByZ = 0;
  let lastZ = -9999;

  // Map toolIndex -> extruded length mm
  const toolExtrudedMm = new Map<number, number>();

  const lines = gcodeContent.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    // 1. Check for Slicer comment metadata
    if (line.startsWith(';')) {
      const comment = line.substring(1).trim();

      // Slicer branding
      if (!slicerDetected) {
        if (/bambu\s*studio/i.test(comment)) slicerDetected = 'Bambu Studio';
        else if (/orcaslicer/i.test(comment)) slicerDetected = 'OrcaSlicer';
        else if (/creality\s*print/i.test(comment)) slicerDetected = 'Creality Print';
        else if (/prusaslicer/i.test(comment)) slicerDetected = 'PrusaSlicer';
        else if (/cura/i.test(comment)) slicerDetected = 'UltiMaker Cura';
      }

      // Printer model
      const printerMatch = comment.match(/(?:printer_model|printer_name|machine_type|printer)\s*=\s*(.+)/i);
      if (printerMatch && !printerDetected) {
        printerDetected = printerMatch[1].trim();
      }

      // Plate name
      const plateMatch = comment.match(/(?:plate_name|plate)\s*=\s*(.+)/i);
      if (plateMatch && !plateName) {
        plateName = plateMatch[1].trim();
      }

      // Time comments
      // e.g. "; estimated printing time (normal mode) = 2h 15m 30s"
      // or "; TIME:7200"
      // or "; model printing time: 1h 20m"
      const timeMatch = comment.match(/(?:estimated\s+printing\s+time(?:\s*\([^)]*\))?|model\s+printing\s+time|total\s+printing\s+time|TIME)\s*[:=]\s*(.+)/i);
      if (timeMatch && metadataTimeSeconds === 0) {
        metadataTimeSeconds = parseSlicerTimeString(timeMatch[1]);
      }

      // Filament comments
      // e.g. "; total filament used [g] = 34.52"
      // or "; filament used [g] = 34.52, 12.1"
      const totalGramsMatch = comment.match(/(?:total\s+filament\s+used\s*\[g\]|filament\s+used\s*\[g\])\s*=\s*(.+)/i);
      if (totalGramsMatch && metadataTotalGrams === 0) {
        const parts = totalGramsMatch[1].split(',').map((p) => parseFloat(p.trim())).filter((n) => !isNaN(n));
        if (parts.length > 0) {
          metadataTotalGrams = parts.reduce((acc, v) => acc + v, 0);
          parts.forEach((g, idx) => metadataGramsPerTool.set(idx, g));
        }
      }

      // Filament length in mm or m
      const lengthMatch = comment.match(/(?:total\s+filament\s+used\s*\[mm\]|filament\s+used\s*\[mm\]|filament\s+used\s*\[m\]|Filament\s+used)\s*[:=]\s*(.+)/i);
      if (lengthMatch) {
        const isMeter = /\[m\]|m$/i.test(comment);
        const parts = lengthMatch[1].replace(/m$/i, '').split(',').map((p) => parseFloat(p.trim())).filter((n) => !isNaN(n));
        parts.forEach((len, idx) => {
          const lenMm = isMeter ? len * 1000 : len;
          metadataLengthPerTool.set(idx, lenMm);
        });
      }

      // Filament density
      const densityMatch = comment.match(/filament_density\s*=\s*(.+)/i);
      if (densityMatch) {
        const parts = densityMatch[1].split(',').map((p) => parseFloat(p.trim())).filter((n) => !isNaN(n));
        parts.forEach((d, idx) => metadataDensityPerTool.set(idx, d));
      }

      // Filament type / material
      const typeMatch = comment.match(/(?:filament_type|material_type|filament_material)\s*=\s*(.+)/i);
      if (typeMatch) {
        const parts = typeMatch[1].split(',').map((p) => p.trim());
        parts.forEach((t, idx) => metadataMaterialPerTool.set(idx, t));
      }

      // Layer count comments
      const layerMatch = comment.match(/(?:total\s+layer\s+number|LAYER_COUNT|total_layers)\s*[:=]\s*(\d+)/i);
      if (layerMatch && metadataLayerCount === 0) {
        metadataLayerCount = parseInt(layerMatch[1], 10);
      }

      continue;
    }

    // 2. G-code commands
    const commandPart = line.split(';')[0].trim().toUpperCase();
    if (!commandPart) continue;

    // Extrusion mode
    if (commandPart === 'M82') {
      isRelativeE = false;
      continue;
    }
    if (commandPart === 'M83') {
      isRelativeE = true;
      continue;
    }

    // Tool change T0, T1, etc.
    const toolMatch = commandPart.match(/^T(\d+)/);
    if (toolMatch) {
      currentTool = parseInt(toolMatch[1], 10);
      continue;
    }

    // Coordinate reset
    if (commandPart.startsWith('G92')) {
      const eMatch = commandPart.match(/E(-?\d+(?:\.\d+)?)/);
      if (eMatch) {
        currentE = parseFloat(eMatch[1]);
        maxAbsE = currentE;
      }
      continue;
    }

    // Motion commands G0, G1, G2, G3
    if (/^G[0123]\b/.test(commandPart)) {
      // Check Z for layer calculation
      const zMatch = commandPart.match(/Z(-?\d+(?:\.\d+)?)/);
      if (zMatch) {
        const z = parseFloat(zMatch[1]);
        if (z > maxZ) {
          maxZ = z;
        }
        if (z > lastZ + 0.05) {
          layerCountByZ++;
          lastZ = z;
        }
      }

      // Check Extrusion E
      const eMatch = commandPart.match(/E(-?\d+(?:\.\d+)?)/);
      if (eMatch) {
        const targetE = parseFloat(eMatch[1]);
        let extrudedMm = 0;

        if (isRelativeE) {
          // Relative extrusion: positive values are extrusions
          if (targetE > 0) {
            extrudedMm = targetE;
          }
        } else {
          // Absolute extrusion:
          // If targetE > currentE, check if it extends past maxAbsE
          if (targetE > currentE) {
            // Unretraction or new extrusion
            if (targetE > maxAbsE) {
              extrudedMm = targetE - maxAbsE;
              maxAbsE = targetE;
            }
          }
          currentE = targetE;
          if (targetE > maxAbsE) {
            maxAbsE = targetE;
          }
        }

        if (extrudedMm > 0) {
          const currentTotal = toolExtrudedMm.get(currentTool) || 0;
          toolExtrudedMm.set(currentTool, currentTotal + extrudedMm);
        }
      }
    }
  }

  // 3. Aggregate Filaments
  const filaments: FilamentUsage[] = [];
  const allToolIndices = new Set<number>([
    ...Array.from(toolExtrudedMm.keys()),
    ...Array.from(metadataGramsPerTool.keys()),
    ...Array.from(metadataLengthPerTool.keys()),
  ]);

  if (allToolIndices.size === 0) {
    allToolIndices.add(0);
  }

  let calculatedTotalWeight = 0;
  let totalLengthMm = 0;
  let totalVolumeMm3 = 0;

  Array.from(allToolIndices).sort((a, b) => a - b).forEach((toolIdx) => {
    // Determine diameter & density
    const profile = options.filamentProfiles?.find((p) => p.toolIndex === toolIdx);
    const material = metadataMaterialPerTool.get(toolIdx) || profile?.material || defaultMaterial;
    const density = metadataDensityPerTool.get(toolIdx) || profile?.density || defaultDensity;
    const diameter = profile?.diameter || defaultDiameter;
    const color = profile?.color;

    // Extruded length
    const simulatedLength = toolExtrudedMm.get(toolIdx) || 0;
    const metaLength = metadataLengthPerTool.get(toolIdx);
    const effectiveLengthMm = metaLength !== undefined && metaLength > 0 ? metaLength : simulatedLength;

    // Volume = π * (diameter / 2)^2 * length
    const crossSectionArea = Math.PI * Math.pow(diameter / 2, 2);
    const volumeMm3 = effectiveLengthMm * crossSectionArea;
    const volumeCm3 = volumeMm3 / 1000;

    // Mass in grams:
    // If metadata explicitly has grams for this tool, prioritize it!
    const metaGrams = metadataGramsPerTool.get(toolIdx);
    let weightGrams = 0;

    if (metaGrams !== undefined && metaGrams > 0) {
      weightGrams = metaGrams;
    } else if (metadataTotalGrams > 0 && allToolIndices.size === 1) {
      weightGrams = metadataTotalGrams;
    } else if (volumeCm3 > 0) {
      weightGrams = volumeCm3 * density;
    }

    weightGrams = Math.round(weightGrams * 100) / 100;
    totalLengthMm += effectiveLengthMm;
    totalVolumeMm3 += volumeMm3;
    calculatedTotalWeight += weightGrams;

    filaments.push({
      id: `filament_${toolIdx}`,
      material,
      color,
      diameter,
      density,
      lengthMm: Math.round(effectiveLengthMm * 10) / 10,
      volumeMm3: Math.round(volumeMm3 * 10) / 10,
      weightGrams,
    });
  });

  const finalWeightGrams =
    metadataTotalGrams > 0
      ? metadataTotalGrams
      : Math.round(calculatedTotalWeight * 100) / 100;

  const finalLayerCount = metadataLayerCount > 0 ? metadataLayerCount : layerCountByZ;

  if (metadataTimeSeconds === 0 && finalWeightGrams > 0) {
    warnings.push('Không tìm thấy thông số thời gian in trong metadata G-code.');
  }

  return {
    hasSlicerMetadata: metadataTimeSeconds > 0 || metadataTotalGrams > 0,
    slicerDetected,
    printerDetected,
    plateName,
    printTimeSeconds: metadataTimeSeconds,
    layerCount: finalLayerCount,
    filaments,
    totalFilamentWeightGrams: finalWeightGrams,
    totalFilamentLengthMm: Math.round(totalLengthMm * 10) / 10,
    totalFilamentVolumeMm3: Math.round(totalVolumeMm3 * 10) / 10,
    warnings,
  };
}
