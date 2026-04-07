"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateAnalogyAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AnalogyGeneratorPage() {
  const [topic, setTopic] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Analogy Generator"
        description="Simplify complex topics by generating relatable and easy-to-understand analogies."
        action={generateAnalogyAction}
        submitLabel="Craft Analogy"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="complexTopic" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Complex Topic
            </Label>
            <Textarea
              id="complexTopic"
              name="complexTopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Blockchain technology' or 'How a CPU works'..."
              className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
            <p className="text-[10px] text-muted-foreground italic px-1">
              Provide a concept you want to explain simply.
            </p>
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
