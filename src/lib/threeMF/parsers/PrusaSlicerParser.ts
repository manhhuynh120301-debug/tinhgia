/**
 * @file lib/threeMF/parsers/PrusaSlicerParser.ts
 * Adapter for PrusaSlicer (and SuperSlicer) 3MF project archives.
 */

import JSZip from 'jszip';
import { BaseSlicerParser } from './BaseSlicerParser';
import { PlateInfo, ThreeMFMetadata, ObjectInfo } from '../../../types/threeMF';
import { analyzeGcode } from '../../gcodeAnalyzer';

export class PrusaSlicerParser extends BaseSlicerParser {
  readonly slicerName: string = 'PrusaSlicer';

  async matches(fileList: string[], zip: JSZip): Promise<boolean> {
    const hasPrusaConfig = fileList.some((f) => 
      /metadata\/slic3r_pe/i.test(f) ||
      /metadata\/prusaslicer/i.test(f)
    );
    if (hasPrusaConfig) return true;

    // Check G-code headers
    const gcodeFiles = fileList.filter((f) => /\.gcode$/i.test(f));
    for (const gPath of gcodeFiles.slice(0, 2)) {
      const content = await this.readTextFile(zip, gPath);
      if (content && /prusaslicer/i.test(content)) {
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

    // Find Prusa configuration files
    const configFiles = fileList.filter((f) => 
      /metadata\/slic3r_pe.*\.config$/i.test(f) ||
      /metadata\/prusaslicer.*\.ini$/i.test(f)
    );

    let filamentDensity = 1.24;
    let filamentDiameter = 1.75;
    let filamentType = 'PLA';

    for (const cPath of configFiles) {
      metadata.detectedFiles?.push(cPath);
      const content = await this.readTextFile(zip, cPath);
      if (content) {
        // Printer model
        const printerMatch = content.match(/printer_model\s*=\s*(.+)/i);
        if (printerMatch && !metadata.printer) {
          metadata.printer = printerMatch[1].trim();
        }

        // Layer height
        const layerMatch = content.match(/layer_height\s*=\s*([0-9.]+)/i);
        if (layerMatch) {
          metadata.layerHeightMm = parseFloat(layerMatch[1]);
        }

        // Infill density
        const infillMatch = content.match(/fill_density\s*=\s*([0-9.]+)%?/i);
        if (infillMatch) {
          metadata.infillPercent = parseFloat(infillMatch[1]);
        }

        // Filament specs
        const densityMatch = content.match(/filament_density\s*=\s*([0-9.]+)/i);
        if (densityMatch) {
          filamentDensity = parseFloat(densityMatch[1]);
        }
        const diameterMatch = content.match(/filament_diameter\s*=\s*([0-9.]+)/i);
        if (diameterMatch) {
          filamentDiameter = parseFloat(diameterMatch[1]);
        }
        const typeMatch = content.match(/filament_type\s*=\s*(.+)/i);
        if (typeMatch) {
          filamentType = typeMatch[1].trim();
        }
      }
    }

    const plates: PlateInfo[] = [];
    const gcodeFiles = fileList.filter((f) => /\.gcode$/i.test(f));

    if (gcodeFiles.length > 0) {
      metadata.hasGcode = true;
      for (let idx = 0; idx < gcodeFiles.length; idx++) {
        const gPath = gcodeFiles[idx];
        metadata.detectedFiles?.push(gPath);
        const gcodeContent = await this.readTextFile(zip, gPath);
        if (gcodeContent) {
          const analysis = analyzeGcode(gcodeContent, {
            defaultDensityGcm3: filamentDensity,
            defaultDiameterMm: filamentDiameter,
            defaultMaterial: filamentType,
          });

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
    } else {
      // Config only, no sliced G-code
      const plateObjects = Array.from(modelObjects.values());
      plates.push({
        id: 'plate_1',
        plateIndex: 1,
        name: 'Bàn in 1 (Chưa cắt lớp)',
        objects: plateObjects,
        objectCount: plateObjects.length > 0 ? plateObjects.length : 1,
        filament: [],
        totalFilamentWeightGrams: 0,
        printTimeSeconds: 0,
        slicer: this.slicerName,
        printer: metadata.printer,
        source: 'UNAVAILABLE',
        warnings: ['Dự án PrusaSlicer có cấu hình nhưng chưa chứa kết quả cắt lớp (G-code).'],
      });
    }

    return {
      metadata,
      plates,
      isSliced,
      warnings,
    };
  }
}
