"use client";

import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { pdfToImages, imagesToPdf } from "../implementations/pdf-actions";
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

export const UniversalConverter = forwardRef(
  (
    {
      initialFrom = "pdf",
      initialTo = "png",
      initialFile,
      forceEmbedded = false,
    }: {
      initialFrom?: string;
      initialTo?: string;
      initialFile?: File | null;
      forceEmbedded?: boolean;
    },
    ref,
  ) => {
    const router = useRouter();
    const isEmbedded = forceEmbedded || !!initialFile;

    useImperativeHandle(ref, () => ({
      triggerAction: () => {
        handleConvert();
      },
    }));

    const [fromFormat, setFromFormat] = useState<Format>(
      SUPPORTED_FORMATS.find((f) => f.id === initialFrom) ||
        SUPPORTED_FORMATS[0],
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

    // Inherit the workspace file
    useEffect(() => {
      if (initialFile) {
        setFiles([initialFile]);
      }
    }, [initialFile]);

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
      const validPaths = CONVERSION_PATHS.filter(
        (p) => p.from === fromFormat.id,
      );
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
      if (!isEmbedded) {
        const currentPath = `/tools/converters/${fromFormat.id}/${toFormat.id}`;
        if (window.location.pathname !== currentPath) {
          router.replace(currentPath, { scroll: false });
        }
      }
    }, [fromFormat.id, toFormat.id, router, isEmbedded]);

    const handleSwap = () => {
      const reversedPath = CONVERSION_PATHS.find(
        (p) => p.from === toFormat.id && p.to.includes(fromFormat.id),
      );
      if (reversedPath) {
        const temp = fromFormat;
        setFromFormat(toFormat);
        setToFormat(temp);
      } else {
        toast({ title: "Cannot Swap", variant: "destructive" });
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = selectedFiles.filter((f) => {
        const fileExt = f.name.split(".").pop()?.toLowerCase();
        return fileExt === fromFormat.extension || f.type === fromFormat.mime;
      });
      if (validFiles.length !== selectedFiles.length) {
        toast({ title: "Invalid Files", variant: "destructive" });
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
          toast({ title: "Format Not Supported", variant: "destructive" });
          setIsProcessing(false);
          return;
        }

        if (driver === "pdf-to-image") {
          const allResults: any[] = [];
          for (let i = 0; i < files.length; i++) {
            const res = await pdfToImages(files[i], toFormat.id as any);
            allResults.push(res);
            setProgress(Math.round(((i + 1) / files.length) * 100));
          }
          setResults(allResults);
        } else if (driver === "image-to-pdf") {
          setResults([await imagesToPdf(files)]);
          setProgress(100);
        } else if (driver === "image-to-image") {
          setResults(
            await runImageToImage(
              files,
              fromFormat,
              toFormat,
              compressionQuality,
              setProgress,
            ),
          );
          setProgress(100);
        } else if (driver === "compress-pdf") {
          const allResults: any[] = [];
          for (let i = 0; i < files.length; i++) {
            allResults.push(
              await runCompressPdf(files[i], compressionQuality, setProgress),
            );
          }
          setResults(allResults);
          setProgress(100);
        } else if (driver === "html-to-image") {
          const allResults: any[] = [];
          for (let i = 0; i < files.length; i++) {
            allResults.push(
              await runHtmlToImage(files[i], toFormat, compressionQuality),
            );
            setProgress(Math.round(((i + 1) / files.length) * 100));
          }
          setResults(allResults);
          setProgress(100);
        } else if (driver === "create-zip") {
          setResults([await runCreateZip(files, setProgress)]);
          setProgress(100);
        } else if (driver === "cloud-remote") {
          for (let i = 0; i <= 100; i += 10) {
            await new Promise((r) => setTimeout(r, 200));
            setProgress(i);
          }
          toast({ title: "Premium Server Required" });
          setProgress(0);
        }

        if (driver !== "cloud-remote") {
          toast({
            title: "Conversion Complete",
            description: `Processed ${files.length} file(s) locally.`,
          });
        }
      } catch (error) {
        toast({ title: "Conversion Failed", variant: "destructive" });
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
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
        </div>
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

    const groupedFormats = SUPPORTED_FORMATS.reduce(
      (acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
      },
      {} as Record<string, Format[]>,
    );

    return (
      <div className="space-y-4 h-full flex flex-col min-h-0">
        {/* Hide the big header if embedded in workspace */}
        {!isEmbedded && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-card/50 backdrop-blur-xl p-4 rounded-2xl border border-border/10 shadow-sm relative overflow-hidden shrink-0">
            {/* ... Your existing From/To Select dropdowns ... */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
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
              <button
                onClick={handleSwap}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:scale-110 transition-all shrink-0"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
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
        )}

        <div
          className={`flex-1 flex flex-col min-h-0 ${isEmbedded ? "" : "bg-card/40 border border-border/10 rounded-2xl p-6"}`}
        >
          <div className="space-y-5 flex-1 flex flex-col min-h-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept={`.${fromFormat.extension},${fromFormat.mime}`}
              className="hidden"
            />

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
                  handleFileChange({
                    target: { files: e.dataTransfer.files },
                  } as any);
                }}
                className={`border-2 border-dashed rounded-xl p-14 flex flex-col items-center justify-center transition-all cursor-pointer group flex-1 ${isDragging ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.15)] scale-[1.01]" : "border-border/40 hover:border-primary/50 hover:bg-card/30 bg-card/20"}`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 ${isDragging ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:scale-105 shadow-inner"}`}
                >
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1 text-center">
                  {isDragging
                    ? "Drop files now!"
                    : `Upload your .${fromFormat.extension.toUpperCase()} files`}
                </h3>
                <p className="text-xs text-muted-foreground text-center">
                  or{" "}
                  <span className="text-primary underline underline-offset-2">
                    click to browse
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between shrink-0">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-black">
                      {files.length}
                    </span>{" "}
                    File{files.length > 1 ? "s" : ""} queued
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-black uppercase tracking-widest h-7 px-2 rounded-lg text-muted-foreground hover:text-primary"
                  >
                    <Upload className="h-3 w-3 mr-1.5" /> Add More
                  </Button>
                </div>

                <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-card/40 text-xs group"
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
                          <p className="text-foreground font-bold truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(i)}
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {isCompressible && (
                  <div className="py-3 px-4 bg-secondary/30 rounded-xl border border-border/30 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Settings2 className="h-3 w-3 text-primary" /> Quality
                      </label>
                      <span className="text-[10px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
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

                {!isEmbedded && (
                  <div className="pt-2 shrink-0">
                    <Button
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-all disabled:opacity-50 h-10"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          Processing {progress}%
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" /> Convert to{" "}
                          {toFormat.name}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <AnimatePresence>
                  {results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 pt-2 shrink-0"
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                          {results.length} Result{results.length > 1 ? "s" : ""}{" "}
                          Ready
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {results.map((res, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between gap-2"
                          >
                            <span className="text-[10px] font-bold line-clamp-1 text-muted-foreground">
                              {res.name}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => downloadResult(res)}
                              className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shrink-0"
                            >
                              <Download className="h-3 w-3 mr-1" /> Save
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
        </div>

        {/* Hide bottom footers if embedded */}
        {!isEmbedded && (
          <>
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
          </>
        )}
      </div>
    );
  },
);
