"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateQuizAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function QuizGeneratorPage() {
  const [topic, setTopic] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Quiz Generator"
        description="Create comprehensive quizzes with multiple-choice questions, correct answers, and explanations for any topic."
        action={generateQuizAction}
        submitLabel="Generate Quiz"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Quiz Topic
            </Label>
            <Textarea
              id="topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What should the quiz be about? (e.g., 'React fundamentals' or 'History of Ancient Rome')..."
              className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
