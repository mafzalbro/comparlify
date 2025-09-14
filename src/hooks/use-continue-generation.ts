
'use client';

import { useTransition, useMemo, type RefObject, useFormStatus } from 'react';

interface UseContinueGenerationProps {
  formRef: RefObject<HTMLFormElement>;
  formAction: (payload: FormData) => void;
  content: string | null | undefined;
}

// Regex to check if the content does NOT end with a common sentence-ending character,
// optionally followed by whitespace, quotes, parentheses, or brackets.
const isLikelyIncompleteRegex = /[^.!?\])'"`\s]$/i;

const ContinueGenerationContext = React.createContext<{
    isSubmitting: boolean;
}>({
    isSubmitting: false,
});


export function useContinueGeneration({
  formRef,
  formAction,
  content,
}: UseContinueGenerationProps) {
  const [isContinuing, startTransition] = useTransition();
  const { pending: isFormSubmitting } = useFormStatus();

  const isSubmitting = isContinuing || isFormSubmitting;

  const handleContinue = () => {
    if (!formRef.current || !content) return;
    
    startTransition(() => {
        const formData = new FormData(formRef.current!);
        formAction(formData);
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
    isSubmitting,
    handleContinue,
  };
}
