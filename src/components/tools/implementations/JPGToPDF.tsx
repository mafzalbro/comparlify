"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Image as ImageIcon, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageItem {
  file: File;
  name: string;
}

export function JPGToPDF() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const list = Array.from(e.target.files).map((f) => ({
      file: f,
      name: f.name,
    }));
    setImages((prev) => [...prev, ...list]);
    setError(null);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError("Please add at least one image to convert.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const imageBytes = await item.file.arrayBuffer();
        let image;
        if (item.file.type === "image/png") {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "converted_images.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Images compiled into PDF successfully.",
      });
    } catch (err: any) {
      setError("Failed to convert images. Please ensure they are standard PNG or JPG/JPEG images.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3">
        <label className="text-sm font-bold text-foreground">
          Upload JPG or PNG images
        </label>

        <div className="border-2 border-dashed border-border/40 hover:border-primary/45 rounded-2xl p-8 text-center cursor-pointer relative bg-secondary/10 transition-colors">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-10 w-10 text-primary opacity-60" />
            <p className="text-sm font-bold text-foreground">Click to upload or drag images here</p>
            <p className="text-xs text-muted-foreground">Supports JPG, JPEG, and PNG formats</p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Selected Images ({images.length})
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {images.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-border/10 bg-secondary/30 text-xs font-medium"
              >
                <span className="truncate pr-4 text-foreground font-bold">{item.name}</span>
                <button
                  onClick={() => handleRemove(idx)}
                  className="p-1 rounded-md hover:bg-secondary transition-colors text-destructive"
                  title="Remove Image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleConvert}
            disabled={processing}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Compiling PDF...
              </>
            ) : (
              "Compile Images into PDF"
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
