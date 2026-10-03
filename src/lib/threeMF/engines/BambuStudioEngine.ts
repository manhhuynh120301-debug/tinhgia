/**
 * @file lib/threeMF/engines/BambuStudioEngine.ts
 * Bambu Studio Slicer Engine abstraction.
 */

import { SlicerEngine, ThreeMFProject, SliceOptions, SliceResult } from '../../../types/threeMF';

export class BambuStudioEngine implements SlicerEngine {
  readonly id = 'bambustudio';
  readonly name = 'Bambu Studio Engine';
  readonly available = false;
  readonly unavailabilityReason =
    'Bambu Studio Engine sử dụng bộ tính toán đa luồng C++ native (BambuSource/Slic3r) với các thuật toán độc quyền (flow dynamics, AMS multi-color switching, purge tower). Vui lòng nhấn "Slice plate" trong Bambu Studio trước khi lưu 3MF hoặc xuất tệp.';

  canSlice(project: ThreeMFProject): boolean {
    return project.rawSlicerDetected?.toLowerCase().includes('bambu') ?? false;
  }

  async slice(_project: ThreeMFProject, _options?: SliceOptions): Promise<SliceResult> {
    return {
      success: false,
      error: this.unavailabilityReason,
    };
  }
}
