"use client";

import { useActionState, useState } from "react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateLessonSummaryAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LessonSummarizerForm() {
  const [content, setContent] = useState("");

  return (
    <AIToolForm
      title="AI Lesson Summarizer"
      description="Condense long lessons into concise, easy-to-digest summaries and key takeaways."
      action={generateLessonSummaryAction}
      submitLabel="Summarize"
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
            placeholder="Paste your lesson text or transcript here..."
            className="min-h-[200px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
            required
          />
        </div>
      </div>
    </AIToolForm>
  );
}
