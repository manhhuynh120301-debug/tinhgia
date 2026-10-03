/**
 * @file lib/threeMF/parsers/BambuStudioParser.ts
 * Adapter for Bambu Studio 3MF projects.
 *
 * Extracts:
 * - Multi-plate definitions from Metadata/slice_info.xml
 * - Prediction print time in seconds
 * - Multi-filament usage (weight in grams, length, type, color)
 * - Object mappings per plate
 * - Embedded plate G-code if available
 * - Printer profile (e.g. Bambu Lab X1C, P1S, A1, A1 mini)
 */

import JSZip from 'jszip';
import { BaseSlicerParser } from './BaseSlicerParser';
import { PlateInfo, ThreeMFMetadata, FilamentUsage, ObjectInfo } from '../../../types/threeMF';
import { analyzeGcode } from '../../gcodeAnalyzer';

export class BambuStudioParser extends BaseSlicerParser {
  readonly slicerName: string = 'Bambu Studio';

  async matches(fileList: string[], zip: JSZip): Promise<boolean> {
    const hasSliceInfo = fileList.some((f) => /metadata\/slice_info\.xml$/i.test(f));
    const hasBambuConfig = fileList.some((f) => /metadata\/(?:project_settings|model_settings)\.config$/i.test(f));
    const hasBambuModel = fileList.some((f) => /metadata\/.*bambu.*/i.test(f));

    if (hasSliceInfo) {
      const sliceInfo = await this.readTextFile(zip, 'Metadata/slice_info.xml') || 
                            await this.readTextFile(zip, 'metadata/slice_info.xml');
      if (sliceInfo) {
        if (/bambu\s*studio/i.test(sliceInfo)) return true;
        // If it doesn't mention OrcaSlicer explicitly, could be Bambu
        if (!/orcaslicer/i.test(sliceInfo) && (hasBambuConfig || hasBambuModel)) return true;
      }
    }

    return hasBambuConfig || hasBambuModel;
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

    // 1. Check slice_info.xml
    const sliceInfoPath = fileList.find((f) => /metadata\/slice_info\.xml$/i.test(f));
    let sliceInfoXml: string | null = null;
    if (sliceInfoPath) {
      metadata.detectedFiles?.push(sliceInfoPath);
      sliceInfoXml = await this.readTextFile(zip, sliceInfoPath);
    }

    // 2. Check project / model configs for printer profile
    const configPath = fileList.find((f) => /metadata\/project_settings\.config$/i.test(f));
    if (configPath) {
      metadata.detectedFiles?.push(configPath);
      const configStr = await this.readTextFile(zip, configPath);
      if (configStr) {
        try {
          const cfg = JSON.parse(configStr);
          if (cfg.printer_model) metadata.printer = cfg.printer_model;
          if (cfg.version) metadata.slicerVersion = cfg.version;
          if (cfg.layer_height) metadata.layerHeightMm = parseFloat(cfg.layer_height);
        } catch {
          // May be key-value format
          const printerMatch = configStr.match(/(?:printer_model|printer_name)\s*=\s*["']?([^"'\r\n]+)/i);
          if (printerMatch) metadata.printer = printerMatch[1].trim();
        }
      }
    }

    const plates: PlateInfo[] = [];

    // Parse slice_info.xml if available
    if (sliceInfoXml) {
      const doc = this.parseXml(sliceInfoXml);
      if (doc) {
        const header = doc.querySelector('header');
        if (header) {
          const sw = header.querySelector('software')?.textContent?.trim();
          if (sw) metadata.slicer = sw;
          const ver = header.querySelector('version')?.textContent?.trim();
          if (ver) metadata.slicerVersion = ver;
        }

        const plateElements = doc.querySelectorAll('plate');
        plateElements.forEach((pElem, idx) => {
          const plateIndex = parseInt(pElem.querySelector('plate_index')?.textContent || String(idx + 1), 10);
          const plateName = pElem.querySelector('plate_name')?.textContent?.trim() || `Bàn in ${plateIndex}`;
          
          // Prediction is print time in seconds
          const predictionText = pElem.querySelector('prediction')?.textContent?.trim();
          const printTimeSeconds = predictionText ? parseInt(predictionText, 10) : 0;

          // Filament list
          const filamentNodes = pElem.querySelectorAll('filament');
          const filaments: FilamentUsage[] = [];
          let plateFilamentWeight = 0;

          filamentNodes.forEach((fNode, fIdx) => {
            const fId = fNode.getAttribute('id') || String(fIdx + 1);
            const type = fNode.getAttribute('type') || 'PLA';
            const color = fNode.getAttribute('color') || undefined;
            const usedGText = fNode.getAttribute('used_g');
            const usedMText = fNode.getAttribute('used_m');
            
            const usedG = usedGText ? parseFloat(usedGText) : 0;
            const usedM = usedMText ? parseFloat(usedMText) : 0;

            const density = type.toUpperCase().includes('PETG') ? 1.27 : 1.24;
            const diameter = 1.75;
            const lengthMm = usedM * 1000;
            const volumeMm3 = lengthMm * (Math.PI * Math.pow(diameter / 2, 2));

            const weight = usedG > 0 ? usedG : Math.round((volumeMm3 / 1000) * density * 100) / 100;
            plateFilamentWeight += weight;

            filaments.push({
              id: `filament_${fId}`,
              material: type,
              color,
              diameter,
              density,
              lengthMm: Math.round(lengthMm * 10) / 10,
              volumeMm3: Math.round(volumeMm3 * 10) / 10,
              weightGrams: Math.round(weight * 100) / 100,
            });
          });

          // Objects on plate
          const objectNodes = pElem.querySelectorAll('object');
          const objects: ObjectInfo[] = [];
          objectNodes.forEach((oNode) => {
            const oId = oNode.getAttribute('id') || '';
            const oName = oNode.getAttribute('name') || modelObjects.get(oId)?.name || `Mẫu #${oId}`;
            objects.push({
              id: oId,
              name: oName,
            });
          });

          // If no objects explicitly defined in plate element, fallback to model objects
          if (objects.length === 0 && plateElements.length === 1) {
            modelObjects.forEach((obj) => objects.push(obj));
          }

          const hasSlicedMetrics = printTimeSeconds > 0 || plateFilamentWeight > 0;
          if (hasSlicedMetrics) isSliced = true;

          plates.push({
            id: `plate_${plateIndex}`,
            plateIndex,
            name: plateName,
            objects,
            objectCount: objects.length > 0 ? objects.length : 1,
            filament: filaments,
            totalFilamentWeightGrams: Math.round(plateFilamentWeight * 100) / 100,
            printTimeSeconds,
            slicer: metadata.slicer || this.slicerName,
            printer: metadata.printer,
            source: hasSlicedMetrics ? 'SLICER_RESULT' : 'UNAVAILABLE',
            warnings: [],
          });
        });
      }
    }

    // Check for plate gcode files if slice_info didn't have data or wasn't present
    const gcodeFiles = fileList.filter((f) => /metadata\/plate_\d+\.gcode$/i.test(f) || /plate_\d+\.gcode$/i.test(f));
    if (gcodeFiles.length > 0) {
      metadata.hasGcode = true;
      for (const gcodePath of gcodeFiles) {
        const plateIndexMatch = gcodePath.match(/plate_(\d+)\.gcode/i);
        const pIdx = plateIndexMatch ? parseInt(plateIndexMatch[1], 10) : plates.length + 1;
        const existingPlate = plates.find((p) => p.plateIndex === pIdx);

        // If existing plate already has valid slicer result, we don't need to re-analyze gcode
        if (existingPlate && existingPlate.source === 'SLICER_RESULT' && existingPlate.printTimeSeconds > 0) {
          continue;
        }

        const gcodeContent = await this.readTextFile(zip, gcodePath);
        if (gcodeContent) {
          const analysis = analyzeGcode(gcodeContent);
          if (analysis.totalFilamentWeightGrams > 0 || analysis.printTimeSeconds > 0) {
            isSliced = true;
            if (analysis.slicerDetected && !metadata.slicer) metadata.slicer = analysis.slicerDetected;
            if (analysis.printerDetected && !metadata.printer) metadata.printer = analysis.printerDetected;

            if (existingPlate) {
              existingPlate.printTimeSeconds = analysis.printTimeSeconds || existingPlate.printTimeSeconds;
              existingPlate.totalFilamentWeightGrams = analysis.totalFilamentWeightGrams || existingPlate.totalFilamentWeightGrams;
              if (analysis.filaments.length > 0) existingPlate.filament = analysis.filaments;
              existingPlate.layerCount = analysis.layerCount;
              existingPlate.source = 'GCODE_ANALYSIS';
            } else {
              plates.push({
                id: `plate_${pIdx}`,
                plateIndex: pIdx,
                name: analysis.plateName || `Bàn in ${pIdx}`,
                objects: Array.from(modelObjects.values()),
                objectCount: modelObjects.size > 0 ? modelObjects.size : 1,
                filament: analysis.filaments,
                totalFilamentWeightGrams: analysis.totalFilamentWeightGrams,
                printTimeSeconds: analysis.printTimeSeconds,
                layerCount: analysis.layerCount,
                slicer: metadata.slicer || this.slicerName,
                printer: metadata.printer,
                source: 'GCODE_ANALYSIS',
                warnings: analysis.warnings,
              });
            }
          }
        }
      }
    }

    // Equal-share estimation calculation for object previews if multiple objects exist on plate
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
