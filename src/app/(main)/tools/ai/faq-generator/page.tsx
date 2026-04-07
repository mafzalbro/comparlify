"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateFaqsAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function FaqGeneratorPage() {
  const [topic, setTopic] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI FAQ Generator"
        description="Generate a comprehensive list of frequently asked questions (FAQs) with detailed answers for any topic."
        action={generateFaqsAction}
        submitLabel="Generate FAQs"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Topic or Content
            </Label>
            <Textarea
              id="topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to generate FAQs for? (e.g., 'A new software product' or 'A travel guide to Japan')..."
              className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
