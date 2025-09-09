
'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { Bookmark as BookmarkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { isBookmarkedAction, toggleBookmarkAction } from '@/app/actions/bookmarks';

interface BookmarkButtonProps {
  contentId: string;
  contentType: "POST" | "COMPARISON";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
}

export function BookmarkButton({ contentId, contentType, size = "default", className }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const path = usePathname();

  useEffect(() => {
    setIsLoading(true);
    isBookmarkedAction({ contentId, contentType }).then((result) => {
      setIsBookmarked(result);
      setIsLoading(false);
    });
  }, [contentId, contentType]);

  const handleClick = () => {
    startTransition(async () => {
      // Optimistic update
      setIsBookmarked(prev => !prev);
      const result = await toggleBookmarkAction({ contentId, contentType, path });

      if (result.error) {
        // Revert optimistic update
        setIsBookmarked(prev => !prev);
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };
  
  if (isLoading) {
    return <Button variant="outline" size={size} className={className} disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading</Button>;
  }

  return (
    <Button
      variant="outline"
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isPending}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <BookmarkIcon className={`mr-2 h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
      )}
      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
    </Button>
  );
}
