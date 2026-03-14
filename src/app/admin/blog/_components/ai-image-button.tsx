
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Image as ImageIcon } from "lucide-react";
import { generateImageAction } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";

interface AiImageButtonProps {
    prompt: string;
    onImageReceived: (imageUrl: string) => void;
    className?: string;
}

export function AiImageButton({ prompt, onImageReceived, className }: AiImageButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAiFill = async () => {
        const activePrompt = prompt?.trim();
        
        if (!activePrompt) {
            toast({
                title: "Input Required",
                description: "I need a Title or an 'AI Prompt for Image' to know what to generate.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        const result = await generateImageAction({ prompt: activePrompt });
        setIsLoading(false);

        if (result.error) {
             toast({
                title: "AI Error",
                description: result.error,
                variant: "destructive"
            });
        } else if (result.imageUrl) {
            onImageReceived(result.imageUrl);
            toast({
                title: "Image Generated!",
                description: "The AI has created a new image for your post.",
            });
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={handleAiFill}
            disabled={isLoading}
            className={className}
        >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2 text-primary" />}
            Generate Image
        </Button>
    )
}
