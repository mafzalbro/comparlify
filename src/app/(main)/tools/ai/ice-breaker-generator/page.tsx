"use client";

import { useState } from "react";
import { Coffee } from "lucide-react";
import { AIToolForm } from "@/components/ai-tool-form";
import { generateIceBreakersAction } from "@/app/actions/ai";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function IceBreakerGeneratorPage() {
  const [context, setContext] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AIToolForm
        title="AI Ice Breaker Generator"
        description="Generate creative and engaging ice breaker activities or questions for workshops, classes, or meetings."
        action={generateIceBreakersAction}
        submitLabel="Generate Ice Breakers"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="context" className="text-sm font-bold uppercase tracking-wider opacity-70">
              Event Context
            </Label>
            <Textarea
              id="context"
              name="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="What is the context? (e.g., 'A first day of a web design class' or 'A remote team building meeting')..."
              className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all resize-none p-4"
              required
            />
          </div>
        </div>
      </AIToolForm>
    </div>
  );
}
