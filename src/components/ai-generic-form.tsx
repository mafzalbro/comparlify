"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { generateGenericContentAction } from "@/app/actions/ai";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Sparkles,
  Copy,
  RefreshCw,
  Wand2,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import { MarkdownContent } from "./markdown-content";
import { AIGenerationLoader } from "./ai-generation-loader";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import type { Tool } from "@prisma/client";
import { MotionDiv } from "./motion-wrapper";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Crafting Magic...
        </>
      ) : (
        <>
          <Sparkles className="mr-3 h-5 w-5" /> Generate Results
        </>
      )}
    </Button>
  );
}

export function AIGenericForm({ tool }: { tool: Tool }) {
  const initialState = { generatedContent: null, error: null };
  const [state, formAction, isSubmitting] = useActionState(
    async (prevState: any, formData: FormData) => {
      const topic = formData.get("topic") as string;
      const context = formData.get("context") as string | undefined;
      return generateGenericContentAction({
        prompt: tool.prompt,
        topic,
        context,
      });
    },
    initialState,
  );

  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const { toast } = useToast();

  const handleCopy = () => {
    if (state.generatedContent) {
      navigator.clipboard.writeText(state.generatedContent);
      toast({
        title: "Copied!",
        description: "Content successfully copied to your clipboard.",
      });
    }
  };

  const hasContextField = tool.prompt.includes("{{{context}}}");

  return (
    <div className="w-full">
      <AIGenerationLoader show={isSubmitting} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2 sticky top-24"
          >
            <div className="p-8 rounded-[2rem] bg-card/40 backdrop-blur-3xl border border-border/10 shadow-2xl space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  AI <span className="text-primary italic">Forge</span>
                </h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Generate high-fidelity comparisons and deep insights using our
                  premium neural models.
                </p>
              </div>

              <form action={formAction} className="space-y-6">
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
                <div className="pt-4">
                  <SubmitButton />
                </div>
              </form>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-3 min-h-[500px]"
          >
            {state.generatedContent && !isSubmitting ? (
              <Card className="glass-dark border-primary/20 rounded-[2rem] h-full flex flex-col overflow-hidden shadow-[0_0_50px_rgba(var(--primary),0.1)]">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 py-6 px-10 bg-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">
                      AI Generated Output
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="rounded-full bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                    <form action={formAction}>
                      <input type="hidden" name="topic" value={topic} />
                      <input type="hidden" name="context" value={context} />
                      <Button
                        variant="default"
                        size="sm"
                        type="submit"
                        className="rounded-full shadow-lg shadow-primary/20 h-10 px-6 font-black uppercase tracking-widest text-[9px]"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" /> Re-Scan Task
                      </Button>
                    </form>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-black/10">
                  <MarkdownContent content={state.generatedContent} />
                </CardContent>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center h-full border-2 border-dashed border-border/20 rounded-[2rem] bg-secondary/5 group overflow-hidden relative">
                <div className="absolute inset-0 bg-grid-pattern-light opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10 text-center px-10">
                  <div className="p-8 bg-muted/50 rounded-full w-fit mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Wand2 className="mx-auto h-20 w-20 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-4">
                    Awaiting Input
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
                    Once you fill out the form and hit generate, your premium AI
                    results will materialize here in real-time.
                  </p>
                </div>
              </Card>
            )}
            {typeof state.error === "string" && !isSubmitting && (
              <Alert
                variant="destructive"
                className="mt-8 rounded-2xl border-2 border-destructive/20 bg-destructive/10 backdrop-blur-md"
              >
                <AlertTitle className="text-lg font-bold">
                  Generation Failed
                </AlertTitle>
                <AlertDescription className="text-base">
                  {state.error}
                </AlertDescription>
              </Alert>
            )}
          </MotionDiv>
        </div>
      </div>
    </div>
  );
}
