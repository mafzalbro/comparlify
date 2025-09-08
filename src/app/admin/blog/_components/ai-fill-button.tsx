'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { generateGenericContentAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface AiFillButtonProps {
    fieldType: string;
    topic: string;
    context?: string;
    onContentReceived: (content: string) => void;
    className?: string;
}

export function AiFillButton({ fieldType, topic, context, onContentReceived, className }: AiFillButtonProps) {
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
        const result = await generateGenericContentAction({ fieldType, topic, context });
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
            disabled={isLoading}
            className={className}
            title={`Auto-fill ${fieldType.toLowerCase()}`}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
            <span className="sr-only">Auto-fill with AI</span>
        </Button>
    )
}
