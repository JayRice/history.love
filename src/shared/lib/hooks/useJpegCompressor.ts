// useJpegCompressor.ts
import { useCallback, useRef, useState } from "react";
import * as FileSystem from "expo-file-system/next"; // <-- new API
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

type Options = {
  maxBytes?: number;      // default 5 MB
  startQuality?: number;  // default 0.9
  minQuality?: number;    // default 0.3
  qualityStep?: number;   // default 0.1
  startWidth?: number;    // default 1600 px
  widthStep?: number;     // default 0.9
  minWidth?: number;      // default 720 px
};


export type CompressResult = {
  uri: string;
  size: number;
  hitLimits: boolean;
};

type BatchOpts = {
  concurrency?: number; // default 2
  stopOnError?: boolean; // default false
};

export function useJpegCompressor(opts: Options = {}) {
  const {
    maxBytes = 5 * 1024 * 1024,
    startQuality = 0.9,
    minQuality = 0.3,
    qualityStep = 0.1,
    startWidth = 1600,
    widthStep = 0.9,
    minWidth = 720,
  } = opts;

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const reset = useCallback(() => {
    cancelRef.current = false;
    setProgress(0);
    setError(null);
  }, []);

  const compressToJpeg = useCallback(
    async (inputUri: string) => {
      reset();
      setIsProcessing(true);

      let compress = startQuality;
      let width = startWidth;
      let currentUri = inputUri;
      let previousUri: string | null = null;
      let passes = 0;

      try {
        console.log("formating");
        while (true) {
          if (cancelRef.current) throw new Error("Compression canceled");

          // ---- Manipulate with new API ----
          const ctx = ImageManipulator.manipulate(currentUri);
          ctx.resize({ width });
          const rendered = await ctx.renderAsync();
          console.log("formating to JPEG")
          const saved = await rendered.saveAsync({
            format: SaveFormat.JPEG,
            compress,
          });

          // Clean up old temp file using the new File API
          if (previousUri && previousUri !== inputUri) {
            try {
              const oldFile = new FileSystem.File(previousUri);
              await oldFile.delete(); // ✅ modern delete
            } catch {}
          }

          currentUri = saved.uri;
          previousUri = currentUri;

          // ---- Get file size via new File API ----
          const file = new FileSystem.File(currentUri);
          const size = file.size ?? 0;

          passes++;
          setProgress(Math.min(1, passes / 10));

          const hitLimits =
            compress <= minQuality + 1e-6 || width <= minWidth + 1e-6;

          if (size <= maxBytes || hitLimits) {
            return { uri: currentUri, size, hitLimits };
          }

          compress = Math.max(minQuality, compress - qualityStep);
          width = Math.max(minWidth, Math.floor(width * widthStep));
        }
      } catch (e: any) {
        setError(e?.message ?? "Unexpected compression error");
        throw e;
      } finally {
        setIsProcessing(false);
        cancelRef.current = false;
      }
    },
    [
      maxBytes,
      startQuality,
      minQuality,
      qualityStep,
      startWidth,
      widthStep,
      minWidth,
      reset,
    ]
  );

  const compressMany = useCallback(
    async (uris: string[], batchOpts: BatchOpts = {}): Promise<(CompressResult | null)[]> => {
      const { concurrency = 2, stopOnError = false } = batchOpts;
      const results: (CompressResult | null)[] = new Array(uris.length).fill(null);

      console.log("trying")
      let cursor = 0;
      let fatal: any = null;

      const worker = async () => {
        while (true) {
          const idx = cursor++;
          if (idx >= uris.length) break;

          try {
            const res = await compressToJpeg(uris[idx]);
            results[idx] = res;
          } catch (e) {
            results[idx] = null;
            if (stopOnError) {
              fatal = e;
              break;
            }
          }
        }
      };

      const workers = Array.from({ length: Math.min(concurrency, uris.length) }, worker);
      await Promise.all(workers);

      if (fatal && stopOnError) throw fatal;
      return results;
    },
    [compressToJpeg]
  );

  /**
   * Compress an array of Photo-like items (that have a `uri`), skipping nulls.
   * Preserves item order; returns only successfully processed items.
   *
   * Example T:
   *   type Photo = { id: string; uri?: string; [k: string]: any }
   */
  const compressManyPhotos = useCallback(
    async <T extends { uri?: string }>(
      items: (T | null)[],
      batchOpts: BatchOpts = {}
    ): Promise<T[]> => {
      // Map to URIs while tracking original indices
      const indexMap: number[] = [];
      const uris: string[] = [];

      items.forEach((it, i) => {
        if (it?.uri) {
          indexMap.push(i);
          uris.push(it.uri);
        }
      });

      const res = await compressMany(uris, batchOpts);

      // Rebuild output array: keep original objects, replace uri when success
      const out: T[] = [];
      res.forEach((r, j) => {
        const originalIndex = indexMap[j];
        const original = items[originalIndex]!;
        if (r) {
          out.push({ ...original, uri: r.uri });
        }
        // If r is null (failed), we skip that item; change if you prefer to keep it
      });

      return out;
    },
    [compressMany]
  );

  return {
    compressToJpeg,
    compressMany,
    compressManyPhotos,
    isProcessing,
    progress,
    error,
    cancel,
  };
}
