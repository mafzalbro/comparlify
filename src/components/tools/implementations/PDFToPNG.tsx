"use client";

import React from "react";
import { UniversalConverter } from "@/components/tools/converters/universal-converter";

export function PDFToPNG() {
  return <UniversalConverter initialFrom="pdf" initialTo="png" />;
}
