/**
 * @file lib/threeMF/engines/SlicerEngine.ts
 * Clean abstraction and registry for 3D Slicer Engines.
 *
 * Implements strict "No Fake Metrics" rule:
 * If an engine cannot execute native C++ geometry slicing inside pure client-side browser,
 * it is explicitly declared with available: false, detailing technical prerequisites.
 */

import { ThreeMFProject, SliceOptions, SliceResult, SlicerEngine } from '../../../types/threeMF';

export class SlicerEngineRegistry {
  private static engines: Map<string, SlicerEngine> = new Map();

  static register(engine: SlicerEngine) {
    this.engines.set(engine.id, engine);
  }

  static get(id: string): SlicerEngine | undefined {
    return this.engines.get(id);
  }

  static getAll(): SlicerEngine[] {
    return Array.from(this.engines.values());
  }

  static findAvailableFor(project: ThreeMFProject): SlicerEngine | undefined {
    for (const engine of this.engines.values()) {
      if (engine.available && engine.canSlice(project)) {
        return engine;
      }
    }
    return undefined;
  }
}
