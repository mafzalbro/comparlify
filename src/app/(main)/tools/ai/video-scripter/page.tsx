"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateVideoScriptAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function VideoScripterPage() {
  const [topic, setTopic] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Video Scripter"
        description="Write a detailed video script including intro, main content, and conclusion with clear explanations."
        action={generateVideoScriptAction}
        submitLabel="Write Video Script"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Video Topic or Lesson
            </Label>
            <Textarea
              id="topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What is your video about? (e.g., 'How to bake a sourdough bread' or 'The basics of quantum physics')..."
              className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
