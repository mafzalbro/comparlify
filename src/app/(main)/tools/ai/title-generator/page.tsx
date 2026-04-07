"use client";

import { useState } from "react";
import { Type } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateCourseTitleAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CourseTitleGeneratorPage() {
  const [description, setDescription] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Course Title Generator"
        description="Generate 10 catchy, SEO-friendly course titles based on your course description. Compelling and clear."
        action={generateCourseTitleAction}
        submitLabel="Generate Titles"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseDescription" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Course Description
            </Label>
            <Textarea
              id="courseDescription"
              name="courseDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your course is about in a few sentences..."
              className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
