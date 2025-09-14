
'use client';

import * as React from 'react';
import { useTransition, useMemo, createContext, useContext, type RefObject } from 'react';
import { useFormStatus } from 'react-dom';

interface UseContinueGenerationProps {
  formRef: RefObject<HTMLFormElement>;
  content: string | null | undefined;
}

// Regex to check if the content does NOT end with a common sentence-ending character,
// optionally followed by whitespace, quotes, parentheses, or brackets.
const isLikelyIncompleteRegex = /[^.!?\])'"`\s]$/i;

type ContinueGenerationContextType = {
    isSubmitting: boolean;
    handleContinue: () => void;
};

const ContinueGenerationContext = createContext<ContinueGenerationContextType>({
    isSubmitting: false,
    handleContinue: () => {},
});

export const useContinueGeneration = () => {
    return useContext(ContinueGenerationContext);
};

export const ContinueGenerationProvider = ({ children }: { children: React.ReactNode }) => {
    const [isContinuing, startTransition] = useTransition();
    const { pending: isFormSubmitting } = useFormStatus();

    const isSubmitting = isContinuing || isFormSubmitting;
    
    const handleContinue = () => {
        // This function will be implemented by the child that has access to the form ref
        // We just provide the loading state context here.
        startTransition(() => {
            // This is a placeholder; the real logic will be in the component.
            // The context consumer will trigger the actual form submission.
        });
    };

    const value = {
        isSubmitting,
        handleContinue: () => {} // Will be replaced in consuming component
    }

    return (
        <ContinueGenerationContext.Provider value={value}>
            {children}
        </ContinueGenerationContext.Provider>
    )
}
