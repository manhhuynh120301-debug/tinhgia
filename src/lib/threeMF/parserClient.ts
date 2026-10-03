/**
 * @file lib/threeMF/parserClient.ts
 * Client wrapper to execute 3MF parsing in a Web Worker (preventing UI freeze),
 * with graceful in-thread fallback if Web Worker is restricted in iframe/sandboxed environments.
 */

import { ThreeMFProject } from '../../types/threeMF';
import { ThreeMFParser } from './ThreeMFParser';

export async function parseThreeMFFile(
  file: File,
  onProgress?: (status: string) => void
): Promise<ThreeMFProject> {
  onProgress?.('Đang đọc tệp tin vào bộ nhớ...');
  const arrayBuffer = await file.arrayBuffer();

  // Attempt Web Worker first
  if (typeof Worker !== 'undefined') {
    try {
      onProgress?.('Đang khởi tạo Web Worker phân tích...');
      const worker = new Worker(
        new URL('../../workers/threeMF.worker.ts', import.meta.url),
        { type: 'module' }
      );

      return await new Promise<ThreeMFProject>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          worker.terminate();
          reject(new Error('Phân tích 3MF quá thời gian quy định (Timeout).'));
        }, 60000);

        worker.onmessage = (e: MessageEvent) => {
          clearTimeout(timeoutId);
          worker.terminate();
          if (e.data.type === 'PARSE_SUCCESS') {
            resolve(e.data.project);
          } else {
            reject(new Error(e.data.error || 'Lỗi không xác định khi phân tích 3MF trong Worker.'));
          }
        };

        worker.onerror = (err) => {
          clearTimeout(timeoutId);
          worker.terminate();
          reject(err);
        };

        onProgress?.('Worker đang giải nén container và phân tích metadata slicer...');
        worker.postMessage(
          {
            type: 'PARSE_3MF',
            fileBuffer: arrayBuffer,
            fileName: file.name,
          },
          [arrayBuffer]
        );
      });
    } catch {
      // If Web Worker failed due to browser sandbox / blob URL restriction, fallback to in-thread
      console.warn('Web Worker creation failed. Falling back to main-thread parser.');
    }
  }

  // Main-thread fallback
  onProgress?.('Đang phân tích trực tiếp trên luồng ứng dụng...');
  // Note: if arrayBuffer was transferred, re-read
  const fallbackBuffer = arrayBuffer.byteLength > 0 ? arrayBuffer : await file.arrayBuffer();
  const parser = new ThreeMFParser();
  return await parser.parseFile(fallbackBuffer, file.name);
}
