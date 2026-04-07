"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateCourseDescriptionAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CourseDescriptionWriterPage() {
  const [title, setTitle] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Course Description Writer"
        description="Write a compelling course description that highlights key benefits, target audience, and what students will learn."
        action={generateCourseDescriptionAction}
        submitLabel="Write Description"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseTitle" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Course Title or Concept
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
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
