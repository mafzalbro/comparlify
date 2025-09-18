"use client";

import { useTransition, useMemo, type RefObject } from "react";

// Regex to check if the content does NOT end with a common sentence-ending character,
// optionally followed by whitespace, quotes, parentheses, ** or brackets.

const isLikelyIncompleteRegex = /(?:[^!\.\]\)]\s*$|^\s*$|\*\*\s*$)/;

interface UseContinueGenerationProps {
  formRef: RefObject<HTMLFormElement>;
  content: string | null | undefined;
}

export function useContinueGeneration({
  formRef,
  content,
}: UseContinueGenerationProps) {
  const [isContinuing, startTransition] = useTransition();

  const isContentIncomplete = useMemo(() => {
    if (!content) return false;
    // Check if the content is likely incomplete based on the last character.
    return isLikelyIncompleteRegex.test(content);
  }, [content]);

  const handleContinue = () => {
    if (formRef.current) {
      startTransition(() => {
        formRef.current?.requestSubmit();
      });
    }
  };

  return {
    isContinuing,
    isContentIncomplete,
    handleContinue,
  };
}
