"use client";

import React from "react";
import { UniversalConverter } from "@/components/tools/converters/universal-converter";

export function PDFToJPG() {
  return <UniversalConverter initialFrom="pdf" initialTo="jpg" />;
}
