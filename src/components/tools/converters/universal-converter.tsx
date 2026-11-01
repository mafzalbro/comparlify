"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  Settings2,
  ArrowRightLeft,
  FileDigit,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

import { Format } from "./types";
import { SUPPORTED_FORMATS, CONVERSION_PATHS } from "./constants";
import {
  runPdfToImage,
  runImageToPdf,
  runImageToImage,
  runHtmlToImage,
  runCompressPdf,
  runCreateZip,
} from "./drivers";
import { SeoContent } from "./seo-content";

const PDFJS_VERSION = "3.11.174";

export function UniversalConverter({
  initialFrom = "pdf",
  initialTo = "png",
}: {
  initialFrom?: string;
  initialTo?: string;
}) {
  const router = useRouter();

  const [fromFormat, setFromFormat] = useState<Format>(
    SUPPORTED_FORMATS.find((f) => f.id === initialFrom) || SUPPORTED_FORMATS[0],
  );
  const [toFormat, setToFormat] = useState<Format>(
    SUPPORTED_FORMATS.find((f) => f.id === initialTo) || SUPPORTED_FORMATS[1],
  );

  useEffect(() => {
    const newFrom = SUPPORTED_FORMATS.find((f) => f.id === initialFrom);
    const newTo = SUPPORTED_FORMATS.find((f) => f.id === initialTo);
    if (newFrom && newFrom.id !== fromFormat.id) setFromFormat(newFrom);
    if (newTo && newTo.id !== toFormat.id) setToFormat(newTo);
  }, [initialFrom, initialTo]);

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      import("pdfjs-dist")
        .then((pdfjsLib) => {
          const v = pdfjsLib.version || PDFJS_VERSION;
          const ext =
            v.startsWith("4") || v.startsWith("5") ? "min.mjs" : "min.js";
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${v}/build/pdf.worker.${ext}`;
        })
        .catch((err) => console.error("Could not load pdfjs-dist", err));
    }
  }, []);

  const availableToFormats = useMemo(() => {
    const validPaths = CONVERSION_PATHS.filter((p) => p.from === fromFormat.id);
    const validTargetIds = validPaths.flatMap((p) => p.to);
    return SUPPORTED_FORMATS.filter((f) => validTargetIds.includes(f.id));
  }, [fromFormat.id]);

  React.useEffect(() => {
    if (
      availableToFormats.length > 0 &&
      !availableToFormats.find((f) => f.id === toFormat.id)
    ) {
      setToFormat(availableToFormats[0]);
    }
  }, [availableToFormats, toFormat.id]);

  useEffect(() => {
    const currentPath = `/tools/converters/${fromFormat.id}/${toFormat.id}`;
    if (window.location.pathname !== currentPath) {
      router.replace(currentPath, { scroll: false });
    }
  }, [fromFormat.id, toFormat.id, router]);

  const handleSwap = () => {
    const reversedPath = CONVERSION_PATHS.find(
      (p) => p.from === toFormat.id && p.to.includes(fromFormat.id),
    );
    if (reversedPath) {
      const temp = fromFormat;
      setFromFormat(toFormat);
      setToFormat(temp);
    } else {
      toast({
        title: "Cannot Swap",
        description: `Converting ${toFormat.name} back to ${fromFormat.name} is not currently supported.`,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((f) => {
      const fileExt = f.name.split(".").pop()?.toLowerCase();
      return fileExt === fromFormat.extension || f.type === fromFormat.mime;
    });

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid Files",
        description: `Some files were ignored. Please upload ${fromFormat.name} files.`,
        variant: "destructive",
      });
    }
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const path = CONVERSION_PATHS.find(
        (p) => p.from === fromFormat.id && p.to.includes(toFormat.id),
      );
      const driver = path?.driver;

      if (!driver) {
        toast({
          title: "Format Not Supported",
          description: "This conversion path is currently not supported.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (driver === "pdf-to-image") {
        const allResults: any[] = [];
        for (let i = 0; i < files.length; i++) {
          const res = await runPdfToImage(files[i], toFormat);
          allResults.push(res);
          setProgress(Math.round(((i + 1) / files.length) * 100));
        }
        setResults(allResults);
      } else if (driver === "image-to-pdf") {
        const res = await runImageToPdf(files);
        setResults([res]);
        setProgress(100);
      } else if (driver === "image-to-image") {
        const res = await runImageToImage(
          files,
          fromFormat,
          toFormat,
          compressionQuality,
          setProgress,
        );
        setResults(res);
        setProgress(100);
      } else if (driver === "compress-pdf") {
        const allResults: any[] = [];
        for (let i = 0; i < files.length; i++) {
          const res = await runCompressPdf(
            files[i],
            compressionQuality,
            setProgress,
          );
          allResults.push(res);
        }
        setResults(allResults);
        setProgress(100);
      } else if (driver === "html-to-image") {
        const allResults: any[] = [];
        for (let i = 0; i < files.length; i++) {
          const res = await runHtmlToImage(
            files[i],
            toFormat,
            compressionQuality,
          );
          allResults.push(res);
          setProgress(Math.round(((i + 1) / files.length) * 100));
        }
        setResults(allResults);
        setProgress(100);
      } else if (driver === "create-zip") {
        const res = await runCreateZip(files, setProgress);
        setResults([res]);
        setProgress(100);
      } else if (driver === "cloud-remote") {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((r) => setTimeout(r, 200));
          setProgress(i);
        }
        toast({
          title: "Premium Server Required",
          description: `Converting ${fromFormat.name} to ${toFormat.name} requires cloud processing.`,
        });
        setProgress(0);
      }

      if (driver !== "cloud-remote") {
        toast({
          title: "Conversion Complete",
          description: `Successfully processed ${files.length} file${files.length > 1 ? "s" : ""} locally.`,
        });
      }
    } catch (error) {
      console.error("Conversion Error:", error);
      toast({
        title: "Conversion Failed",
        description: "An error occurred during local conversion.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = (result: any) => {
    if (result.url) {
      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.name;
      link.click();
    } else if (result.data) {
      const extension = toFormat.extension || toFormat.id;
      result.data.forEach((url: string, idx: number) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = `${result.name}-page-${idx + 1}.${extension}`;
        link.click();
      });
    }
  };

  if (!isClient) {
    return (
      <Card className="p-16 bg-card/30 backdrop-blur-3xl border border-border/10 rounded-2xl shadow-xl flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
      </Card>
    );
  }

  const currentPath = CONVERSION_PATHS.find(
    (p) => p.from === fromFormat.id && p.to.includes(toFormat.id),
  );
  const isCompressible =
    currentPath?.driver === "compress-pdf" ||
    (currentPath?.driver === "image-to-image" &&
      (fromFormat.id === toFormat.id ||
        toFormat.mime === "image/jpeg" ||
        toFormat.mime === "image/webp"));

  // Group formats by category for Select dropdown
  const groupedFormats = SUPPORTED_FORMATS.reduce(
    (acc, f) => {
      if (!acc[f.category]) acc[f.category] = [];
      acc[f.category].push(f);
      return acc;
    },
    {} as Record<string, Format[]>,
  );

  return (
    <div className="space-y-4">
      {/* ── Interactive Header Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-card/50 backdrop-blur-xl p-4 rounded-2xl border border-border/10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {/* FROM Dropdown */}
          <Select
            value={fromFormat.id}
            onValueChange={(val) => {
              const f = SUPPORTED_FORMATS.find((x) => x.id === val);
              if (f) setFromFormat(f);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-12 bg-background/60 border-border/20 rounded-xl font-black italic tracking-tight">
              <SelectValue placeholder="From..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {Object.entries(groupedFormats).map(([cat, formats]) => (
                <SelectGroup key={cat}>
                  <SelectLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {cat}
                  </SelectLabel>
                  {formats.map((f) => (
                    <SelectItem
                      key={f.id}
                      value={f.id}
                      className="font-bold cursor-pointer"
                    >
                      .{f.extension.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:scale-110 active:scale-95 transition-all shadow-sm shrink-0"
            title="Swap Formats"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          {/* TO Dropdown */}
          <Select
            value={toFormat.id}
            onValueChange={(val) => {
              const f = availableToFormats.find((x) => x.id === val);
              if (f) setToFormat(f);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-12 bg-primary/5 border-primary/20 rounded-xl font-black italic tracking-tight text-primary">
              <SelectValue placeholder="To..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {Object.entries(
                availableToFormats.reduce(
                  (acc, f) => {
                    if (!acc[f.category]) acc[f.category] = [];
                    acc[f.category].push(f);
                    return acc;
                  },
                  {} as Record<string, Format[]>,
                ),
              ).map(([cat, formats]) => (
                <SelectGroup key={cat}>
                  <SelectLabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                    {cat}
                  </SelectLabel>
                  {formats.map((f) => (
                    <SelectItem
                      key={f.id}
                      value={f.id}
                      className="font-bold cursor-pointer text-primary focus:bg-primary/10 focus:text-primary"
                    >
                      .{f.extension.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest shrink-0">
          <ShieldCheck className="h-3 w-3" /> 100% In-Browser
        </div>
      </div>

      {/* ── Drop Zone / Queue ── */}
      <Card className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">
          {files.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const synth = {
                  target: { files: e.dataTransfer.files },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                handleFileChange(synth);
              }}
              className={`border-2 border-dashed rounded-xl p-14 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                isDragging
                  ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.15)] scale-[1.01]"
                  : "border-border/30 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept={`.${fromFormat.extension},${fromFormat.mime}`}
                className="hidden"
              />
              <div
                className={`p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 ${isDragging ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
              >
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-base font-black uppercase tracking-tight mb-1.5 text-center">
                {isDragging
                  ? "Drop files now!"
                  : `Upload your .${fromFormat.extension.toUpperCase()} files`}
              </h3>
              <p className="text-xs text-muted-foreground font-medium opacity-70 text-center">
                or{" "}
                <span className="text-primary underline underline-offset-2">
                  click to browse
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-black">
                    {files.length}
                  </span>
                  File{files.length > 1 ? "s" : ""} queued
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-lg"
                >
                  <Upload className="h-3 w-3 mr-1.5" /> Add More
                </Button>
              </div>

              <div className="space-y-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-background/40 hover:bg-background/60 border border-border/10 rounded-xl group transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0">
                        {fromFormat.category === "document" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold tracking-tight line-clamp-1">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground opacity-60">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(i)}
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              {isCompressible && (
                <div className="py-4 px-5 bg-muted/30 rounded-xl border border-border/10">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Settings2 className="h-3.5 w-3.5 text-primary" /> Output
                      Quality
                    </label>
                    <span className="text-[11px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded-md">
                      {Math.round(compressionQuality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={compressionQuality}
                    onChange={(e) =>
                      setCompressionQuality(parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="w-full h-14 rounded-xl font-black uppercase tracking-[0.2em] text-[12px] shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing {progress}%
                    </>
                  ) : (
                    <>Convert to {toFormat.name}</>
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pt-2"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        {results.length} Result{results.length > 1 ? "s" : ""}{" "}
                        Ready
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {results.map((res, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between gap-3"
                        >
                          <span className="text-[10px] font-bold tracking-tight line-clamp-1 text-muted-foreground">
                            {res.name}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => downloadResult(res)}
                            className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[10px] font-black uppercase tracking-widest shrink-0"
                          >
                            <Download className="h-3 w-3 mr-1.5" /> Save
                          </Button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Card>

      {/* Animated Progress Bar */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full h-1.5 bg-border/20 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap justify-center items-center gap-4 py-4 opacity-40">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="text-[9px] font-black uppercase tracking-widest">
            100% In-Browser
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileDigit className="h-3.5 w-3.5" />
          <span className="text-[9px] font-black uppercase tracking-widest">
            Zero-Server Privacy
          </span>
        </div>
      </div>

      <SeoContent fromFormat={fromFormat} toFormat={toFormat} />
    </div>
  );
}
