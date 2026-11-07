"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Image as ImageIcon,
  Trash2,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { imagesToPdf } from "./pdf-actions";

export const JPGToPDF = forwardRef((props, ref) => {
  const [images, setImages] = useState<{ file: File; name: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 👇 Expose the convert function to the PDFWorkspace top bar
  useImperativeHandle(ref, () => ({
    triggerAction: () => {
      handleConvert();
    },
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setImages((prev) => [
      ...prev,
      ...Array.from(e.target.files || []).map((f) => ({
        file: f,
        name: f.name,
      })),
    ]);
    setError(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) return setError("Please add at least one image.");
    setProcessing(true);
    setError(null);

    try {
      // Use the new action
      const result = await imagesToPdf(images.map((i) => i.file));

      const a = document.createElement("a");
      a.href = result.url;
      a.download = result.name;
      a.click();
      URL.revokeObjectURL(result.url);

      toast({ title: "Success!", description: "Images compiled into PDF." });
      setImages([]);
    } catch (err: any) {
      setError(
        "Failed to convert images. Ensure they are standard PNG/JPG files.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* ... your dropzone ... */}
      <div className="relative border-2 border-dashed border-border/40 hover:border-primary/50 rounded-xl bg-card/20 hover:bg-card/30 transition-all cursor-pointer group flex flex-col items-center justify-center p-8 text-center shrink-0">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-all mb-3 shadow-inner">
          <ImageIcon className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          Drop images here, or{" "}
          <span className="text-primary underline underline-offset-2">
            browse
          </span>
        </h3>
        <p className="text-xs text-muted-foreground">
          Supports JPG, JPEG, and PNG formats.
        </p>
      </div>

      {/* ... your file list ... */}
      {images.length > 0 && (
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
            Selected Images ({images.length})
          </h4>
          <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
            {images.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-card/40 text-xs"
              >
                <span className="truncate pr-4 text-foreground font-bold">
                  {item.name}
                </span>
                <button
                  onClick={() =>
                    setImages((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="p-1.5 rounded-md hover:bg-rose-500/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Only show the bottom button if it's NOT in the workspace */}
      <button
        onClick={handleConvert}
        disabled={processing}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-all disabled:opacity-50 shrink-0"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Compiling PDF...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" /> Compile Images into PDF
          </>
        )}
      </button>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2 shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}
    </div>
  );
});
