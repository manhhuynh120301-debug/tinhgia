/**
 * @file lib/threeMF/engines/PrusaSlicerEngine.ts
 * PrusaSlicer Engine abstraction.
 */

import { SlicerEngine, ThreeMFProject, SliceOptions, SliceResult } from '../../../types/threeMF';

export class PrusaSlicerEngine implements SlicerEngine {
  readonly id = 'prusaslicer';
  readonly name = 'PrusaSlicer Engine';
  readonly available = false;
  readonly unavailabilityReason =
    'PrusaSlicer CLI phụ thuộc thư viện native C++ (libnest2d, tbb, boost, eigen) để tính toán lát cắt infill và support. Khuyến nghị người dùng thực hiện slice trực tiếp trên PrusaSlicer và xuất file 3MF đã cắt lớp (có G-code) để nạp vào hệ thống tính giá.';

  canSlice(project: ThreeMFProject): boolean {
    return project.rawSlicerDetected?.toLowerCase().includes('prusa') ?? false;
  }

  async slice(_project: ThreeMFProject, _options?: SliceOptions): Promise<SliceResult> {
    return {
      success: false,
      error: this.unavailabilityReason,
    };
  }
}
