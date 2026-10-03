/**
 * @file lib/threeMF/engines/CrealitySlicerEngine.ts
 * Creality Print Engine abstraction.
 */

import { SlicerEngine, ThreeMFProject, SliceOptions, SliceResult } from '../../../types/threeMF';

export class CrealitySlicerEngine implements SlicerEngine {
  readonly id = 'crealityprint';
  readonly name = 'Creality Print Engine';
  readonly available = false;
  readonly unavailabilityReason =
    'Creality Print Engine yêu cầu môi trường native desktop để render slice parameters và trajectories. Vui lòng mở file trong Creality Print, nhấn "Slice" và lưu dự án hoặc xuất G-code để nhập số liệu chính xác.';

  canSlice(project: ThreeMFProject): boolean {
    return project.rawSlicerDetected?.toLowerCase().includes('creality') ?? false;
  }

  async slice(_project: ThreeMFProject, _options?: SliceOptions): Promise<SliceResult> {
    return {
      success: false,
      error: this.unavailabilityReason,
    };
  }
}
