"use client";

import { useState } from "react";
import { generateGenericContentAction } from "@/app/actions/ai";
import { AIToolForm } from "@/components/ai-tool-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit } from "lucide-react";
import type { Tool } from "@prisma/client";

export function AIGenericForm({ tool }: { tool: Tool }) {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");

  const hasContextField = tool.prompt.includes("{{{context}}}");

  const action = async (prevState: any, formData: FormData) => {
    const topicVal = formData.get("topic") as string;
    const contextVal = formData.get("context") as string | undefined;
    return generateGenericContentAction({
      prompt: tool.prompt,
      topic: topicVal,
      context: contextVal,
    });
  };

  return (
    <AIToolForm.Root
      action={action}
      dirty={topic.length > 0 || context.length > 0}
    >
      <AIToolForm.Config>
        <AIToolForm.Header title={tool.title} description={tool.description} />
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Main Topic
            </Label>
            <div className="relative group">
              <Input
                name="topic"
                required
                placeholder="e.g. Next.js vs Remix performance"
                className="h-14 rounded-xl bg-background/50 border-border/50 text-lg focus:ring-primary/20 transition-all font-medium"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <BrainCircuit className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30 group-focus-within:text-primary transition-colors" />
            </div>
          </div>

          {hasContextField && (
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Additional Context
              </Label>
              <Textarea
                name="context"
                placeholder="Specific metrics, target audience, or key features to highlight..."
                rows={5}
                className="rounded-xl bg-background/50 border-border/50 text-base focus:ring-primary/20 transition-all resize-none font-medium leading-relaxed"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
          )}
        </div>

        <AIToolForm.Submit label="Forge Content" />
      </AIToolForm.Config>

      <AIToolForm.Output>
        <AIToolForm.Result />
        <AIToolForm.Empty />
        <AIToolForm.Error />
      </AIToolForm.Output>
    </AIToolForm.Root>
  );
}
