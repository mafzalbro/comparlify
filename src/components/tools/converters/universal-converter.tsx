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
  ChevronRight,
  ArrowRightLeft,
  Search,
  FileDigit,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Format } from "./types";
import { SUPPORTED_FORMATS, CONVERSION_PATHS } from "./constants";
import { runPdfToImage, runImageToPdf, runImageToImage, runHtmlToImage, runCompressPdf, runCreateZip } from "./drivers";
import { SeoContent } from "./seo-content";

const PDFJS_VERSION = "3.11.174";

export function UniversalConverter({ 
  initialFrom = "pdf", 
  initialTo = "png" 
}: { 
  initialFrom?: string; 
  initialTo?: string;
}) {
  const router = useRouter();


  const [fromFormat, setFromFormat] = useState<Format>(
    SUPPORTED_FORMATS.find(f => f.id === initialFrom) || SUPPORTED_FORMATS[0]
  );
  const [toFormat, setToFormat] = useState<Format>(
    SUPPORTED_FORMATS.find(f => f.id === initialTo) || SUPPORTED_FORMATS[1]
  );
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState<"from" | "to">("to");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      import("pdfjs-dist").then(pdfjsLib => {
          const v = pdfjsLib.version || PDFJS_VERSION;
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${v}/build/pdf.worker.min.mjs`;
      }).catch(err => console.error("Could not load pdfjs-dist", err));
    }
  }, []);

  const availableToFormats = useMemo(() => {
    const validPaths = CONVERSION_PATHS.filter(p => p.from === fromFormat.id);
    const validTargetIds = validPaths.flatMap(p => p.to);
    return SUPPORTED_FORMATS.filter(f => validTargetIds.includes(f.id));
  }, [fromFormat.id]);

  React.useEffect(() => {
    if (availableToFormats.length > 0 && !availableToFormats.find(f => f.id === toFormat.id)) {
        setToFormat(availableToFormats[0]);
    }
  }, [availableToFormats, toFormat.id]);

  // Navigate to the canonical path for this conversion so the URL always reflects the selection
  useEffect(() => {
    router.replace(`/tools/converters/${fromFormat.id}/${toFormat.id}`, { scroll: false });
  }, [fromFormat.id, toFormat.id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(f => {
        const fileExt = f.name.split('.').pop()?.toLowerCase();
        return fileExt === fromFormat.extension || f.type === fromFormat.mime;
    });

    if (validFiles.length !== selectedFiles.length) {
        toast({
            title: "Invalid Files",
            description: `Some files were ignored. Please upload ${fromFormat.name} files.`,
            variant: "destructive",
        });
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
        const path = CONVERSION_PATHS.find(p => p.from === fromFormat.id && p.to.includes(toFormat.id));
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

        if (driver === 'pdf-to-image') {
            const allResults: any[] = [];
            for (let i = 0; i < files.length; i++) {
                const res = await runPdfToImage(files[i], toFormat);
                allResults.push({ name: res.name, url: '', data: res.data });
                setProgress(Math.round(((i + 1) / files.length) * 100));
            }
            setResults(allResults);
        } else if (driver === 'image-to-pdf') {
            const res = await runImageToPdf(files);
            setResults([res]);
            setProgress(100);
        } else if (driver === 'image-to-image') {
            const res = await runImageToImage(files, fromFormat, toFormat, compressionQuality, setProgress);
            setResults(res);
            setProgress(100);
        } else if (driver === 'compress-pdf') {
            const allResults: any[] = [];
            for (let i = 0; i < files.length; i++) {
                const res = await runCompressPdf(files[i], compressionQuality, setProgress);
                allResults.push(res);
            }
            setResults(allResults);
            setProgress(100);
        } else if (driver === 'html-to-image') {
            const allResults: any[] = [];
            for (let i = 0; i < files.length; i++) {
                const res = await runHtmlToImage(files[i], toFormat, compressionQuality);
                allResults.push(res);
                setProgress(Math.round(((i + 1) / files.length) * 100));
            }
            setResults(allResults);
            setProgress(100);
        } else if (driver === 'create-zip') {
            const res = await runCreateZip(files, setProgress);
            setResults([res]);
            setProgress(100);
        } else if (driver === 'cloud-remote') {
            for (let i = 0; i <= 100; i += 10) {
                 await new Promise(r => setTimeout(r, 200));
                 setProgress(i);
            }
            toast({
                title: "Premium Server Required",
                description: `Converting ${fromFormat.name} to ${toFormat.name} requires cloud processing.`,
            });
            setProgress(0);
        }

        if (driver !== 'cloud-remote') {
            toast({
                title: "Conversion Complete",
                description: `Successfully processed ${files.length} file${files.length > 1 ? 's' : ''} locally.`,
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
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.name;
        link.click();
    } else if (result.data) {
        const extension = toFormat.extension || toFormat.id;
        result.data.forEach((url: string, idx: number) => {
            const link = document.createElement('a');
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

  const currentPath = CONVERSION_PATHS.find(p => p.from === fromFormat.id && p.to.includes(toFormat.id));
  const isCompressible = currentPath?.driver === 'compress-pdf' || 
    (currentPath?.driver === 'image-to-image' && (fromFormat.id === toFormat.id || toFormat.mime === 'image/jpeg' || toFormat.mime === 'image/webp'));
  const isLocalDriver = currentPath?.driver && currentPath.driver !== 'cloud-remote';

  return (
    <div className="space-y-4">
      {/*── Format Selector Bar ───*/}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-card/50 backdrop-blur-xl p-5 rounded-2xl border border-border/10 shadow-sm">
        
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* FROM */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">From</span>
            <Button 
              variant="outline"
              onClick={() => { setSelectorTarget("from"); setSearchQuery(""); setIsSelectorOpen(true); }}
              className="h-11 px-5 rounded-xl border-border/20 bg-background/60 text-base font-black italic hover:bg-primary/5 hover:border-primary/30 transition-all min-w-[90px]"
            >
              .{fromFormat.extension.toUpperCase()}
            </Button>
          </div>

          {/* Arrow */}
          <div className="flex items-center mt-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* TO */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">To</span>
            <Button 
              variant="outline"
              onClick={() => { setSelectorTarget("to"); setSearchQuery(""); setIsSelectorOpen(true); }}
              className="h-11 px-5 rounded-xl border-primary/30 bg-primary/5 text-base font-black italic hover:bg-primary/10 hover:border-primary/50 transition-all min-w-[90px]"
            >
              .{toFormat.extension.toUpperCase()}
            </Button>
          </div>
        </div>

        {/* Badge: Works offline */}
        <div className="sm:ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
            <ShieldCheck className="h-3 w-3" />
            Works Offline · Never Uploaded
        </div>
      </div>

      {/*── Drop Zone / File List Card ───*/}
      <Card className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">
            {files.length === 0 ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedFiles = Array.from(e.dataTransfer.files);
                      const synth = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleFileChange(synth);
                    }}
                    className="border-2 border-dashed border-border/15 rounded-xl p-14 flex flex-col items-center justify-center hover:border-primary/25 hover:bg-primary/[0.03] transition-all cursor-pointer group"
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        multiple 
                        accept={`.${fromFormat.extension},${fromFormat.mime}`}
                        className="hidden" 
                    />
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary mb-4 group-hover:scale-105 transition-transform duration-300">
                        <Upload className="h-8 w-8" />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-tight mb-1.5">
                      Drop your <span className="text-primary">.{fromFormat.extension.toUpperCase()}</span> files here
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium opacity-60">
                      or <span className="text-primary underline underline-offset-2 cursor-pointer">click to browse</span>
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* File list header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                             <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-black">{files.length}</span>
                             File{files.length > 1 ? 's' : ''} Ready
                        </h3>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-lg"
                        >
                            <Upload className="h-3 w-3 mr-1.5" /> Add More
                        </Button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            multiple 
                            accept={`.${fromFormat.extension},${fromFormat.mime}`}
                            className="hidden" 
                        />
                    </div>
                    
                    {/* File items */}
                    <div className="space-y-2">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-background/40 hover:bg-background/60 border border-border/10 rounded-xl group transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0">
                                        {fromFormat.category === 'document' ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold tracking-tight line-clamp-1">{file.name}</p>
                                        <p className="text-[10px] text-muted-foreground opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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

                    {/* Compression slider */}
                    {isCompressible && (
                        <div className="py-4 px-5 bg-muted/30 rounded-xl border border-border/10">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Settings2 className="h-3.5 w-3.5 text-primary" /> Output Quality
                                </label>
                                <span className="text-[11px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded-md">{Math.round(compressionQuality * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="1.0" 
                                step="0.05" 
                                value={compressionQuality} 
                                onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5 opacity-50">
                                <span>Smaller</span>
                                <span>Higher Quality</span>
                            </div>
                        </div>
                    )}

                    {/* Convert Button */}
                    <div className="pt-2">
                        <Button 
                            onClick={handleConvert}
                            disabled={isProcessing}
                            className="w-full h-12 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing {progress > 0 ? `${progress}%` : '...'}
                                </>
                            ) : (
                                <>Convert {files.length} File{files.length > 1 ? 's' : ''} → {toFormat.id.toUpperCase()}</>
                            )}
                        </Button>
                    </div>

                    {/* Results area */}
                    {results.length > 0 && (
                        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                {results.length} Result{results.length > 1 ? 's' : ''} Ready
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {results.map((res, i) => (
                                    <div key={i} className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-bold tracking-tight line-clamp-1 text-muted-foreground">{res.name}</span>
                                        <Button 
                                            size="sm" 
                                            onClick={() => downloadResult(res)}
                                            className="h-7 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[9px] font-black uppercase tracking-widest shrink-0"
                                        >
                                            <Download className="h-3 w-3 mr-1" />
                                            Save
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </Card>

      {/*── Processing progress bar (inline) ───*/}
      {isProcessing && (
        <div className="w-full h-1 bg-border/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/*── Format Selector Modal ───*/}
      <Dialog open={isSelectorOpen} onOpenChange={(open) => { setIsSelectorOpen(open); if (!open) setSearchQuery(""); }}>
        <DialogContent className="max-w-xl rounded-2xl border-border/10 p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b border-border/10">
                <DialogTitle className="text-lg font-black uppercase tracking-tight">
                    Select {selectorTarget === "from" ? "Source" : "Target"} Format
                </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-5">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                    <Input 
                        placeholder="Search formats (e.g. PDF, MP4, WEBP)..." 
                        className="pl-10 h-10 rounded-xl bg-muted/30 border-border/10 text-xs font-semibold"
                        value={searchQuery}
                        autoFocus
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-2">
                    {Object.entries(
                        SUPPORTED_FORMATS
                            .filter(f => 
                                f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                f.extension.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .reduce((acc, f) => {
                                if (!acc[f.category]) acc[f.category] = [];
                                acc[f.category].push(f);
                                return acc;
                            }, {} as Record<string, Format[]>)
                    ).map(([cat, formats]) => {
                        const categoryLabels: Record<string, string> = {
                            document: "Documents", image: "Images", archive: "Archives", audio: "Audio",
                            video: "Video", spreadsheet: "Spreadsheets", presentation: "Presentations", vector: "Vectors", ebook: "eBooks"
                        };
                        return (
                        <div key={cat} className="space-y-2.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 px-1">
                              {categoryLabels[cat] || cat}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {formats.map((f: Format) => {
                                    const isActive = (selectorTarget === "from" ? fromFormat.id : toFormat.id) === f.id;
                                    const isDisabled = selectorTarget === "to" && !availableToFormats.find(av => av.id === f.id);
                                    return (
                                        <Button 
                                            key={f.id}
                                            variant={isActive ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                if (selectorTarget === "from") setFromFormat(f);
                                                else setToFormat(f);
                                                setIsSelectorOpen(false);
                                                setSearchQuery("");
                                            }}
                                            disabled={isDisabled}
                                            className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-wide"
                                        >
                                            .{f.extension.toUpperCase()}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        </DialogContent>
      </Dialog>
      
      {/* Footer badges */}
      <div className="flex flex-wrap justify-center items-center gap-4 py-4 opacity-40">
            <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Local RAM Processing</span>
            </div>
             <div className="flex items-center gap-1.5">
                <FileDigit className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Engine v4.0.2</span>
            </div>
        </div>
        
      <SeoContent fromFormat={fromFormat} toFormat={toFormat} />
    </div>
  );
}
