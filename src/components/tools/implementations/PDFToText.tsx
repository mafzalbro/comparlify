"use client";

import React, { useState, useEffect } from "react";
import { FileText, AlertCircle, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PDFJS_VERSION = "3.11.174";

export function PDFToText() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("pdfjs-dist").then((pdfjsLib) => {
        const v = pdfjsLib.version || PDFJS_VERSION;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${v}/build/pdf.worker.min.mjs`;
      }).catch((err) => console.error("Could not load pdfjs-dist", err));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setText("");
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setProcessing(true);
    setError(null);
    setText("");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      const fileBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
      const pdf = await loadingTask.promise;

      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
      }

      if (!extractedText.trim()) {
        extractedText = "No selectable text was found in this PDF. It might be a scanned document containing only images.";
      }

      setText(extractedText);
      toast({
        title: "Success!",
        description: "Text extracted from PDF successfully.",
      });
    } catch (err: any) {
      setError("Failed to extract text. Some PDFs are encrypted or contain non-standard encodings.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Extracted text copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-sm font-bold text-foreground">
            Select PDF file
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

          <button
            onClick={handleExtract}
            disabled={processing || !file}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Extracting...
              </>
            ) : (
              "Extract Text layer"
            )}
          </button>
        </div>

        {/* Text output */}
        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between h-7">
            <label className="text-sm font-bold text-foreground">
              Extracted Text Result
            </label>
            {text && (
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-primary flex items-center gap-1 text-xs font-bold"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                Copy Text
              </button>
            )}
          </div>
          <textarea
            value={text}
            readOnly
            placeholder="Extracted text content will render here..."
            className="w-full h-64 p-4 rounded-xl border border-border/30 bg-secondary/30 font-mono text-xs text-foreground focus:outline-none resize-none leading-relaxed"
          />
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
