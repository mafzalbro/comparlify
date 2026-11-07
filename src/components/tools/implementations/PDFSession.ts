"use client";

interface StoredPDFPayload {
  name: string;
  data: ArrayBuffer;
  timestamp: number;
}

const DB_NAME = "comparlify_pdf_db";
const STORE_NAME = "pdf_sessions";
const KEY = "active_pdf";
const PAGES_KEY = "active_pdf_pages";
const MEMORY_KEY = "__comparlify_working_pdf__";
const PAGES_MEMORY_KEY = "__comparlify_working_pages__";
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
  save: async (name: string, dataArray: Uint8Array) => {
    if (typeof window === "undefined") return;
    const slice = dataArray.subarray();
    const buffer = new Uint8Array(slice).buffer as ArrayBuffer;
    const payload: StoredPDFPayload = { name, data: buffer, timestamp: Date.now() };
    (window as any)[MEMORY_KEY] = payload;

    try {
      const db = await openDB();
      if (!db) return;
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(payload, KEY);
    } catch (e) {
      console.warn("Could not persist PDF into IndexedDB:", e);
    }
  },

  get: (): { name: string; data: Uint8Array } | null => {
    if (typeof window === "undefined") return null;
    try {
      const payload = (window as any)[MEMORY_KEY] as StoredPDFPayload | undefined;
      if (!payload) return null;
      if (Date.now() - payload.timestamp > EXPIRY_MS) {
        PDFSession.clear();
        return null;
      }
      return { name: payload.name, data: new Uint8Array(payload.data) };
    } catch {
      return null;
    }
  },

  loadAsync: async (): Promise<{ name: string; data: Uint8Array } | null> => {
    if (typeof window === "undefined") return null;
    const memory = PDFSession.get();
    if (memory) return memory;

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
          (window as any)[MEMORY_KEY] = payload;
          resolve({ name: payload.name, data: new Uint8Array(payload.data) });
        };
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  },

  //  Saves pages to both memory (instant tab switch) AND IndexedDB (survives reload)
  savePages: async (pages: any[]) => {
    if (typeof window === "undefined") return;
    (window as any)[PAGES_MEMORY_KEY] = pages;

    try {
      const db = await openDB();
      if (!db) return;
      
      // AWAIT THE TRANSACTION SO F5 DOESN'T CANCEL IT
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put({ pages, timestamp: Date.now() }, PAGES_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn("Could not persist pages into IndexedDB (Quota?):", e);
    }
  },
  // Loads from memory first, then falls back to IndexedDB on page reload
  loadPagesAsync: async (): Promise<any[] | null> => {
    if (typeof window === "undefined") return null;
    
    // 1. Check memory first
    const cached = (window as any)[PAGES_MEMORY_KEY];
    if (Array.isArray(cached) && cached.length > 0) return cached;

    // 2. Check IndexedDB
    try {
      const db = await openDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(PAGES_KEY);
        req.onsuccess = () => {
          const payload = req.result;
          if (!payload || !payload.pages) return resolve(null);
          if (Date.now() - payload.timestamp > EXPIRY_MS) {
            PDFSession.clearPages();
            return resolve(null);
          }
          (window as any)[PAGES_MEMORY_KEY] = payload.pages;
          resolve(payload.pages);
        };
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  },

  clearPages: async () => {
    if (typeof window === "undefined") return;
    delete (window as any)[PAGES_MEMORY_KEY];
    try {
      const db = await openDB();
      if (!db) return;
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(PAGES_KEY);
    } catch (e) {}
  },

  clear: async () => {
    if (typeof window === "undefined") return;
    delete (window as any)[MEMORY_KEY];
    await PDFSession.clearPages();
    try {
      const db = await openDB();
      if (!db) return;
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(KEY);
    } catch (e) {}
  },
};