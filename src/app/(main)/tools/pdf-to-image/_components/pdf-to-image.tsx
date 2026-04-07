"use client";

import React, { useState, useRef } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Image as ImageIcon,
  Upload,
  Download,
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { useToast } from "@/hooks/use-toast";

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function PdfToImageConverter({
  defaultFormat = "image/png",
}: {
  defaultFormat?: "image/png" | "image/jpeg";
}) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setImages([]);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a valid PDF document.",
        variant: "destructive",
      });
    }
  };

  const convertPdfToImages = async () => {
    if (!file) return;

    setIsProcessing(true);
    setImages([]);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const convertedImages: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 }); // Scale for better quality
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport,
            canvas,
          }).promise;
          convertedImages.push(canvas.toDataURL(defaultFormat));
        }
        setProgress(Math.round((i / numPages) * 100));
      }

      setImages(convertedImages);
      toast({
        title: "Conversion Complete",
        description: `Successfully converted ${numPages} pages to images.`,
      });
    } catch (error) {
      console.error("PDF Conversion Error:", error);
      toast({
        title: "Conversion Failed",
        description: "An error occurred while processing the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAllImages = () => {
    const extension = defaultFormat === "image/jpeg" ? "jpg" : "png";
    images.forEach((dataUrl, index) => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `page-${index + 1}.${extension}`;
      link.click();
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Configuration & Upload */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Upload className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-primary">
                Source Document
              </h3>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
                file
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/10 hover:border-primary/20 hover:bg-muted/30"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf"
              />

              {file ? (
                <>
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary mb-4">
                    <FileText className="h-8 w-8" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-tight text-foreground line-clamp-1">
                    {file.name}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setImages([]);
                    }}
                    className="mt-4 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <X className="h-3 w-3 mr-2" /> Remove
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-muted/50 rounded-2xl text-muted-foreground mb-4">
                    <Upload className="h-8 w-8" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-tight text-foreground">
                    Click to Upload PDF
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                    Max file size: 50MB
                  </p>
                </>
              )}
            </div>

            <Button
              onClick={convertPdfToImages}
              disabled={!file || isProcessing}
              className="w-full h-14 rounded-2xl bg-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing {progress}%
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Convert to Images
                </>
              )}
            </Button>

            <div className="pt-6 border-t border-border/10 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">
                  Private & Secure Processing.
                  <br />
                  Files are never uploaded to our servers.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Results & Preview */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-xl h-full min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              Output <span className="text-primary italic">Gallery</span>
            </h3>
            {images.length > 0 && (
              <Button
                onClick={downloadAllImages}
                className="rounded-xl h-10 bg-emerald-500 hover:bg-emerald-600 text-[10px] font-black uppercase tracking-widest"
              >
                <Download className="h-3 w-3 mr-2" />
                Download All ({images.length})
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {images.map((img, i) => (
                  <MotionDiv
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative rounded-2xl overflow-hidden border border-border/10 bg-background/40"
                  >
                    <img
                      src={img}
                      alt={`Page ${i + 1}`}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="rounded-lg text-[9px] font-black uppercase"
                      >
                        <a
                          href={img}
                          download={`page-${i + 1}.${defaultFormat === "image/jpeg" ? "jpg" : "png"}`}
                        >
                          <Download className="h-3 w-3 mr-2" /> Download
                        </a>
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">
                        Page {i + 1}
                      </p>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <div className="p-8 bg-muted/20 rounded-[2.5rem] border border-dashed border-border/20">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight mb-2">
                    No Output Yet
                  </h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-[250px] leading-relaxed">
                    Upload a PDF and hit convert to see high-fidelity images
                    here.
                  </p>
                </div>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border/10 flex items-center gap-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                All pages successfully rendered at{" "}
                <span className="text-foreground">2x scaling</span> for maximum
                quality.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
