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
  Plus,
  ArrowRightLeft,
  GripVertical
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

export function ImageToPdfConverter() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => file.type.startsWith("image/"));
    
    if (validFiles.length < selectedFiles.length) {
      toast({
        title: "Invalid Files Skipped",
        description: "Only image files (PNG, JPG, etc.) are allowed.",
        variant: "destructive",
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertToPdf = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const pdf = new jsPDF();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer]);
        const url = URL.createObjectURL(blob);
        
        // Create an image element to get dimensions
        const img = new Image();
        img.src = url;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const imgProps = pdf.getImageProperties(img);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, pdfWidth, pdfHeight);
        URL.revokeObjectURL(url);
      }

      pdf.save("converted-document.pdf");
      toast({
        title: "PDF Created",
        description: "Your document has been generated and downloaded.",
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({
        title: "Failed",
        description: "Something went wrong while creating the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
                Source Images
              </h3>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/10 hover:border-primary/20 hover:bg-muted/30 rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all cursor-pointer"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
                multiple
              />
              <div className="p-4 bg-muted/50 rounded-2xl text-muted-foreground mb-4 font-black">
                <Plus className="h-8 w-8" />
              </div>
              <p className="text-xs font-black uppercase tracking-tight text-foreground">Add Images</p>
              <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">JPG, PNG, WEBP</p>
            </div>

            <Button 
              onClick={convertToPdf}
              disabled={files.length === 0 || isProcessing}
              className="w-full h-14 rounded-2xl bg-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assembling PDF...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>

            <div className="pt-6 border-t border-border/10 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">
                  100% Client-Side.<br/>Your private photos never leave this browser.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Queue & Management */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-xl h-full min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              Document <span className="text-primary italic">Assembly</span>
            </h3>
            <div className="px-4 py-1.5 rounded-full bg-muted border border-border/10 text-[10px] font-black uppercase tracking-widest">
              {files.length} Assets in Queue
            </div>
          </div>

          <div className="space-y-3">
            {files.length > 0 ? (
              files.map((file, i) => (
                <MotionDiv
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl border border-border/10 bg-background/40 flex items-center gap-4 group"
                >
                  <div className="p-2 text-muted-foreground/30">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden border border-border/10 shrink-0">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase truncate">{file.name}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      {(file.size / 1024).toFixed(0)} KB • Page {i + 1}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFile(i)}
                    className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </MotionDiv>
              ))
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <div className="p-8 bg-muted/20 rounded-[2.5rem] border border-dashed border-border/20">
                  <ArrowRightLeft className="h-16 w-16 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight mb-2">Queue is Empty</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-[250px] leading-relaxed">
                    Add images to start building your PDF document. You can reorder them soon.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
