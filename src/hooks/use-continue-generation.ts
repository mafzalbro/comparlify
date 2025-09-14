
'use client';

import * as React from 'react';
import { useTransition, useMemo, type RefObject } from 'react';

interface UseContinueGenerationProps {
  formRef: RefObject<HTMLFormElement>;
  content: string | null | undefined;
}

// Regex to check if the content does NOT end with a common sentence-ending character,
// optionally followed by whitespace, quotes, parentheses, or brackets.
const isLikelyIncompleteRegex = /[^.!?\])'"`\s]$/i;

export function useContinueGeneration({
  formRef,
  content,
}: UseContinueGenerationProps) {
  const [isContinuing, startTransition] = useTransition();

  const handleContinue = () => {
    if (!formRef.current || !content) return;
    
    startTransition(() => {
        const submitter = document.createElement('button');
        submitter.type = 'submit';
        submitter.style.display = 'none';
        formRef.current?.appendChild(submitter);
        submitter.click();
        formRef.current?.removeChild(submitter);
    });
  };

  const isContentIncomplete = useMemo(() => {
    if (!content) return false;
    // Check if the content is not empty and seems to be cut-off
    return content.trim().length > 0 && isLikelyIncompleteRegex.test(content.trim());
  }, [content]);

  return {
    isContinuing,
    isContentIncomplete,
    handleContinue,
  };
}
