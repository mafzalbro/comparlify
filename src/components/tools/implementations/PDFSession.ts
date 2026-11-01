"use client";

interface StoredPDFPayload {
  name: string;
  data: ArrayBuffer;
  timestamp: number;
}

const DB_NAME = "comparlify_pdf_db";
const STORE_NAME = "pdf_sessions";
const KEY = "active_pdf";
const MEMORY_KEY = "__comparlify_working_pdf__";
const EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export const PDFSession = {
  /**
   * Saves working PDF data without base64 overhead into memory + IndexedDB
   */
  save: async (name: string, dataArray: Uint8Array) => {
    if (typeof window === "undefined") return;

    // Fast in-memory buffer cache for instant synchronous access within same session
    const slice = dataArray.subarray();
    const buffer = new Uint8Array(slice).buffer as ArrayBuffer;
    const payload: StoredPDFPayload = {
      name,
      data: buffer,
      timestamp: Date.now(),
    };
    (window as any)[MEMORY_KEY] = payload;

    // Persist to IndexedDB asynchronously (handles 100MB+ easily)
    try {
      const db = await openDB();
      if (!db) return;
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(payload, KEY);
    } catch (e) {
      console.warn("Could not persist PDF into IndexedDB:", e);
    }
  },

  /**
   * Synchronously checks in-memory cache first, otherwise returns null.
   * For async cold starts, use `loadAsync()`.
   */
  get: (): { name: string; data: Uint8Array } | null => {
    if (typeof window === "undefined") return null;
    try {
      const payload = (window as any)[MEMORY_KEY] as StoredPDFPayload | undefined;
      if (!payload) return null;

      if (Date.now() - payload.timestamp > EXPIRY_MS) {
        PDFSession.clear();
        return null;
      }

      return {
        name: payload.name,
        data: new Uint8Array(payload.data),
      };
    } catch {
      return null;
    }
  },

  /**
   * Asynchronously retrieves from in-memory cache or IndexedDB fallback
   */
  loadAsync: async (): Promise<{ name: string; data: Uint8Array } | null> => {
    if (typeof window === "undefined") return null;

    // 1. Check in-memory first
    const memory = PDFSession.get();
    if (memory) return memory;

    // 2. Fallback to IndexedDB
    try {
      const db = await openDB();
      if (!db) return null;

      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(KEY);

        req.onsuccess = () => {
          const payload = req.result as StoredPDFPayload | undefined;
          if (!payload) return resolve(null);

          if (Date.now() - payload.timestamp > EXPIRY_MS) {
            PDFSession.clear();
            return resolve(null);
          }

          // Re-populate in-memory cache
          (window as any)[MEMORY_KEY] = payload;

          resolve({
            name: payload.name,
            data: new Uint8Array(payload.data),
          });
        };

        req.onerror = () => resolve(null);
      });
    } catch (e) {
      console.warn("Could not read from IndexedDB:", e);
      return null;
    }
  },

  clear: async () => {
    if (typeof window === "undefined") return;
    delete (window as any)[MEMORY_KEY];

    try {
      const db = await openDB();
      if (!db) return;
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(KEY);
    } catch (e) {
      console.warn("Could not clear PDF session IndexedDB:", e);
    }
  },
};
