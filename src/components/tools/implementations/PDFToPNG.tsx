"use client";

import React, { forwardRef } from "react";
import { UniversalConverter } from "@/components/tools/converters/universal-converter";

export const PDFToPNG = forwardRef(
  ({ initialFile }: { initialFile?: File | null }, ref) => {
    return (
      <UniversalConverter
        ref={ref}
        initialFrom="pdf"
        initialTo="png"
        initialFile={initialFile}
        forceEmbedded={true}
      />
    );
  },
);
