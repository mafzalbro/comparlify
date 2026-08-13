"use client";

// Simple browser-safe global state manager for persistent PDF states
interface WorkingPDF {
  name: string;
  dataBase64: string; // stored as base64 string for session survival
}

const MEMORY_KEY = "comparlify_working_pdf";

export const PDFSession = {
  save: (name: string, dataArray: Uint8Array) => {
    if (typeof window === "undefined") return;
    try {
      // Convert Uint8Array to base64
      let binary = "";
      const len = dataArray.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(dataArray[i]);
      }
      const dataBase64 = window.btoa(binary);
      const payload: WorkingPDF = { name, dataBase64 };

      // Save to window global memory
      (window as any)[MEMORY_KEY] = payload;

      // Save to sessionStorage as fallback (for smaller files)
      if (dataArray.byteLength < 5 * 1024 * 1024) {
        sessionStorage.setItem(MEMORY_KEY, JSON.stringify(payload));
      } else {
        sessionStorage.removeItem(MEMORY_KEY);
      }
    } catch (e) {
      console.error("Failed to save PDF to persistent session", e);
    }
  },

  get: (): { name: string; data: Uint8Array } | null => {
    if (typeof window === "undefined") return null;
    try {
      let payload = (window as any)[MEMORY_KEY] as WorkingPDF | undefined;

      if (!payload) {
        const stored = sessionStorage.getItem(MEMORY_KEY);
        if (stored) {
          payload = JSON.parse(stored) as WorkingPDF;
        }
      }

      if (!payload) return null;

      // Decode base64 back to Uint8Array
      const binaryString = window.atob(payload.dataBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return {
        name: payload.name,
        data: bytes,
      };
    } catch (e) {
      console.error("Failed to retrieve PDF from persistent session", e);
      return null;
    }
  },

  clear: () => {
    if (typeof window === "undefined") return;
    delete (window as any)[MEMORY_KEY];
    sessionStorage.removeItem(MEMORY_KEY);
  },
};
