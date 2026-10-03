/**
 * @file lib/threeMF/parsers/OrcaSlicerParser.ts
 * Adapter for OrcaSlicer 3MF projects.
 */

import JSZip from 'jszip';
import { BambuStudioParser } from './BambuStudioParser';
import { PlateInfo, ThreeMFMetadata, ObjectInfo } from '../../../types/threeMF';

export class OrcaSlicerParser extends BambuStudioParser {
  override readonly slicerName: string = 'OrcaSlicer';

  override async matches(fileList: string[], zip: JSZip): Promise<boolean> {
    const sliceInfo = await this.readTextFile(zip, 'Metadata/slice_info.xml') || 
                      await this.readTextFile(zip, 'metadata/slice_info.xml');
    if (sliceInfo && /orcaslicer/i.test(sliceInfo)) {
      return true;
    }

    const hasOrcaFiles = fileList.some((f) => /orca/i.test(f));
    return hasOrcaFiles;
  }

  override async parse(
    zip: JSZip,
    fileList: string[],
    modelObjects: Map<string, ObjectInfo>
  ): Promise<{
    metadata: Partial<ThreeMFMetadata>;
    plates: PlateInfo[];
    isSliced: boolean;
    warnings: string[];
  }> {
    const result = await super.parse(zip, fileList, modelObjects);
    result.metadata.slicer = 'OrcaSlicer';
    for (const plate of result.plates) {
      plate.slicer = 'OrcaSlicer';
    }
    return result;
  }
}
