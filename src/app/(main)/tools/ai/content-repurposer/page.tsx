"use client";

import { useState } from "react";
import { Repeat } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateContentRepurposeIdeasAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContentRepurposePage() {
  const [content, setContent] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Content Repurposer"
        description="Turn one piece of content into dozens. Generate creative ideas for blog posts, social media, videos, and more."
        action={generateContentRepurposeIdeasAction}
        submitLabel="Get Repurpose Ideas"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="originalContent" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Original Content Snippet
            </Label>
            <Textarea
              id="originalContent"
              name="originalContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste a summary, transcript, or blog post excerpt here..."
              className="min-h-[150px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
            <p className="text-[10px] text-muted-foreground italic px-1">
              Provide the core content you want to repurpose.
            </p>
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
