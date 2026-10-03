/**
 * @file lib/threeMF/parsers/CrealityPrintParser.ts
 * Adapter for Creality Print 3MF projects (Creality Print 4.x & 5.x).
 */

import JSZip from 'jszip';
import { BaseSlicerParser } from './BaseSlicerParser';
import { PlateInfo, ThreeMFMetadata, ObjectInfo } from '../../../types/threeMF';
import { analyzeGcode } from '../../gcodeAnalyzer';

export class CrealityPrintParser extends BaseSlicerParser {
  readonly slicerName: string = 'Creality Print';

  async matches(fileList: string[], zip: JSZip): Promise<boolean> {
    const isCrealityFile = fileList.some((f) => 
      /creality/i.test(f) || 
      /cxsw/i.test(f) ||
      /Metadata\/CrealityPrint/i.test(f)
    );
    if (isCrealityFile) return true;

    // Check G-code headers if any
    const gcodeFiles = fileList.filter((f) => /\.gcode$/i.test(f));
    for (const gPath of gcodeFiles.slice(0, 2)) {
      const content = await this.readTextFile(zip, gPath);
      if (content && /creality\s*print/i.test(content)) {
        return true;
      }
    }

    return false;
  }

  async parse(
    zip: JSZip,
    fileList: string[],
    modelObjects: Map<string, ObjectInfo>
  ): Promise<{
    metadata: Partial<ThreeMFMetadata>;
    plates: PlateInfo[];
    isSliced: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    let isSliced = false;
    const metadata: Partial<ThreeMFMetadata> = {
      slicer: this.slicerName,
      detectedFiles: [],
    };

    // Check Creality JSON config files
    const jsonConfigs = fileList.filter((f) => /creality.*\.json$/i.test(f) || /metadata\/.*\.json$/i.test(f));
    for (const cPath of jsonConfigs) {
      metadata.detectedFiles?.push(cPath);
      const jsonStr = await this.readTextFile(zip, cPath);
      if (jsonStr) {
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.machine_model || parsed.printer_model) {
            metadata.printer = parsed.machine_model || parsed.printer_model;
          }
          if (parsed.layer_height) {
            metadata.layerHeightMm = parseFloat(parsed.layer_height);
          }
        } catch {
          // ignore
        }
      }
    }

    // Inspect G-code files
    const gcodeFiles = fileList.filter((f) => /\.gcode$/i.test(f));
    const plates: PlateInfo[] = [];

    if (gcodeFiles.length > 0) {
      metadata.hasGcode = true;
      for (let idx = 0; idx < gcodeFiles.length; idx++) {
        const gPath = gcodeFiles[idx];
        metadata.detectedFiles?.push(gPath);
        const gcodeContent = await this.readTextFile(zip, gPath);
        if (gcodeContent) {
          const analysis = analyzeGcode(gcodeContent);
          if (analysis.totalFilamentWeightGrams > 0 || analysis.printTimeSeconds > 0) {
            isSliced = true;
          }
          if (analysis.printerDetected && !metadata.printer) {
            metadata.printer = analysis.printerDetected;
          }

          const pIdx = idx + 1;
          const plateObjects = Array.from(modelObjects.values());
          plates.push({
            id: `plate_${pIdx}`,
            plateIndex: pIdx,
            name: analysis.plateName || `Bàn in ${pIdx}`,
            objects: plateObjects,
            objectCount: plateObjects.length > 0 ? plateObjects.length : 1,
            filament: analysis.filaments,
            totalFilamentWeightGrams: analysis.totalFilamentWeightGrams,
            printTimeSeconds: analysis.printTimeSeconds,
            layerCount: analysis.layerCount,
            slicer: this.slicerName,
            printer: metadata.printer,
            source: isSliced ? 'GCODE_ANALYSIS' : 'UNAVAILABLE',
            warnings: analysis.warnings,
          });
        }
      }
    }

    // Equal-share estimation calculation if multiple objects exist on plate
    for (const plate of plates) {
      if (plate.objects.length > 1 && plate.totalFilamentWeightGrams > 0) {
        const equalWeight = Math.round((plate.totalFilamentWeightGrams / plate.objects.length) * 100) / 100;
        const equalTime = Math.round(plate.printTimeSeconds / plate.objects.length);
        plate.objects.forEach((obj) => {
          obj.isEqualShareEstimate = true;
          obj.estimatedWeightGrams = equalWeight;
          obj.estimatedTimeSeconds = equalTime;
        });
      }
    }

    return {
      metadata,
      plates,
      isSliced,
      warnings,
    };
  }
}
