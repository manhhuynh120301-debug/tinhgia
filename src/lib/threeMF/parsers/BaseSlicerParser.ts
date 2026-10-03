/**
 * @file lib/threeMF/parsers/BaseSlicerParser.ts
 * Base class and XML/ZIP parsing utilities for slicer-specific adapters.
 */

import JSZip from 'jszip';
import { PlateInfo, ThreeMFMetadata, FilamentProfile, ObjectInfo } from '../../../types/threeMF';
import { parseUniversalXml, SimpleXmlNode } from './xmlHelper';

export abstract class BaseSlicerParser {
  abstract readonly slicerName: string;

  /**
   * Quick heuristic to check if this parser is suitable for the given 3MF file tree.
   */
  abstract matches(fileList: string[], zip: JSZip): Promise<boolean>;

  /**
   * Parses slicer-specific metadata, plates, filaments, and print times.
   */
  abstract parse(
    zip: JSZip,
    fileList: string[],
    modelObjects: Map<string, ObjectInfo>
  ): Promise<{
    metadata: Partial<ThreeMFMetadata>;
    plates: PlateInfo[];
    isSliced: boolean;
    warnings: string[];
  }>;

  /**
   * Helper to safely read a file as UTF-8 string from ZIP.
   */
  protected async readTextFile(zip: JSZip, path: string): Promise<string | null> {
    const file = zip.file(path);
    if (!file) return null;
    try {
      return await file.async('string');
    } catch {
      return null;
    }
  }

  /**
   * Helper to parse XML string into universal node tree.
   */
  protected parseXml(xmlString: string): SimpleXmlNode | null {
    return parseUniversalXml(xmlString);
  }
}
