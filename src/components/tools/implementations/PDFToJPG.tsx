"use client";

import React, { forwardRef } from "react";
import { UniversalConverter } from "@/components/tools/converters/universal-converter";

export const PDFToJPG = forwardRef(
  ({ initialFile }: { initialFile?: File | null }, ref) => {
    return (
      <UniversalConverter
        ref={ref}
        initialFrom="pdf"
        initialTo="jpg"
        initialFile={initialFile}
        forceEmbedded={true}
      />
    );
  },
);
