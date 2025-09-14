
'use client';

import { useState, useTransition, useMemo, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';

interface UseContinueGenerationProps {
  formRef: RefObject<HTMLFormElement>;
  formAction: (payload: FormData) => void;
  content: string | null | undefined;
  fieldToContinue: string;
  buttonText?: string;
}

// Regex to check if the content ends with a common sentence-ending character,
// optionally followed by whitespace, quotes, parentheses, or brackets.
const isLikelyIncompleteRegex =
  /(?<!\w)[.!?]$|[^.!?\])'"`\s]$/i;


export function useContinueGeneration({
  formRef,
  formAction,
  content,
  fieldToContinue,
  buttonText = 'Continue Generating',
}: UseContinueGenerationProps) {
  const [isContinuing, startTransition] = useTransition();

  const handleContinue = () => {
    if (!formRef.current || !content) return;
    
    startTransition(() => {
        const formData = new FormData(formRef.current!);
        // Ensure the hidden field has the latest content before submission
        formData.set(fieldToContinue, content);
        formAction(formData);
    });
  };

  const isContentIncomplete = useMemo(() => {
    if (!content) return false;
    // Check if the content is not empty and seems to be cut-off
    return content.trim().length > 0 && isLikelyIncompleteRegex.test(content.trim());
  }, [content]);


  const ContinueButton = () => (
    <Button
      onClick={handleContinue}
      className="w-full"
      variant="outline"
      type="button"
      disabled={isContinuing}
    >
      {isContinuing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Continuing...
        </>
      ) : (
        <>
          <PlusCircle className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );

  return {
    isContinuing,
    isContentIncomplete,
    handleContinue,
    ContinueButton,
  };
}
