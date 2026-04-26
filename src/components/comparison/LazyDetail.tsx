"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

/**
 * LazyDetail renders a button to load full analysis content lazily.
 * It uses next/dynamic with ssr:false to import MarkdownContent on demand.
 */
const LazyMD = dynamic(
  () => import("@/components/markdown-content").then((mod) => mod.MarkdownContent),
  {
    ssr: false,
    loading: () => <p className="text-muted-foreground">Loading details…</p>,
  },
);

export default function LazyDetail({ content }: { content: string }) {
  const [showFull, setShowFull] = React.useState(false);

  return (
    <>
      {showFull ? (
        <LazyMD content={content} />
      ) : (
        <Button variant="outline" onClick={() => setShowFull(true)} className="mt-4">
          Read Full Analysis
        </Button>
      )}
    </>
  );
}
