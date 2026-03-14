
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { generateGenericContentAction } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";

interface AiFillButtonProps {
    fieldType: string;
    topic: string;
    context?: string;
    onContentReceived: (content: string) => void;
    className?: string;
    disabled?: boolean;
}

export function AiFillButton({ fieldType, topic, context, onContentReceived, className, disabled }: AiFillButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAiFill = async () => {
        if (!topic) {
            toast({
                title: "Topic Required",
                description: "Please provide a title or topic before using the AI fill.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        const prompt = `Generate a high-quality, professional ${fieldType} based on the provided topic. 
        
        STRICT RULES:
        - HUMAN VOICE: Write like a real person, using active voice and a direct, helpful tone.
        - SHORT CONTENT: Keep paragraphs extremely short (1-2 sentences). 
        - FORMATTING: Use bold text for emphasis and bullet points where lists are appropriate.
        - NO FLUFF: Avoid long-winded introductions or corporate filler text.
        
        Topic: {{{topic}}}
        Context: {{{context}}}`;
        const result = await generateGenericContentAction({ prompt, topic, context });
        setIsLoading(false);

        if (result.error) {
             toast({
                title: "AI Error",
                description: result.error,
                variant: "destructive"
            });
        } else if (result.generatedContent) {
            onContentReceived(result.generatedContent);
        }
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleAiFill}
            disabled={isLoading || disabled}
            className={className}
            title={`Auto-fill ${fieldType.toLowerCase()}`}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
            <span className="sr-only">Auto-fill with AI</span>
        </Button>
    )
}
