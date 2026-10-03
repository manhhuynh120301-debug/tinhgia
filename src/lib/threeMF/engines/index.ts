/**
 * @file lib/threeMF/engines/index.ts
 */

import { SlicerEngineRegistry } from './SlicerEngine';
import { OrcaSlicerEngine } from './OrcaSlicerEngine';
import { PrusaSlicerEngine } from './PrusaSlicerEngine';
import { CrealitySlicerEngine } from './CrealitySlicerEngine';
import { BambuStudioEngine } from './BambuStudioEngine';

// Register standard engines
SlicerEngineRegistry.register(new OrcaSlicerEngine());
SlicerEngineRegistry.register(new PrusaSlicerEngine());
SlicerEngineRegistry.register(new CrealitySlicerEngine());
SlicerEngineRegistry.register(new BambuStudioEngine());

export * from './SlicerEngine';
export * from './OrcaSlicerEngine';
export * from './PrusaSlicerEngine';
export * from './CrealitySlicerEngine';
export * from './BambuStudioEngine';
