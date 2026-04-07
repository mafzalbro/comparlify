"use client";

import { useState } from "react";
import { FileSearch } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateLessonSummaryAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LessonSummarizerPage() {
  const [content, setContent] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Lesson Summarizer"
        description="Summarize long lesson content into key points and takeaways, making it easy to review."
        action={generateLessonSummaryAction}
        submitLabel="Summarize Lesson"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lessonContent" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Lesson Content
            </Label>
            <Textarea
              id="lessonContent"
              name="lessonContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your lesson content or transcript here..."
              className="min-h-[200px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
