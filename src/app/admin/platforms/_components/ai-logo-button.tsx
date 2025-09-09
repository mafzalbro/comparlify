
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { generateLogoAction } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";

interface AiLogoButtonProps {
    platformName: string;
    onLogoReceived: (logoUrl: string) => void;
    className?: string;
}

export function AiLogoButton({ platformName, onLogoReceived, className }: AiLogoButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAiFill = async () => {
        if (!platformName) {
            toast({
                title: "Platform Name Required",
                description: "Please provide a name for the platform before generating a logo.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        const result = await generateLogoAction({ name: platformName });
        setIsLoading(false);

        if (result.error) {
             toast({
                title: "AI Error",
                description: result.error,
                variant: "destructive"
            });
        } else if (result.logoUrl) {
            onLogoReceived(result.logoUrl);
            toast({
                title: "Logo Generated!",
                description: "The AI has created a new logo for this platform.",
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
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2 text-primary" />}
            Generate Logo
        </Button>
    )
}
