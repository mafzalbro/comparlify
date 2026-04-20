"use client";

import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareButtonProps {
  className?: string;
}

export const ShareButton = React.memo(function ShareButton({
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "The article link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleNativeShare = useCallback(async () => {
    const shareData = {
      title: document.title,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      handleCopy();
    }
  }, [handleCopy]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNativeShare}
          className={cn(
            "h-12 w-12 rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all",
            className,
          )}
          aria-label="Share article"
        >
          {copied ? (
            <Check className="h-5 w-5 animate-in fade-in zoom-in" />
          ) : (
            <Share2 className="h-5 w-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied ? "Link Copied" : "Share"}</p>
      </TooltipContent>
    </Tooltip>
  );
});
