/**
 * @file types/threeMF.ts
 * Strongly typed domain models for 3MF project import, multi-plate aggregation,
 * slicer detection, and slicer engine abstraction.
 *
 * Strictly adheres to the "NO MOCK DATA" principle:
 * Real slicer metadata & G-code analysis only.
 */

export type ThreeMFState =
  | 'MODEL_ONLY'    // Pure 3D geometry (3D/3dmodel.model), no slicer configs or slice results
  | 'CONFIGURED'    // Slicer profiles present (printer/filament/speed), but NOT sliced yet
  | 'SLICED'        // Contains slice results (slice_info.xml or embedded plate G-code)
  | 'INVALID'       // Corrupted ZIP or missing valid 3MF manifest/model
  | 'UNSUPPORTED';  // Recognized archive but incompatible structure

export type SlicerSource = 'SLICER_RESULT' | 'GCODE_ANALYSIS' | 'UNAVAILABLE';

export interface FilamentUsage {
  id: string; // e.g. "filament_1", "1"
  material?: string; // e.g. "PLA", "PETG", "ABS", "TPU"
  color?: string; // hex #RRGGBB or color name
  diameter?: number; // mm (default 1.75mm)
  density?: number; // g/cm³ (e.g. 1.24 for PLA)
  lengthMm?: number; // Extruded length in millimeters
  volumeMm3?: number; // Extruded volume in mm³
  weightGrams: number; // Actual weight in grams (0 if unavailable)
}

export interface ObjectInfo {
  id: string;
  name: string;
  volumeMm3?: number;
  // Per-object data only if explicitly provided by slicer or marked as equal share
  isEqualShareEstimate?: boolean;
  estimatedWeightGrams?: number;
  estimatedTimeSeconds?: number;
}

export interface PlateInfo {
  id: string; // e.g. "plate_1", "1"
  plateIndex: number; // 1-based index
  name: string; // e.g. "Plate 1", "Mặt trên"
  objects: ObjectInfo[];
  objectCount: number;
  filament: FilamentUsage[];
  totalFilamentWeightGrams: number;
  printTimeSeconds: number; // Stored in integer seconds (source of truth)
  layerCount?: number;
  slicer?: string;
  printer?: string;
  source: SlicerSource;
  warnings: string[];
}

export interface FilamentProfile {
  id: string;
  type: string; // PLA, PETG, ABS...
  name?: string;
  color?: string;
  density: number; // g/cm³
  diameter: number; // mm
  temperature?: number; // °C
}

export interface ThreeMFMetadata {
  slicer?: string; // e.g. "Bambu Studio", "OrcaSlicer", "Creality Print", "PrusaSlicer"
  slicerVersion?: string;
  printer?: string; // e.g. "Bambu Lab P1S", "Creality K1 Max", "Prusa MK4"
  printProfileName?: string;
  nozzleDiameter?: number;
  layerHeightMm?: number;
  infillPercent?: number;
  filamentProfiles?: FilamentProfile[];
  hasGcode: boolean;
  detectedFiles: string[];
}

export interface ThreeMFProject {
  state: ThreeMFState;
  fileName: string;
  fileSize: number;
  metadata: ThreeMFMetadata;
  plates: PlateInfo[];
  
  // Multi-plate aggregation
  totalFilamentWeightGrams: number;
  totalPrintTimeSeconds: number;
  totalObjectCount: number;
  
  warnings: string[];
  errorMessage?: string;
  canSliceInBrowser: boolean;
  rawSlicerDetected?: string;
}

// ==========================================
// SLICER ENGINE ABSTRACTION
// ==========================================

export interface SliceOptions {
  layerHeightMm?: number;
  infillPercent?: number;
  speedMode?: 'standard' | 'silent' | 'sport' | 'ludicrous';
  supportEnabled?: boolean;
}

export interface SliceResult {
  success: boolean;
  plates?: PlateInfo[];
  gcode?: string;
  printTimeSeconds?: number;
  filamentWeightGrams?: number;
  error?: string;
}

export interface SlicerEngine {
  id: string;
  name: string;
  available: boolean;
  unavailabilityReason?: string;
  canSlice(project: ThreeMFProject): boolean;
  slice(project: ThreeMFProject, options?: SliceOptions): Promise<SliceResult>;
}
