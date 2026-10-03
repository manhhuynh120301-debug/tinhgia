/**
 * @file lib/threeMF/engines/OrcaSlicerEngine.ts
 * OrcaSlicer Engine abstraction.
 */

import { SlicerEngine, ThreeMFProject, SliceOptions, SliceResult } from '../../../types/threeMF';

export class OrcaSlicerEngine implements SlicerEngine {
  readonly id = 'orcaslicer';
  readonly name = 'OrcaSlicer Engine';
  readonly available = false;
  readonly unavailabilityReason =
    'OrcaSlicer sử dụng mã nguồn C++ native nặng (Clipper2, CGAL, OpenVDB, Boost, wxWidgets) và yêu cầu dịch vụ backend hoặc desktop CLI để biên dịch đường chạy dao G-code chuẩn xác 100%. Hiện chưa có bản WASM tối giản chạy thuần trên trình duyệt.';

  canSlice(project: ThreeMFProject): boolean {
    return project.rawSlicerDetected?.toLowerCase().includes('orca') ?? false;
  }

  async slice(_project: ThreeMFProject, _options?: SliceOptions): Promise<SliceResult> {
    return {
      success: false,
      error: this.unavailabilityReason,
    };
  }
}
