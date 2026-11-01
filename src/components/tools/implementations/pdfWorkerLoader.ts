 "use client";

const WORKER_CACHE_KEY = "pdfjs_worker_script";
const DB_NAME = "comparlify_worker_cache";
const STORE_NAME = "scripts";

function openWorkerDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Downloads the PDF.js worker from CDN on the first run,
 * caches it into client-side IndexedDB, and returns a local Blob Object URL.
 * On subsequent loads, it retrieves the worker directly from local IndexedDB cache with zero network requests.
 */
let cachedWorkerUrl: string | null = null;
let workerPromise: Promise<string> | null = null;

export function getCachedPdfWorkerUrl(version: string = "3.11.174"): Promise<string> {
  if (cachedWorkerUrl) return Promise.resolve(cachedWorkerUrl);
  if (workerPromise) return workerPromise;

  workerPromise = (async () => {
    const major = parseInt(version.split(".")[0], 10);
    const ext = major >= 4 ? "min.mjs" : "min.js";
    const cdnUrl = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.${ext}`;

    // 1. Try reading from IndexedDB
    try {
      const db = await openWorkerDB();
      if (db) {
        const cachedBlob: Blob | undefined = await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const getReq = tx.objectStore(STORE_NAME).get(WORKER_CACHE_KEY);
          getReq.onsuccess = () => resolve(getReq.result);
          getReq.onerror = () => resolve(undefined);
        });

        if (cachedBlob && cachedBlob instanceof Blob && cachedBlob.size > 1000) {
          cachedWorkerUrl = URL.createObjectURL(cachedBlob);
          return cachedWorkerUrl;
        }
      }
    } catch (e) {
      console.warn("Could not check local worker cache:", e);
    }

    // 2. First load: fetch from CDN and store in IndexedDB
    try {
      const response = await fetch(cdnUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status} loading PDF worker`);
      const blob = await response.blob();

      // Cache locally
      try {
        const db = await openWorkerDB();
        if (db) {
          const tx = db.transaction(STORE_NAME, "readwrite");
          tx.objectStore(STORE_NAME).put(blob, WORKER_CACHE_KEY);
        }
      } catch (dbErr) {
        console.warn("Failed to save worker to local IndexedDB:", dbErr);
      }

      cachedWorkerUrl = URL.createObjectURL(blob);
      return cachedWorkerUrl;
    } catch (fetchErr) {
      console.warn("Worker fetch failed, falling back to direct CDN link:", fetchErr);
      // Direct CDN fallback
      return cdnUrl;
    }
  })();

  return workerPromise;
}
