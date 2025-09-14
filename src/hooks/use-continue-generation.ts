
'use client';

import * as React from 'react';
import { useTransition, useMemo, createContext, useContext, type RefObject } from 'react';

// Regex to check if the content does NOT end with a common sentence-ending character,
// optionally followed by whitespace, quotes, parentheses, or brackets.
const isLikelyIncompleteRegex = /[^.!?\])'"`\s]$/i;

type ContinueGenerationContextType = {
    isSubmitting: boolean;
    isContentIncomplete: boolean;
    handleContinue: () => void;
};

const ContinueGenerationContext = createContext<ContinueGenerationContextType>({
    isSubmitting: false,
    isContentIncomplete: false,
    handleContinue: () => {},
});

export const useContinueGeneration = () => {
    return useContext(ContinueGenerationContext);
};

interface ContinueGenerationProviderProps {
    formRef: RefObject<HTMLFormElement>;
    content: string | null | undefined;
    children: React.ReactNode;
}

export const ContinueGenerationProvider: React.FC<ContinueGenerationProviderProps> = ({
    formRef,
    content,
    children,
}) => {
    const [isContinuing, startTransition] = useTransition();

    const isContentIncomplete = useMemo(() => {
        if (!content) return false;
        return isLikelyIncompleteRegex.test(content);
    }, [content]);

    const handleContinue = () => {
        if (formRef.current) {
            startTransition(() => {
                formRef.current?.requestSubmit();
            });
        }
    };
    
    const value = {
        isSubmitting: isContinuing,
        isContentIncomplete,
        handleContinue,
    };

    return (
        <ContinueGenerationContext.Provider value={value}>
            {children}
        </ContinueGenerationContext.Provider>
    );
};
