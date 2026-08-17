"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Upload,
  Download,
  Trash2,
  Loader2,
  ShieldCheck,
  Settings2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  FileImage,
  Crop,
  Maximize2,
  RotateCw,
  FileCode,
  HelpCircle,
  Copy,
  Check,
  ChevronRight,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

// Simple custom aspect crop definitions
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageMetadata {
  name: string;
  size: number;
  width: number;
  height: number;
  type: string;
  aspectRatio: string;
  hasAlpha: boolean;
  compressionPotential: string;
}

interface ProcessedResult {
  name: string;
  originalSize: number;
  newSize: number;
  width: number;
  height: number;
  format: string;
  dataUrl: string;
  savedPercentage: number;
}

export function ImageWorkspace({ defaultMode = "compress" }: { defaultMode?: string }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(defaultMode);

  // --- File State ---
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Single Image Workspace State ---
  const [singleImageSrc, setSingleImageSrc] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);

  // --- Compression Settings ---
  const [compressionType, setCompressionType] = useState<"preset" | "target">("preset");
  const [qualityPreset, setQualityPreset] = useState<"best" | "balanced" | "smallest">("balanced");
  const [targetSizeKb, setTargetSizeKb] = useState<number>(200);

  // --- Resize Settings ---
  const [resizeWidth, setResizeWidth] = useState<number>(800);
  const [resizeHeight, setResizeHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [resizePercent, setResizePercent] = useState<number>(100);
  const [resizeUnit, setResizeUnit] = useState<"px" | "percent">("px");

  // --- Rotation Settings ---
  const [rotation, setRotation] = useState<number>(0); // degrees: 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // --- Crop Settings (Custom Custom Crop Box Overlay) ---
  const [cropBox, setCropBox] = useState<CropArea>({ x: 10, y: 10, width: 80, height: 80 }); // in percentages
  const [cropAspectRatio, setCropAspectRatio] = useState<string>("custom"); // "custom", "1:1", "16:9", "4:3"
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // --- Conversion Format ---
  const [targetFormat, setTargetFormat] = useState<"png" | "jpeg" | "webp">("webp");

  // --- Presets State ---
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // --- Before / After Comparison State ---
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage of before/after split
  const isDraggingSlider = useRef<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // --- Base64 Output State ---
  const [base64Output, setBase64Output] = useState<string>("");
  const [copiedBase64, setCopiedBase64] = useState<boolean>(false);

  // --- Custom Output Naming & Dominant Color State ---
  const [namingPattern, setNamingPattern] = useState<string>("{name}-{width}x{height}");
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [responsiveCode, setResponsiveCode] = useState<string>("");
  const [copiedResponsive, setCopiedResponsive] = useState<boolean>(false);

  // --- Batch Processed Files ---
  const [batchResults, setBatchResults] = useState<ProcessedResult[]>([]);

  // Synchronize targetFormat if defaultMode is a converter
  useEffect(() => {
    if (defaultMode.includes("to-")) {
      const parts = defaultMode.split("-to-");
      if (parts.length === 2) {
        const to = parts[1] as "png" | "jpeg" | "webp";
        if (["png", "jpeg", "webp"].includes(to)) {
          setTargetFormat(to === "jpeg" ? "jpeg" : to);
        }
      }
      setActiveTab("compress");
    } else {
      setActiveTab(defaultMode);
    }
  }, [defaultMode]);

  // Handle Aspect Ratio Changes for Crop
  useEffect(() => {
    if (cropAspectRatio === "1:1") {
      setCropBox(prev => ({ ...prev, height: prev.width }));
    } else if (cropAspectRatio === "16:9") {
      setCropBox(prev => ({ ...prev, height: prev.width * (9 / 16) }));
    } else if (cropAspectRatio === "4:3") {
      setCropBox(prev => ({ ...prev, height: prev.width * (3 / 4) }));
    }
  }, [cropAspectRatio]);

  // Load single image into canvas for analysis and presets
  const analyzeImage = (file: File, src: string) => {
    const img = new Image();
    img.onload = () => {
      // Analyze transparency
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(img.width, 400);
      canvas.height = Math.min(img.height, 400);
      const ctx = canvas.getContext("2d");
      let hasAlpha = false;
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          for (let i = 3; i < imgData.length; i += 4) {
            if (imgData[i] < 255) {
              hasAlpha = true;
              break;
            }
          }
        } catch (e) {
          // ignore CORS or sandbox security restrictions if any
        }
      }

      // Calculate estimated compression potential
      let potential = "Moderate (20-40%)";
      if (file.size > 2 * 1024 * 1024) {
        potential = "Very High (70-90% savings)";
      } else if (file.type === "image/png" && !hasAlpha) {
        potential = "High (50-80% savings using WebP)";
      } else if (file.size < 100 * 1024) {
        potential = "Low (Highly optimized already)";
      }

      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divider = gcd(img.width, img.height);
      const aspectStr = `${img.width / divider}:${img.height / divider}`;

      // Sample dominant colors
      const colors: string[] = [];
      if (ctx) {
        const samplePoints = [
          [10, 10], [canvas.width / 2, canvas.height / 2], [canvas.width - 10, canvas.height - 10]
        ];
        samplePoints.forEach(([x, y]) => {
          try {
            const p = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            const hex = `#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1)}`;
            colors.push(hex);
          } catch (e) {}
        });
      }
      setDominantColors(colors.length > 0 ? colors : ["#000000", "#ffffff"]);

      setMetadata({
        name: file.name,
        size: file.size,
        width: img.width,
        height: img.height,
        type: file.type || "image/unknown",
        aspectRatio: (img.width / img.height).toFixed(2) + ` (${aspectStr})`,
        hasAlpha,
        compressionPotential: potential
      });

      // Populate default Resize dimensions
      setResizeWidth(img.width);
      setResizeHeight(img.height);

      // Generate initial responsive html snippet
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const htmlSnippet = `<picture>
  <source srcset="${baseName}-320w.webp 320w, ${baseName}-640w.webp 640w, ${baseName}-1024w.webp 1024w, ${baseName}-1920w.webp 1920w" type="image/webp" sizes="(max-width: 768px) 100vw, 1024px" />
  <img src="${baseName}-1024w.jpg" alt="${baseName.replace(/[-_]/g, " ")}" width="${img.width}" height="${img.height}" loading="lazy" decoding="async" />
</picture>`;
      setResponsiveCode(htmlSnippet);
    };
    img.src = src;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setFiles(selectedFiles);
    setProcessedResult(null);
    setBatchResults([]);

    if (selectedFiles.length === 1) {
      const file = selectedFiles[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setSingleImageSrc(src);
        analyzeImage(file, src);
        // Default to showing Base64 if needed
        if (activeTab === "base64" || defaultMode === "image-to-base64") {
          setBase64Output(src);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setSingleImageSrc(null);
      setMetadata(null);
    }
  };

  const removeAllFiles = () => {
    setFiles([]);
    setSingleImageSrc(null);
    setMetadata(null);
    setProcessedResult(null);
    setBatchResults([]);
    setBase64Output("");
  };

  // --- Draggable Before / After split handling ---
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const onMouseDownSlider = (e: React.MouseEvent) => {
    isDraggingSlider.current = true;
    handleSliderMove(e.clientX);
    document.addEventListener("mousemove", onGlobalMouseMove);
    document.addEventListener("mouseup", onGlobalMouseUp);
  };

  const onTouchMoveSlider = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const onGlobalMouseMove = (e: MouseEvent) => {
    if (isDraggingSlider.current) {
      handleSliderMove(e.clientX);
    }
  };

  const onGlobalMouseUp = () => {
    isDraggingSlider.current = false;
    document.removeEventListener("mousemove", onGlobalMouseMove);
    document.removeEventListener("mouseup", onGlobalMouseUp);
  };

  // --- Smart Presets configuration ---
  const applyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setCompressionType("preset");

    switch (presetKey) {
      case "website":
        setResizeUnit("px");
        setResizeWidth(Math.min(metadata?.width || 1200, 1200));
        setLockAspectRatio(true);
        setTargetFormat("webp");
        setQualityPreset("balanced");
        break;
      case "wordpress":
        setResizeUnit("px");
        setResizeWidth(Math.min(metadata?.width || 1024, 1024));
        setLockAspectRatio(true);
        setTargetFormat("webp");
        setQualityPreset("balanced");
        break;
      case "shopify":
        setResizeUnit("px");
        setResizeWidth(Math.min(metadata?.width || 2048, 2048));
        setLockAspectRatio(true);
        setTargetFormat("webp");
        setQualityPreset("best");
        break;
      case "instagram":
        setResizeUnit("px");
        setResizeWidth(1080);
        setResizeHeight(1080);
        setLockAspectRatio(false);
        setTargetFormat("jpeg");
        setQualityPreset("best");
        break;
      case "youtube":
        setResizeUnit("px");
        setResizeWidth(1280);
        setResizeHeight(720);
        setLockAspectRatio(false);
        setTargetFormat("webp");
        setQualityPreset("best");
        break;
      case "email":
        setResizeUnit("px");
        setResizeWidth(Math.min(metadata?.width || 600, 600));
        setLockAspectRatio(true);
        setTargetFormat("jpeg");
        setQualityPreset("smallest");
        break;
      case "nextjs":
        setResizeUnit("px");
        setResizeWidth(Math.min(metadata?.width || 1920, 1920));
        setLockAspectRatio(true);
        setTargetFormat("webp");
        setQualityPreset("balanced");
        break;
    }

    toast({
      title: "Preset Applied",
      description: `Optimized image parameters for ${presetKey.toUpperCase()}`,
    });
  };

  // Lock Aspect Ratio Resizing math helper
  const handleWidthChange = (val: number) => {
    setResizeWidth(val);
    if (lockAspectRatio && metadata) {
      const ratio = metadata.height / metadata.width;
      setResizeHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setResizeHeight(val);
    if (lockAspectRatio && metadata) {
      const ratio = metadata.width / metadata.height;
      setResizeWidth(Math.round(val * ratio));
    }
  };

  // --- Dynamic Binary Search Compression Logic (Target-Size mode) ---
  const runBinarySearchCompression = async (
    img: HTMLImageElement,
    targetKb: number,
    mimeType: string,
    width: number,
    height: number
  ): Promise<{ dataUrl: string; size: number; quality: number }> => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not construct 2D context");

    // Geometric alterations
    ctx.save();
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      // Adjust canvas dimension if orientation changed
      if (rotation === 90 || rotation === 270) {
        canvas.width = height;
        canvas.height = width;
        ctx.translate(-canvas.height / 2, -canvas.width / 2);
      } else {
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }
    }

    // Scale flips
    if (flipH || flipV) {
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(
        img,
        flipH ? -width : 0,
        flipV ? -height : 0,
        width,
        height
      );
    } else {
      ctx.drawImage(img, 0, 0, width, height);
    }
    ctx.restore();

    // Binary search quality settings to find the optimal file size meeting the request
    let minQ = 0.05;
    let maxQ = 1.0;
    let bestDataUrl = "";
    let bestSize = 0;
    let bestQuality = 0.8;

    // Up to 6 iterations for extremely fast client performance
    for (let i = 0; i < 6; i++) {
      const midQ = (minQ + maxQ) / 2;
      const dataUrl = canvas.toDataURL(mimeType, midQ);
      // estimate byte size from Base64 length (approx 0.75 ratio)
      const sizeBytes = Math.round((dataUrl.length - 22) * 3 / 4);
      const sizeKb = sizeBytes / 1024;

      if (sizeKb <= targetKb) {
        bestDataUrl = dataUrl;
        bestSize = sizeBytes;
        bestQuality = midQ;
        minQ = midQ; // Try to get higher quality still beneath the target
      } else {
        maxQ = midQ; // File too large, step down the quality coefficient
      }
    }

    // Fallback if no quality matches target constraint, output smallest possible
    if (!bestDataUrl) {
      bestDataUrl = canvas.toDataURL(mimeType, 0.05);
      bestSize = Math.round((bestDataUrl.length - 22) * 3 / 4);
      bestQuality = 0.05;
    }

    return { dataUrl: bestDataUrl, size: bestSize, quality: bestQuality };
  };

  // --- MAIN CORE IMAGE COMPILATION PIPELINE ---
  const processImageFile = async (
    file: File,
    src: string
  ): Promise<ProcessedResult> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // 1. Calculate Target Dimensions
          let width = img.width;
          let height = img.height;

          if (activeTab === "resize") {
            if (resizeUnit === "px") {
              width = resizeWidth;
              height = resizeHeight;
            } else {
              width = Math.round(img.width * (resizePercent / 100));
              height = Math.round(img.height * (resizePercent / 100));
            }
          }

          // 2. Compute Crop Bounds (if active)
          let finalCanvasWidth = width;
          let finalCanvasHeight = height;
          let useCrop = activeTab === "crop";

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context is unavailable.");

          if (useCrop) {
            // translate cropBox percentage coordinates into actual pixel bounds
            const cropX = (cropBox.x / 100) * img.width;
            const cropY = (cropBox.y / 100) * img.height;
            const cropW = (cropBox.width / 100) * img.width;
            const cropH = (cropBox.height / 100) * img.height;

            canvas.width = cropW;
            canvas.height = cropH;

            // Apply orientation & flips
            ctx.save();
            ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            ctx.restore();
          } else {
            canvas.width = width;
            canvas.height = height;

            // Standard render with geometry transformations
            ctx.save();
            if (rotation !== 0) {
              ctx.translate(canvas.width / 2, canvas.height / 2);
              ctx.rotate((rotation * Math.PI) / 180);
              if (rotation === 90 || rotation === 270) {
                canvas.width = height;
                canvas.height = width;
                ctx.translate(-canvas.height / 2, -canvas.width / 2);
              } else {
                ctx.translate(-canvas.width / 2, -canvas.height / 2);
              }
            }

            if (flipH || flipV) {
              ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
              ctx.drawImage(
                img,
                flipH ? -width : 0,
                flipV ? -height : 0,
                width,
                height
              );
            } else {
              ctx.drawImage(img, 0, 0, width, height);
            }
            ctx.restore();
          }

          // 3. Resolve Target Format & Quality
          let mime = "image/webp";
          let formatExt = "webp";
          if (targetFormat === "png") {
            mime = "image/png";
            formatExt = "png";
          } else if (targetFormat === "jpeg") {
            mime = "image/jpeg";
            formatExt = "jpg";
          }

          let finalDataUrl = "";
          let finalSize = 0;

          // Target Size loop
          if (activeTab === "compress" && compressionType === "target") {
            const searchRes = await runBinarySearchCompression(
              img,
              targetSizeKb,
              mime,
              width,
              height
            );
            finalDataUrl = searchRes.dataUrl;
            finalSize = searchRes.size;
          } else {
            // Preset quality mapping
            let quality = 0.85;
            if (qualityPreset === "best") quality = 0.95;
            else if (qualityPreset === "smallest") quality = 0.55;

            finalDataUrl = canvas.toDataURL(mime, quality);
            finalSize = Math.round((finalDataUrl.length - 22) * 3 / 4);
          }

          const savedPercentage = Math.round(
            ((file.size - finalSize) / file.size) * 100
          );

          const dotIdx = file.name.lastIndexOf(".");
          const baseName = dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name;

          let formattedName = namingPattern
            .replace("{name}", baseName)
            .replace("{width}", canvas.width.toString())
            .replace("{height}", canvas.height.toString());
          if (!formattedName.endsWith(`.${formatExt}`)) {
            formattedName += `.${formatExt}`;
          }

          resolve({
            name: formattedName,
            originalSize: file.size,
            newSize: finalSize,
            width: canvas.width,
            height: canvas.height,
            format: formatExt.toUpperCase(),
            dataUrl: finalDataUrl,
            savedPercentage: savedPercentage < 0 ? 0 : savedPercentage
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Failed to load source image file."));
      img.src = src;
    });
  };

  const handleProcessWorkspace = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(10);

    try {
      if (files.length === 1 && singleImageSrc) {
        setProgress(30);
        const result = await processImageFile(files[0], singleImageSrc);
        setProgress(80);
        setProcessedResult(result);
        if (activeTab === "base64") {
          setBase64Output(result.dataUrl);
        }
        setProgress(100);
        toast({
          title: "Image Processed Locally!",
          description: "Prístine, optimized variant constructed inside your RAM sandbox.",
        });
      } else {
        // Batch Processing
        const resultsArray: ProcessedResult[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const src = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          const processed = await processImageFile(file, src);
          resultsArray.push(processed);
          setProgress(Math.round(20 + (i / files.length) * 80));
        }
        setBatchResults(resultsArray);
        toast({
          title: "Batch Complete!",
          description: `Successfully optimized ${files.length} images. ZIP package ready.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Workspace Error",
        description: err.message || "An exception occurred during image mapping.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessedSingle = () => {
    if (!processedResult) return;
    const link = document.createElement("a");
    link.href = processedResult.dataUrl;
    link.download = processedResult.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadBatchZip = async () => {
    if (batchResults.length === 0) return;
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      batchResults.forEach((res, i) => {
        // extract raw Base64 data from DataURL
        const base64Data = res.dataUrl.split(",")[1];
        zip.file(res.name, base64Data, { base64: true });
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `optimized_images_comparlify.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "ZIP Archived Successfully",
        description: "Your batch images are saved in a clean archive."
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Archival Exception",
        description: "Failed to zip file queue."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Smart Format Recommendation Utility
  const formatRecommendation = useMemo(() => {
    if (!metadata) return null;
    let recommendation = "WebP";
    let explanation = "";

    if (metadata.hasAlpha) {
      recommendation = "WebP (with Alpha)";
      explanation = "WebP supports alpha transparency at 30% smaller file sizes than high-fidelity transparent PNG containers.";
    } else if (metadata.width > 2000 || metadata.size > 1.5 * 1024 * 1024) {
      recommendation = "WebP";
      explanation = "Large digital canvases render flawlessly on next-generation WebP matrices, shaving off up to 80% payload overhead compared to classic flat JPG structures.";
    } else {
      recommendation = "WebP";
      explanation = "WebP produces identical quality grids at minimal network footprints. This speeds up modern Next.js, WordPress, and Shopify environments.";
    }

    return { recommendation, explanation };
  }, [metadata]);

  // Image SEO Audit Engine
  const seoAudit = useMemo(() => {
    if (!metadata) return { score: 100, items: [] };

    let score = 100;
    const items: { label: string; passed: boolean; note: string }[] = [];

    // 1. Format audit
    if (metadata.type.includes("webp")) {
      items.push({ label: "Next-gen WebP format", passed: true, note: "Modern WebP image format used." });
    } else {
      score -= 15;
      items.push({ label: "Next-gen format recommendation", passed: false, note: "Converting from JPEG/PNG to WebP can save 30-70% bandwidth." });
    }

    // 2. Dimensions audit
    if (metadata.width <= 2560 && metadata.height <= 2560) {
      items.push({ label: "Web-friendly dimensions", passed: true, note: `${metadata.width}×${metadata.height}px fits standard web viewports.` });
    } else {
      score -= 15;
      items.push({ label: "Oversized image dimensions", passed: false, note: `Dimensions (${metadata.width}px wide) exceed 2560px. Resize down.` });
    }

    // 3. File size audit
    if (metadata.size <= 300 * 1024) {
      items.push({ label: "Lightweight file payload", passed: true, note: `${(metadata.size / 1024).toFixed(0)} KB is optimal for web performance.` });
    } else {
      score -= 20;
      items.push({ label: "Heavy file size payload", passed: false, note: `File size is ${(metadata.size / 1024).toFixed(0)} KB. Compress under 300 KB.` });
    }

    // 4. Filename naming audit
    const hasCleanName = !metadata.name.includes(" ") && !metadata.name.toLowerCase().startsWith("img_") && !metadata.name.toLowerCase().startsWith("screenshot");
    if (hasCleanName) {
      items.push({ label: "Optimized filename structure", passed: true, note: "Clean descriptive filename without spaces or generic camera prefixes." });
    } else {
      score -= 10;
      items.push({ label: "Generic or space-separated filename", passed: false, note: "Use descriptive, hyphen-separated filenames (e.g. product-hero.webp)." });
    }

    return { score: Math.max(20, score), items };
  }, [metadata]);

  // Copy helper for Base64 URL
  const copyBase64ToClipboard = () => {
    navigator.clipboard.writeText(base64Output);
    setCopiedBase64(true);
    toast({
      title: "Copied!",
      description: "Base64 URI copied to your clipboard.",
    });
    setTimeout(() => setCopiedBase64(false), 2000);
  };

  // Custom Crop dragging overlay coordinate tracker
  const handleCropDrag = (e: React.MouseEvent) => {
    if (!cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(((e.clientX - rect.left) / rect.width) * 100, 90));
    const yPct = Math.max(0, Math.min(((e.clientY - rect.top) / rect.height) * 100, 90));

    setCropBox(prev => ({
      ...prev,
      x: Math.round(xPct),
      y: Math.round(yPct),
      width: Math.min(prev.width, 100 - xPct),
      height: Math.min(prev.height, 100 - yPct)
    }));
  };

  const handleCropResize = (widthPct: number) => {
    setCropBox(prev => {
      let finalW = Math.max(10, Math.min(widthPct, 100 - prev.x));
      let finalH = prev.height;
      if (cropAspectRatio === "1:1") {
        finalH = finalW;
      } else if (cropAspectRatio === "16:9") {
        finalH = finalW * (9 / 16);
      } else if (cropAspectRatio === "4:3") {
        finalH = finalW * (3 / 4);
      } else {
        finalH = Math.max(10, Math.min(widthPct, 100 - prev.y));
      }
      return {
        ...prev,
        width: Math.round(finalW),
        height: Math.round(finalH)
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Privacy Warning Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 backdrop-blur-3xl p-5 rounded-2xl border border-border/40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Zero-Server Image Sandbox</h2>
            <p className="text-xs text-muted-foreground font-medium">Processed locally in your device memory. None of your assets leave your machine.</p>
          </div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
          RAM Engine v1.0.0
        </div>
      </div>

      {/* Upload Zone */}
      {files.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const synth = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
              handleFileChange(synth);
            }
          }}
          className="border-2 border-dashed border-border/40 hover:border-primary/45 rounded-2xl p-16 text-center cursor-pointer bg-secondary/5 transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-105 transition-transform duration-300 border border-primary/20">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-tight text-foreground">Drag and drop your images</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">Supports JPG, PNG, and WebP (Up to 50 images for bulk processing)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-secondary/15 border border-border/35 rounded-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <FileImage className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate">
                {files.length === 1 ? files[0].name : `${files.length} Images Selected`}
              </h4>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {files.length === 1
                  ? `${(files[0].size / 1024 / 1024).toFixed(2)} MB`
                  : `${(files.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(2)} MB total`
                }
              </p>
            </div>
          </div>
          <button
            onClick={removeAllFiles}
            className="text-xs font-bold text-rose-500 hover:bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/15 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Queue
          </button>
        </div>
      )}

      {/* Single Image Workflow workspace layout */}
      {files.length === 1 && singleImageSrc && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Visual Preview & Before/After slider */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Workspace Canvas container */}
            <div className="bg-card/30 rounded-2xl border border-border/30 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border/30 bg-card/60 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Visual Sandbox Canvas
                </span>
                <span className="text-xs font-bold text-foreground">
                  {metadata?.width} × {metadata?.height}px
                </span>
              </div>

              {/* Crop mode interactive container */}
              {activeTab === "crop" ? (
                <div
                  ref={cropContainerRef}
                  className="relative flex items-center justify-center p-6 bg-slate-900/60 max-h-[420px] overflow-hidden select-none"
                >
                  <img
                    src={singleImageSrc}
                    alt="Source"
                    className="max-h-[380px] max-w-full rounded border border-border/20 object-contain pointer-events-none"
                  />
                  {/* Aspect crop guide overlays */}
                  <div
                    style={{
                      left: `${cropBox.x}%`,
                      top: `${cropBox.y}%`,
                      width: `${cropBox.width}%`,
                      height: `${cropBox.height}%`
                    }}
                    className="absolute border-2 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] rounded cursor-move"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const onMove = (moveEv: MouseEvent) => {
                        if (!cropContainerRef.current) return;
                        const r = cropContainerRef.current.getBoundingClientRect();
                        const x = Math.max(0, Math.min(((moveEv.clientX - r.left) / r.width) * 100, 100 - cropBox.width));
                        const y = Math.max(0, Math.min(((moveEv.clientY - r.top) / r.height) * 100, 100 - cropBox.height));
                        setCropBox(p => ({ ...p, x: Math.round(x), y: Math.round(y) }));
                      };
                      const onUp = () => {
                        document.removeEventListener("mousemove", onMove);
                        document.removeEventListener("mouseup", onUp);
                      };
                      document.addEventListener("mousemove", onMove);
                      document.addEventListener("mouseup", onUp);
                    }}
                  >
                    {/* Width handle */}
                    <div
                      className="absolute bottom-[-6px] right-[-6px] w-4 h-4 rounded-full bg-primary border-2 border-background cursor-se-resize flex items-center justify-center shadow"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const onMove = (moveEv: MouseEvent) => {
                          if (!cropContainerRef.current) return;
                          const r = cropContainerRef.current.getBoundingClientRect();
                          const sizePct = ((moveEv.clientX - r.left) / r.width) * 100 - cropBox.x;
                          handleCropResize(sizePct);
                        };
                        const onUp = () => {
                          document.removeEventListener("mousemove", onMove);
                          document.removeEventListener("mouseup", onUp);
                        };
                        document.addEventListener("mousemove", onMove);
                        document.addEventListener("mouseup", onUp);
                      }}
                    />
                  </div>
                </div>
              ) : processedResult ? (
                /* Before/After comparison draggable split container */
                <div
                  ref={sliderContainerRef}
                  className="relative h-[320px] sm:h-[380px] bg-slate-900 overflow-hidden select-none cursor-ew-resize"
                  onMouseDown={onMouseDownSlider}
                  onTouchMove={onTouchMoveSlider}
                >
                  {/* Left (Before) Frame */}
                  <div className="absolute inset-0">
                    <img
                      src={singleImageSrc}
                      alt="Before"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/10 z-10">
                      BEFORE · {((metadata?.size || 0) / 1024).toFixed(0)} KB
                    </div>
                  </div>

                  {/* Right (After) Frame with width clip */}
                  <div
                    style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
                    className="absolute inset-0 bg-slate-900"
                  >
                    <img
                      src={processedResult.dataUrl}
                      alt="After"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                    <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest z-10 shadow">
                      AFTER · {((processedResult.newSize || 0) / 1024).toFixed(0)} KB
                    </div>
                  </div>

                  {/* Slider Control Line handle */}
                  <div
                    style={{ left: `${sliderPosition}%` }}
                    className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-20 flex items-center justify-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary border-2 border-primary-foreground shadow flex items-center justify-center shrink-0">
                      <div className="flex gap-1">
                        <div className="w-0.5 h-3 bg-primary-foreground/75 rounded-full" />
                        <div className="w-0.5 h-3 bg-primary-foreground/75 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Static preview representation with transforms applied */
                <div className="relative flex items-center justify-center p-8 bg-slate-900/40 min-h-[320px]">
                  <img
                    src={singleImageSrc}
                    alt="Workspace"
                    className="max-h-[340px] max-w-full rounded border border-border/20 object-contain transition-transform duration-300"
                    style={{
                      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/10">
                    Source Graphic Loaded
                  </div>
                </div>
              )}
            </div>

            {/* Diagnostics Card */}
            {metadata && (
              <div className="bg-card/20 rounded-2xl border border-border/40 p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Info className="h-4 w-4" /> Image Health & Intelligence
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground block uppercase">Canvas Format</span>
                    <span className="text-foreground font-black">{metadata.type.split("/")[1].toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground block uppercase">Alpha/Transparency</span>
                    <span className={metadata.hasAlpha ? "text-emerald-500 font-bold" : "text-muted-foreground"}>
                      {metadata.hasAlpha ? "✓ Transparent (Alpha)" : "× None Required"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground block uppercase">Aspect Ratio</span>
                    <span className="text-foreground font-bold">{metadata.aspectRatio}</span>
                  </div>
                </div>

                {/* Health diagnostics items */}
                <div className="border-t border-border/10 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-muted-foreground">Orientation is corrected and normalized.</span>
                  </div>
                  {metadata.size > 1.5 * 1024 * 1024 && (
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-muted-foreground">Heavy payload ({(metadata.size / 1024 / 1024).toFixed(1)} MB). Compression is highly recommended.</span>
                    </div>
                  )}
                  {formatRecommendation && (
                    <div className="flex items-start gap-2 text-xs bg-primary/5 p-3 rounded-xl border border-primary/10">
                      <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-foreground">Recommended Format: <span className="text-primary">{formatRecommendation.recommendation}</span></p>
                        <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">{formatRecommendation.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Optimization Control Parameters Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-2xl p-6 shadow-sm">
              {/* Tab Navigation header within Workspace */}
              <div className="flex border-b border-border/20 pb-3 mb-5 overflow-x-auto gap-2">
                {[
                  { id: "compress", label: "Compress", icon: Sparkles },
                  { id: "resize", label: "Resize", icon: Maximize2 },
                  { id: "crop", label: "Crop", icon: Crop },
                  { id: "rotate", label: "Rotate", icon: RotateCw },
                  { id: "presets", label: "Presets", icon: Settings2 },
                  { id: "responsive", label: "Responsive", icon: Maximize2 },
                  { id: "seo", label: "SEO Audit", icon: CheckCircle2 },
                  { id: "base64", label: "Base64", icon: FileCode }
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setActiveTab(t.id); setProcessedResult(null); }}
                      className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
                        activeTab === t.id
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: COMPRESS SETTINGS */}
              {activeTab === "compress" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex gap-2 p-1 bg-secondary/20 border border-border/20 rounded-xl">
                    <button
                      onClick={() => setCompressionType("preset")}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        compressionType === "preset" ? "bg-background text-foreground shadow" : "text-muted-foreground"
                      }`}
                    >
                      Quick Presets
                    </button>
                    <button
                      onClick={() => setCompressionType("target")}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        compressionType === "target" ? "bg-background text-foreground shadow" : "text-muted-foreground"
                      }`}
                    >
                      Smart Target Size
                    </button>
                  </div>

                  {compressionType === "preset" ? (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Compression Target</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "best", label: "Best Quality", desc: "Minimal compression" },
                          { id: "balanced", label: "Balanced", desc: "Optimal size/quality" },
                          { id: "smallest", label: "Smallest Size", desc: "High compression" }
                        ].map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => setQualityPreset(preset.id as any)}
                            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                              qualityPreset === preset.id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border/30 hover:border-border/60 text-foreground"
                            }`}
                          >
                            <span className="text-[11px] font-black uppercase tracking-tight">{preset.label}</span>
                            <span className="text-[9px] text-muted-foreground mt-1 block">{preset.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 bg-secondary/10 rounded-xl border border-border/20">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target File Size (KB)</label>
                        <span className="text-xs font-mono font-black text-primary">{targetSizeKb} KB</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">Our binary search engine automatically searches for the best quality setting to match your target file constraint.</p>
                      <input
                        type="range"
                        min="20"
                        max="2000"
                        step="10"
                        value={targetSizeKb}
                        onChange={e => setTargetSizeKb(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>20 KB</span>
                        <span>2 MB</span>
                      </div>
                    </div>
                  )}

                  {/* Format Selection Dropdown */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Export Target Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["png", "jpeg", "webp"].map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => setTargetFormat(fmt as any)}
                          className={`py-2 px-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                            targetFormat === fmt
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border/20 hover:border-border/40 text-muted-foreground"
                          }`}
                        >
                          .{fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RESIZE SETTINGS */}
              {activeTab === "resize" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex gap-2 p-1 bg-secondary/20 border border-border/20 rounded-xl">
                    <button
                      onClick={() => setResizeUnit("px")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        resizeUnit === "px" ? "bg-background text-foreground shadow" : "text-muted-foreground"
                      }`}
                    >
                      Pixels
                    </button>
                    <button
                      onClick={() => setResizeUnit("percent")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        resizeUnit === "percent" ? "bg-background text-foreground shadow" : "text-muted-foreground"
                      }`}
                    >
                      Percentage
                    </button>
                  </div>

                  {resizeUnit === "px" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={resizeWidth}
                          onChange={e => handleWidthChange(parseInt(e.target.value) || 0)}
                          className="w-full h-10 px-3 bg-muted/40 border border-border/30 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={resizeHeight}
                          onChange={e => handleHeightChange(parseInt(e.target.value) || 0)}
                          className="w-full h-10 px-3 bg-muted/40 border border-border/30 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resize Scale</label>
                        <span className="text-xs font-mono font-bold">{resizePercent}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="5"
                        value={resizePercent}
                        onChange={e => setResizePercent(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                        <span>10% (Smaller)</span>
                        <span>200% (Upscale)</span>
                      </div>
                    </div>
                  )}

                  {resizeUnit === "px" && (
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={lockAspectRatio}
                        onChange={e => setLockAspectRatio(e.target.checked)}
                        className="rounded border-border/30 bg-background accent-primary text-primary"
                      />
                      Maintain Aspect Ratio
                    </label>
                  )}
                </div>
              )}

              {/* TAB 3: CROP SETTINGS */}
              {activeTab === "crop" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Aspect Ratio Constraints</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "custom", label: "Freeform Crop" },
                      { id: "1:1", label: "Square (1:1)" },
                      { id: "16:9", label: "Landscape (16:9)" },
                      { id: "4:3", label: "Standard (4:3)" }
                    ].map(aspect => (
                      <button
                        key={aspect.id}
                        onClick={() => setCropAspectRatio(aspect.id)}
                        className={`py-2 px-3 rounded-xl border text-xs font-black transition-all ${
                          cropAspectRatio === aspect.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/20 hover:border-border/40 text-muted-foreground"
                        }`}
                      >
                        {aspect.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-2 bg-secondary/10 p-3 rounded-xl border border-border/20">
                    Drag the bounds or adjust handles on the canvas sandbox image to crop visually.
                  </p>
                </div>
              )}

              {/* TAB 4: ROTATE SETTINGS */}
              {activeTab === "rotate" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Rotate Matrix</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { deg: 0, label: "0°" },
                      { deg: 90, label: "90°" },
                      { deg: 180, label: "180°" },
                      { deg: 270, label: "270°" }
                    ].map(rot => (
                      <button
                        key={rot.deg}
                        onClick={() => setRotation(rot.deg)}
                        className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                          rotation === rot.deg
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/20 hover:border-border/40 text-muted-foreground"
                        }`}
                      >
                        {rot.label}
                      </button>
                    ))}
                  </div>

                  {/* Flipping flips */}
                  <div className="flex gap-2 pt-2 border-t border-border/10">
                    <button
                      onClick={() => setFlipH(!flipH)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        flipH ? "border-primary bg-primary/5 text-primary" : "border-border/20 text-muted-foreground"
                      }`}
                    >
                      Flip Horizontal
                    </button>
                    <button
                      onClick={() => setFlipV(!flipV)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        flipV ? "border-primary bg-primary/5 text-primary" : "border-border/20 text-muted-foreground"
                      }`}
                    >
                      Flip Vertical
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: PRESETS SETTINGS */}
              {activeTab === "presets" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Select Use-Case Presets</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {[
                      { id: "website", label: "Website Optimized", desc: "WebP / 1200px" },
                      { id: "wordpress", label: "WordPress Banner", desc: "WebP / 1024px" },
                      { id: "shopify", label: "Shopify Product", desc: "WebP / 2048px" },
                      { id: "instagram", label: "Instagram Square", desc: "JPG / 1080px" },
                      { id: "youtube", label: "YouTube Thumbnail", desc: "WebP / 1280px" },
                      { id: "email", label: "Email Newsletter", desc: "JPG / 600px" },
                      { id: "nextjs", label: "Next.js Hero Block", desc: "WebP / 1920px" }
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => applyPreset(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedPreset === p.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/20 hover:border-border/40 text-foreground"
                        }`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-tight block">{p.label}</span>
                        <span className="text-[9px] text-muted-foreground mt-0.5 block">{p.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Output naming format */}
                  <div className="pt-2 border-t border-border/10">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Custom File Naming</label>
                    <input
                      type="text"
                      value={namingPattern}
                      onChange={e => setNamingPattern(e.target.value)}
                      className="w-full h-9 px-3 bg-muted/40 border border-border/30 rounded-xl text-xs font-mono font-bold"
                      placeholder="{name}-{width}x{height}"
                    />
                    <span className="text-[9px] text-muted-foreground block mt-1">Tokens: &#123;name&#125;, &#123;width&#125;, &#123;height&#125;</span>
                  </div>
                </div>
              )}

              {/* TAB: RESPONSIVE SRCSET GENERATOR */}
              {activeTab === "responsive" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Responsive HTML &lt;picture&gt; Snippet</label>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={responsiveCode}
                      className="w-full h-36 p-3 bg-muted/40 border border-border/30 rounded-xl text-[10px] font-mono break-all resize-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(responsiveCode);
                        setCopiedResponsive(true);
                        toast({ title: "Copied!", description: "Responsive HTML snippet copied to clipboard." });
                        setTimeout(() => setCopiedResponsive(false), 2000);
                      }}
                      className="absolute bottom-2 right-2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-all flex items-center gap-1 text-[10px] font-bold"
                    >
                      {copiedResponsive ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedResponsive ? "Copied HTML" : "Copy HTML"}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed bg-secondary/10 p-3 rounded-xl border border-border/20">
                    Generates fluid srcset breakpoints for 320w, 640w, 1024w, and 1920w viewports automatically.
                  </p>
                </div>
              )}

              {/* TAB: IMAGE SEO AUDIT REPORT */}
              {activeTab === "seo" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between p-3.5 bg-secondary/20 rounded-xl border border-border/20">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Image SEO Health Score</span>
                      <span className="text-xl font-black text-primary">{seoAudit.score} / 100</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      seoAudit.score >= 80 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {seoAudit.score >= 80 ? "Optimized" : "Needs Tuning"}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {seoAudit.items.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-border/15 bg-card/20 flex items-start gap-2 text-xs">
                        {item.passed ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-extrabold text-foreground">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: BASE64 SETTINGS */}
              {activeTab === "base64" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Raw Data URL Base64 Payload</label>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={base64Output}
                      className="w-full h-32 p-3 bg-muted/40 border border-border/30 rounded-xl text-[10px] font-mono break-all resize-none"
                    />
                    <button
                      onClick={copyBase64ToClipboard}
                      disabled={!base64Output}
                      className="absolute bottom-2 right-2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-all flex items-center gap-1 text-[10px] font-bold disabled:opacity-50"
                    >
                      {copiedBase64 ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedBase64 ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              {/* CORE ACTION SUBMISSION TRIGGER BUTTON */}
              <div className="mt-6 pt-5 border-t border-border/20 space-y-3">
                <button
                  onClick={handleProcessWorkspace}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Constructing Variant...
                    </>
                  ) : (
                    <>
                      <Settings2 className="h-4 w-4" /> Run Image Operations
                    </>
                  )}
                </button>

                {processedResult && (
                  <button
                    onClick={downloadProcessedSingle}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-primary-foreground text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-4 w-4" /> Save Final Image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Batch Processing Queue workflow layout */}
      {files.length > 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Batch Files Queue Table */}
            <div className="lg:col-span-8 bg-card/20 rounded-2xl border border-border/40 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/10 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                  Bulk Process queue ({files.length} images)
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">Ready for pipeline</span>
              </div>

              {/* Small Thumbnails Table Queue */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary/10 border border-border/20 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <FileImage className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-foreground">{f.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    {batchResults[i] && (
                      <span className="text-[10px] font-mono font-bold text-emerald-500">
                        -{batchResults[i].savedPercentage}% ({(batchResults[i].newSize / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Batch Globals Configuration control parameters */}
            <div className="lg:col-span-4 bg-card/40 backdrop-blur-xl border border-border/40 rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Settings2 className="h-4 w-4" /> Global Batch settings
              </h3>

              {/* Global Output Format */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Global Output Format</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["png", "jpeg", "webp"].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setTargetFormat(fmt as any)}
                      className={`py-1.5 px-2 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all ${
                        targetFormat === fmt
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border/10 text-muted-foreground"
                      }`}
                    >
                      .{fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resize Width Boundary (optional) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Max Boundary Width (optional)</label>
                <input
                  type="number"
                  placeholder="Keep original size"
                  value={resizeWidth === 800 ? "" : resizeWidth}
                  onChange={e => {
                    const v = parseInt(e.target.value);
                    setResizeWidth(v || 0);
                    setActiveTab(v ? "resize" : "compress");
                  }}
                  className="w-full h-10 px-3 bg-muted/40 border border-border/30 rounded-xl text-xs font-bold"
                />
              </div>

              {/* Global presets options shortcut */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Compression preset</label>
                <select
                  value={qualityPreset}
                  onChange={e => setQualityPreset(e.target.value as any)}
                  className="w-full h-10 px-3 bg-muted/40 border border-border/30 rounded-xl text-xs font-semibold text-foreground outline-none"
                >
                  <option value="best">Best quality (Low compression)</option>
                  <option value="balanced">Balanced (Optimal)</option>
                  <option value="smallest">Smallest file (High compression)</option>
                </select>
              </div>

              {/* Trigger loop actions */}
              <button
                onClick={handleProcessWorkspace}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Batch Processing {progress}%
                  </>
                ) : (
                  <>Compile Batch Queue</>
                )}
              </button>

              {batchResults.length > 0 && (
                <button
                  onClick={downloadBatchZip}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-primary-foreground text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="h-4 w-4" /> Download ZIP Package
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
