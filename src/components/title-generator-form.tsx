"use client";

import { useActionState, useState } from "react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateCourseTitleAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TitleGeneratorForm() {
  const [description, setDescription] = useState("");

  return (
    <AIToolForm
      title="AI Title Generator"
      description="Generate catchy and SEO-optimized titles for your courses, blogs, or videos."
      action={generateCourseTitleAction}
      submitLabel="Generate Titles"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="courseDescription" className="text-sm font-bold uppercase tracking-wider opacity-70">
            Topic or Description
          </Label>
          <Textarea
            id="courseDescription"
            name="courseDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 'A course about teaching photography to absolute beginners'..."
            className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
            required
          />
          <p className="text-[10px] text-muted-foreground italic px-1">
            Provide a brief description of what you're creating titles for.
          </p>
        </div>
      </div>
    </AIToolForm>
  );
}
