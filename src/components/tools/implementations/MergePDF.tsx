"use client";

import React, { useState, useEffect } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Check, Copy, ArrowUp, ArrowDown, Trash2, FileText, AlertCircle, Loader2, RotateCw, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PDFJS_VERSION = "3.11.174";

interface MergableFile {
  id: string;
  file: File;
  name: string;
  size: string;
  pagesCount: number;
  rotation: number; // 0, 90, 180, 270
}

export function MergePDF() {
  const [files, setFiles] = useState<MergableFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("pdfjs-dist").then((pdfjsLib) => {
        const v = pdfjsLib.version || PDFJS_VERSION;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${v}/build/pdf.worker.min.mjs`;
      }).catch((err) => console.error("Could not load pdfjs-dist", err));
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setMerging(true);
    setError(null);

    try {
      const list: MergableFile[] = [];
      for (const f of Array.from(e.target.files)) {
        const fileBuffer = await f.arrayBuffer();
        const srcPdf = await PDFDocument.load(fileBuffer);
        const count = srcPdf.getPageCount();

        list.push({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          name: f.name,
          size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
          pagesCount: count,
          rotation: 0,
        });
      }

      setFiles((prev) => [...prev, ...list]);
    } catch (err) {
      setError("Failed to load some PDF files. Please ensure they are standard and unencrypted.");
    } finally {
      setMerging(false);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;

    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFiles(updated);
  };

  const handleRotateFile = (id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, rotation: (f.rotation + 90) % 360 } : f
      )
    );
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }

    setMerging(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const fileBuffer = await item.file.arrayBuffer();
        const srcPdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());

        copiedPages.forEach((page) => {
          if (item.rotation > 0) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + item.rotation) % 360));
          }
          mergedPdf.addPage(page);
        });
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "merged_document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "PDF files merged successfully with correct rotation mapping.",
      });
    } catch (err: any) {
      setError("Failed to merge PDF files. Ensure none of the documents are encrypted or password protected.");
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3">
        <label className="text-sm font-bold text-foreground">
          Upload PDF files to merge
        </label>

        <div className="border-2 border-dashed border-border/40 hover:border-primary/45 rounded-2xl p-8 text-center cursor-pointer relative bg-secondary/10 transition-colors">
          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <LayoutGrid className="h-10 w-10 text-primary opacity-60" />
            <p className="text-sm font-bold text-foreground">Click to upload or drag files here</p>
            <p className="text-xs text-muted-foreground font-medium">Select multiple standard PDF files</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Merge Order & File Workspace ({files.length})
          </h4>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {files.map((item, idx) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border/10 bg-secondary/30 text-xs font-medium gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold text-sm">#{idx + 1}</span>
                  <div className="max-w-xs md:max-w-md truncate">
                    <p className="text-foreground font-bold truncate">{item.name}</p>
                    <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground mt-0.5">
                      <span>Pages: <strong>{item.pagesCount}</strong></span>
                      <span>•</span>
                      <span>Size: <strong>{item.size}</strong></span>
                      {item.rotation > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-bold">Rotated {item.rotation}°</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end md:self-center">
                  <button
                    onClick={() => handleRotateFile(item.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-background border border-border/20 hover:text-primary transition-all flex items-center gap-1 text-[10px] font-bold"
                    title="Rotate all pages in document"
                  >
                    <RotateCw className="h-3 w-3" /> Rotate All
                  </button>
                  <button
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === files.length - 1}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors text-destructive"
                    title="Remove File"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleMerge}
            disabled={merging}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {merging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Merging Files...
              </>
            ) : (
              "Merge PDF Documents"
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
