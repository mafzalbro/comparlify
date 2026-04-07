"use client";

import { useActionState, useState, useEffect } from "react";
import { generateGenericContentAction } from "@/app/actions/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Copy, Loader2, PenSquare, ArrowLeft } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { MotionDiv } from "@/components/motion-wrapper";

export default function GhostwriterPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("news");
  const [tone, setTone] = useState("professional");

  const [state, formAction, isSubmitting] = useActionState(
    async (prevState: any, formData: FormData) => {
      const topic = formData.get("topic") as string;
      const type = formData.get("type") as string;
      const tone = formData.get("tone") as string;
      const context = formData.get("context") as string;

      const prompt = `You are a professional technology journalist and content expert. 
Your task is to write a full, high-quality ${type} article draft.
The tone should be ${tone}.

STRICT FORMATTING RULES:
1. PURE HUMAN STYLE: Write in a natural, conversational, yet professional human voice. Avoid robotic or corporate-only jargon.
2. NO LONG PARAGRAPHS: Keep paragraphs short (max 2-3 sentences). Use whitespace effectively.
3. SCANNABLE STRUCTURE: Use bold headings, bullet points, and lists. Ensure the article is easy to skim.
4. NATURAL RHYTHM: Vary sentence length. Ask occasional rhetorical questions if appropriate for the tone.
5. NO AI CLICHÉS: Avoid typical AI transition phrases like "In conclusion," "Moreover," or "Furthermore" unless they feel truly natural.

Main Topic: {{{topic}}}
Additional Instructions: {{{context}}}`;

      return generateGenericContentAction({
        prompt,
        topic,
        context: context || `Type: ${type}, Tone: ${tone}`,
      });
    },
    { generatedContent: null, error: null },
  );

  const handleCopy = () => {
    if (state.generatedContent) {
      navigator.clipboard.writeText(state.generatedContent);
      toast({ title: "Copied!", description: "Draft copied to clipboard." });
    }
  };

  // Handle errors from the server action
  // Since useActionState state is stable, we can also use a useEffect if we want it to re-fire on new errors.
  // But usually errors are handled per action. Let's use a cleaner approach with useEffect.
  useEffect(() => {
    if (state.error) {
      toast({
        title: "AI Error",
        description: state.error.toString(),
        variant: "destructive",
      });
    }
  }, [state.error, toast]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/ai-assistant">
          <Button variant="ghost" size="icon" className="rounded-2xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Article <span className="text-primary italic">Assistant</span>
          </h1>
          <p className="text-muted-foreground">
            Generate high-fidelity drafts for your daily content operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Card className="lg:col-span-4 rounded-4xl border-border/10 bg-card/40 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <PenSquare className="h-5 w-5 text-primary" /> Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Article Topic
                </Label>
                <Input
                  name="topic"
                  required
                  placeholder="e.g. Kajabi vs Teachable 2024 Update"
                  className="rounded-xl h-12 bg-background/50 border-border/10"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Format
                  </Label>
                  <Select
                    name="type"
                    defaultValue={type}
                    onValueChange={setType}
                  >
                    <SelectTrigger className="rounded-xl h-12 bg-background/50 border-border/10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">News Dispatch</SelectItem>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="comparison">
                        Comparison Guide
                      </SelectItem>
                      <SelectItem value="newsletter">
                        Email Newsletter
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Tone
                  </Label>
                  <Select
                    name="tone"
                    defaultValue={tone}
                    onValueChange={setTone}
                  >
                    <SelectTrigger className="rounded-xl h-12 bg-background/50 border-border/10">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="ruthless">Ruthless Critic</SelectItem>
                      <SelectItem value="innovative">
                        Innovative/Techy
                      </SelectItem>
                      <SelectItem value="friendly">Helpful/Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Special Instructions
                </Label>
                <Textarea
                  name="context"
                  placeholder="Mention specific pricing changes, SEO keywords, or key takeaways..."
                  rows={4}
                  className="rounded-xl bg-background/50 border-border/10 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Drafting
                    Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 h-5 w-5" /> Generate Expert Draft
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-8 min-h-[600px]">
          {state.generatedContent ? (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <Card className="h-full rounded-[2.5rem] border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 py-6 px-10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      Expert AI Draft
                    </Badge>
                    <CardTitle className="text-xl font-bold">
                      Generated Draft
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="rounded-full gap-2"
                  >
                    <Copy className="h-4 w-4" /> Copy Content
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                  <div className="prose prose-invert max-w-none">
                    <MarkdownContent content={state.generatedContent} />
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          ) : (
            <Card className="h-full border-2 border-dashed border-border/20 rounded-[2.5rem] flex items-center justify-center bg-secondary/5 text-center p-20 grayscale opacity-40">
              <div className="space-y-6">
                <PenSquare className="h-32 w-32 mx-auto text-muted-foreground/20" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Start Your Draft</h3>
                  <p className="max-w-xs mx-auto text-sm">
                    Enter your topic and preferences to begin the drafting
                    process.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
