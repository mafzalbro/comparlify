"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateLearningObjectivesAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LearningObjectivesGeneratorPage() {
  const [topic, setTopic] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Learning Objectives Generator"
        description="Create clear, measurable learning objectives using Bloom's Taxonomy for any lesson topic."
        action={generateLearningObjectivesAction}
        submitLabel="Generate Objectives"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lessonTopic" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Lesson Topic
            </Label>
            <Textarea
              id="lessonTopic"
              name="lessonTopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What is the lesson about? (e.g., 'Introduction to React Hooks' or 'Understanding the Solar System')..."
              className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
