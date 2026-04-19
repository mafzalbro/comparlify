"use client";

import React from "react";
import { Format } from "./types";

interface SeoContentProps {
  fromFormat: Format;
  toFormat: Format;
}

const SEO_DATA: Record<string, { title: string; description: string; tips: string[] }> = {
  "html-png": {
    title: "How to convert HTML to PNG Local & Free",
    description: "Convert your HTML webpages into high-quality PNG images securely within your browser. This tool renders webpage code accurately without sending your data to any external server.",
    tips: [
      "Ensure your HTML includes all necessary inline CSS for accurate styling.",
      "The tool renders the HTML in a virtual 1200x1200px viewport.",
      "Conversion runs 100% locally using your device's RAM for maximum privacy."
    ]
  },
  "pdf-png": {
    title: "Fast PDF to PNG Converter",
    description: "Extract high-resolution PNG images from your PDF documents instantly. Perfect for presentations, web design, or sharing specific pages as standalone images securely.",
    tips: [
      "Every page of the PDF will be extracted as a separate PNG image.",
      "Images are rendered at 2x scale to maintain high clarity and readability.",
      "No file size limits since processing happens locally."
    ]
  },
  "jpg-pdf": {
    title: "Merge JPG to PDF Securely",
    description: "Combine multiple JPG images into a single PDF document. Ideal for creating portfolios, scanning documents, or organizing photos.",
    tips: [
      "You can arrange images in order before conversion.",
      "Each image is automatically scaled to fit standard PDF pages.",
      "Your images never leave your device."
    ]
  },
  "png-jpg": {
    title: "PNG to JPG Converter & Compressor",
    description: "Convert uncompressed PNG files to lightweight JPG format without losing noticeable quality. Great for optimizing images for web use.",
    tips: [
      "Transparent backgrounds in PNG will be converted to a white background in JPG.",
      "Adjust the compression quality slider for smaller file sizes.",
      "Batch convert dozens of images simultaneously."
    ]
  },
  "pdf-pdf": {
    title: "PDF Compressor Tool",
    description: "Reduce the file size of your heavy PDF documents by rasterizing and compressing the pages locally.",
    tips: [
      "Adjust the slider to balance visual quality and file size reduction.",
      "Vector text will be rasterized, meaning text selection may no longer work.",
      "Processing relies on your device RAM, large PDFs may take a moment."
    ]
  }
};

export function SeoContent({ fromFormat, toFormat }: SeoContentProps) {
  const combinationKey = `${fromFormat.id}-${toFormat.id}`;
  const data = SEO_DATA[combinationKey] || {
    title: `Convert ${fromFormat.name} to ${toFormat.name} Instantly`,
    description: `Easily convert your ${fromFormat.name} files into ${toFormat.name} format. Fast, private, and free — everything is processed locally in your browser.`,
    tips: [
      `Files are processed quickly to ${toFormat.extension.toUpperCase()}.`,
      "Supports batch processing for multiple files.",
      "Maximum security and privacy guaranteed."
    ]
  };

  return (
    <div className="mt-16 w-full max-w-[1000px] mx-auto opacity-70 hover:opacity-100 transition-opacity duration-500">
      <div className="bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 text-primary">
          {data.title}
        </h2>
        
        <p className="text-muted-foreground font-medium md:text-lg mb-8 leading-relaxed">
          {data.description}
        </p>

        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-primary/80">Pro Tips</h3>
          <ul className="space-y-3">
            {data.tips.map((tip, index) => (
              <li key={index} className="flex gap-3 text-sm font-medium text-muted-foreground">
                <span className="text-primary font-bold">0{index + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
