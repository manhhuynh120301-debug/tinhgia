/**
 * @file workers/threeMF.worker.ts
 * Dedicated Web Worker for asynchronous, non-blocking 3MF parsing and G-code analysis.
 */

import { ThreeMFParser } from '../lib/threeMF/ThreeMFParser';

self.onmessage = async (e: MessageEvent) => {
  const { type, fileBuffer, fileName } = e.data;

  if (type === 'PARSE_3MF') {
    try {
      const parser = new ThreeMFParser();
      const project = await parser.parseFile(fileBuffer, fileName);
      self.postMessage({ type: 'PARSE_SUCCESS', project });
    } catch (err: unknown) {
      self.postMessage({
        type: 'PARSE_ERROR',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
};
