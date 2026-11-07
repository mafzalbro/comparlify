"use client";

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { PDFDocument, degrees } from "pdf-lib";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  AlertCircle,
  Loader2,
  RotateCw,
  LayoutGrid,
  Download,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PDFJS_VERSION = "3.11.174";

interface MergableFile {
  id: string;
  file: File;
  name: string;
  size: string;
  pagesCount: number;
  rotation: number;
}

export const MergePDF = forwardRef(
  ({ initialFile }: { initialFile?: File | null }, ref) => {
    const [files, setFiles] = useState<MergableFile[]>([]);
    const [merging, setMerging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const initialized = useRef(false);

    useImperativeHandle(ref, () => ({
      triggerAction: () => {
        handleMerge();
      },
    }));

    useEffect(() => {
      if (typeof window !== "undefined") {
        import("pdfjs-dist")
          .then((pdfjsLib) => {
            const v = pdfjsLib.version || PDFJS_VERSION;
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${v}/build/pdf.worker.min.mjs`;
          })
          .catch((err) => console.error("Could not load pdfjs-dist", err));
      }
    }, []);

    useEffect(() => {
      if (initialFile && !initialized.current) {
        initialized.current = true;
        processFiles([initialFile]);
      }
    }, [initialFile]);

    const processFiles = async (newFiles: File[]) => {
      setMerging(true);
      setError(null);
      const list: MergableFile[] = [];
      const failedFiles: string[] = [];

      for (const f of newFiles) {
        try {
          const fileBuffer = await f.arrayBuffer();
          const srcPdf = await PDFDocument.load(fileBuffer);
          list.push({
            id: `${f.name}-${Date.now()}-${Math.random()}`,
            file: f,
            name: f.name,
            size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
            pagesCount: srcPdf.getPageCount(),
            rotation: 0,
          });
        } catch (err) {
          failedFiles.push(f.name);
        }
      }

      if (failedFiles.length > 0)
        setError(`Failed to load: ${failedFiles.join(", ")}`);
      if (list.length > 0) setFiles((prev) => [...prev, ...list]);
      setMerging(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      await processFiles(Array.from(e.target.files));
      if (e.target) e.target.value = "";
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

    const handleMerge = async () => {
      if (files.length < 2)
        return setError("Please add at least 2 PDF files to merge.");
      setMerging(true);
      setError(null);

      try {
        const mergedPdf = await PDFDocument.create();
        for (const item of files) {
          const srcPdf = await PDFDocument.load(await item.file.arrayBuffer());
          const copiedPages = await mergedPdf.copyPages(
            srcPdf,
            srcPdf.getPageIndices(),
          );
          copiedPages.forEach((page) => {
            if (item.rotation > 0)
              page.setRotation(
                degrees((page.getRotation().angle + item.rotation) % 360),
              );
            mergedPdf.addPage(page);
          });
        }

        const blob = new Blob([(await mergedPdf.save()) as any], {
          type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "merged_document.pdf";
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Success!",
          description: "PDF files merged successfully.",
        });
        setFiles([]);
      } catch (err: any) {
        setError(
          "Failed to merge. Ensure none of the documents are encrypted.",
        );
      } finally {
        setMerging(false);
      }
    };

    return (
      <div className="space-y-6 h-full flex flex-col p-4">
        {/* If files are empty, show a simplified dropzone just for "adding more" */}
        <div className="relative border-2 border-dashed border-border/40 hover:border-primary/50 rounded-xl bg-card/20 hover:bg-card/30 transition-all cursor-pointer group flex flex-col items-center justify-center p-8 text-center shrink-0">
          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-all mb-3 shadow-inner">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            {files.length === 0 ? "Drop PDFs here to merge" : "Add more PDFs"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Select multiple standard PDF files.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{" "}
            <span>{error}</span>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between shrink-0">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Merge Order ({files.length})
              </h4>
              <button
                onClick={() => setFiles([])}
                className="text-[10px] font-bold text-destructive hover:underline"
              >
                Clear Queue
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
              {files.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-card/40 text-xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-primary font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-foreground font-bold truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.pagesCount} pages • {item.size}{" "}
                        {item.rotation > 0 && `• Rotated ${item.rotation}°`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        setFiles((prev) =>
                          prev.map((f) =>
                            f.id === item.id
                              ? { ...f, rotation: (f.rotation + 90) % 360 }
                              : f,
                          ),
                        )
                      }
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                      title="Rotate"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === files.length - 1}
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="p-1.5 rounded-md hover:bg-rose-500/10 text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);
