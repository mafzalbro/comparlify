"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateEmailSubjectLinesAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EmailSubjectLinesPage() {
  const [topic, setTopic] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Email Subject Line Generator"
        description="Generate 10 compelling, attention-grabbing email subject lines optimized for high open rates."
        action={generateEmailSubjectLinesAction}
        submitLabel="Generate Subject Lines"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailTopic" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Email Topic
            </Label>
            <Textarea
              id="emailTopic"
              name="emailTopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What is your email about? (e.g., 'Special discount for new course' or 'How to get started with SEO')..."
              className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
