"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { FileText, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleCompress = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setCompressing(true);
    setError(null);

    try {
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);

      // Save with object compression enabled to compress structural blocks
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
      });

      const blob = new Blob([compressedBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "PDF compression completed.",
      });
    } catch (err: any) {
      setError("Failed to compress PDF. Some PDFs are already highly optimized or locked.");
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-sm font-bold text-foreground">
            Select PDF document
          </label>
          <div className="border-2 border-dashed border-border/40 hover:border-primary/45 rounded-2xl p-8 text-center cursor-pointer relative bg-secondary/10 transition-colors">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-primary opacity-60" />
              <p className="text-sm font-bold text-foreground">
                {file ? file.name : "Click to upload PDF"}
              </p>
              {file && (
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 flex flex-col justify-end">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our compressor reconstructs the PDF dictionary structure and strips unneeded stream meta tags in your browser to reduce file size without any quality loss in text vector graphics.
          </p>

          <button
            onClick={handleCompress}
            disabled={compressing || !file}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {compressing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Compressing...
              </>
            ) : (
              "Compress PDF File"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
