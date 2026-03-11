"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Bookmark as BookmarkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  isBookmarkedAction,
  toggleBookmarkAction,
} from "@/app/actions/bookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  postId?: string;
  comparisonId?: string;
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export const BookmarkButton = React.memo(function BookmarkButton({
  postId,
  comparisonId,
  size = "default",
  className,
  showText = true,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const path = usePathname();

  useEffect(() => {
    setIsLoading(true);
    isBookmarkedAction({ postId, comparisonId }).then((result) => {
      setIsBookmarked(result);
      setIsLoading(false);
    });
  }, [postId, comparisonId]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startTransition(async () => {
        // Optimistic update
        setIsBookmarked((prev) => !prev);
        const result = await toggleBookmarkAction({
          postId,
          comparisonId,
          path,
        });

        if (result.error) {
          // Revert optimistic update
          setIsBookmarked((prev) => !prev);
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
      });
    },
    [postId, comparisonId, path, toast],
  );

  if (isLoading) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        <Loader2 className={cn("h-4 w-4 animate-spin", showText && "mr-2")} />
        {showText && "Loading"}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      className={cn(
        "rounded-xl transition-all duration-300 active:scale-90 h-9 px-4 font-bold uppercase tracking-wider text-[10px] border-border/10 bg-card/10 backdrop-blur-md hover:bg-primary/5 hover:border-primary/20 hover:text-primary shadow-lg shadow-black/5 group",
        isBookmarked &&
          "bg-primary/10 border-primary/20 text-primary shadow-primary/10",
        className,
      )}
      onClick={handleClick}
      disabled={isPending}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isPending ? (
        <Loader2
          className={cn("h-3.5 w-3.5 animate-spin", showText && "mr-2")}
        />
      ) : (
        <BookmarkIcon
          className={cn(
            "h-3.5 w-3.5 transition-transform group-hover:scale-110 duration-500",
            isBookmarked && "fill-current",
            showText && "mr-2",
          )}
        />
      )}
      {showText && (isBookmarked ? "Bookmarked" : "Bookmark")}
    </Button>
  );
});
