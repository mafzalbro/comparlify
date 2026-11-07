// src/components/tools/implementations/pdf-actions.ts
import { PDFDocument, degrees } from "pdf-lib";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { getCachedPdfWorkerUrl } from "./pdfWorkerLoader";

// Helper to get pdfjs safely
let pdfjsLibCache: any = null;
export async function getPdfjs() {
  if (!pdfjsLibCache) {
    pdfjsLibCache = await import("pdfjs-dist");
    const v = pdfjsLibCache.version || "3.11.174";
    pdfjsLibCache.GlobalWorkerOptions.workerSrc = await getCachedPdfWorkerUrl(v);
  }
  return pdfjsLibCache;
}

// 1. PDF to Images (JPG / PNG)
export async function pdfToImages(file: File | Uint8Array, format: "jpg" | "png") {
  const pdfjsLib = await getPdfjs();
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const images: string[] = [];
  const mime = format === "png" ? "image/png" : "image/jpeg";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    if (mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    await page.render({ canvasContext: ctx, viewport } as any).promise;
    images.push(canvas.toDataURL(mime, 0.95));
  }

  if (images.length > 1) {
    const zip = new JSZip();
    images.forEach((dataUrl, idx) => {
      zip.file(`page-${idx + 1}.${format}`, dataUrl.split(",")[1], { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    return { name: `converted_pages.zip`, url: URL.createObjectURL(blob), count: images.length };
  } else {
    const blob = await (await fetch(images[0])).blob();
    return { name: `page-1.${format}`, url: URL.createObjectURL(blob), count: 1 };
  }
}

// 2. PDF to Text
export async function pdfToText(file: File | Uint8Array): Promise<string[]> {
  const pdfjsLib = await getPdfjs();
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pagesText: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    let lastY = null;
    let pageText = "";
    
    for (const item of textContent.items) {
      if (!("str" in item)) continue;
      
      const y = item.transform[5];
      
      // If the Y-coordinate changes significantly, we're on a new line
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        pageText += "\n";
      }
      
      pageText += item.str;
      
      // If the item has an explicit End-Of-Line, add a newline
      if (item.hasEOL) {
        pageText += "\n";
        lastY = null;
      } else {
        pageText += " ";
        lastY = y;
      }
    }
    
    // Clean up formatting: remove double spaces, spaces before newlines, etc.
    const cleanedText = pageText
      .replace(/[ \t]+/g, " ")
      .replace(/[ \t]*\n[ \t]*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
      
    pagesText.push(cleanedText);
  }
  return pagesText;
}


// 3. Images to PDF
export async function imagesToPdf(files: File[]) {
  const doc = new jsPDF();
  for (let i = 0; i < files.length; i++) {
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(files[i]);
    });
    if (i > 0) doc.addPage();
    const img = new Image();
    img.src = dataUrl;
    await new Promise((r) => (img.onload = r));
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
    doc.addImage(dataUrl, "JPEG", 0, 0, img.width * ratio, img.height * ratio);
  }
  return { name: "images_merged.pdf", url: URL.createObjectURL(doc.output("blob")) };
}

// 4. Process Pages (Extract, Delete, Rotate)
export async function processPdfPages(
  file: File | Uint8Array, 
  pagesToKeep: number[], 
  rotations: Record<number, number> = {}
) {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const srcDoc = await PDFDocument.load(data);
  const newDoc = await PDFDocument.create();
  
  const copiedPages = await newDoc.copyPages(srcDoc, pagesToKeep);
  copiedPages.forEach((page, i) => {
    const originalIndex = pagesToKeep[i];
    if (rotations[originalIndex]) {
      const currentRot = page.getRotation().angle;
      page.setRotation(degrees((currentRot + rotations[originalIndex]) % 360));
    }
    newDoc.addPage(page);
  });

  const bytes = await newDoc.save();
  return new Blob([bytes as any], { type: "application/pdf" });
}

// 5. Compress PDF (Rasterize)
export async function compressPdf(file: File | Uint8Array, quality: number, scale: number) {
  const pdfjsLib = await getPdfjs();
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const outDoc = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    await page.render({ canvasContext: ctx, viewport } as any).promise;
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/jpeg", quality));
    const img = await outDoc.embedJpg(await blob.arrayBuffer());
    
    const outPage = outDoc.addPage([viewport.width, viewport.height]);
    outPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  }
  
  const bytes = await outDoc.save();
  return new Blob([bytes as any], { type: "application/pdf" });
}