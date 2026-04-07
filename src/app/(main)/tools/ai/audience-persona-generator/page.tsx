"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateAudiencePersonaAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AudiencePersonaGeneratorPage() {
  const [title, setTitle] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Audience Persona Generator"
        description="Understand your ideal student by creating a detailed audience persona based on your course idea."
        action={generateAudiencePersonaAction}
        submitLabel="Generate Persona"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseTitle" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Course Idea or Title
            </Label>
            <Textarea
              id="courseTitle"
              name="courseTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 'Mastering Modern Web Design' or 'Introduction to Digital Photography'..."
              className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
            <p className="text-[10px] text-muted-foreground italic px-1">
              What kind of course are you planning?
            </p>
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
