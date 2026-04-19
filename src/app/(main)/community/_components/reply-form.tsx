"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPostAction } from "@/app/actions/community";
import { Send, Loader2, CheckCircle } from "lucide-react";
import type { Session } from "next-auth";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownContent } from "@/components/markdown-content";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} className="px-8 h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Post Dispatch
    </Button>
  );
}

interface ReplyFormProps {
  topicId: string;
  session: Session | null;
}

export function ReplyForm({ topicId, session }: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [state, formAction] = useActionState(createPostAction, {
    success: false,
    error: null,
    message: null,
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setContent("");
    }
  }, [state.success]);

  if (!session?.user) {
    return (
      <div className="text-center p-12 rounded-4xl border-2 border-dashed border-primary/10 bg-card/20 backdrop-blur-3xl shadow-xl">
        <p className="text-muted-foreground mb-6 font-medium italic">
          Authentication required to initialize frequency response.
        </p>
        <Button asChild className="rounded-xl px-10 h-12 font-black uppercase tracking-widest text-xs">
          <Link href="/login">Establish Connection</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="rounded-[2rem] border-primary/5 bg-card/40 backdrop-blur-3xl shadow-2xl overflow-hidden">
      <CardContent className="p-8">
        <form ref={formRef} action={formAction} className="space-y-6">
          <input type="hidden" name="topicId" value={topicId} />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                Frequency Input
            </span>
            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Supports Markdown</span>
          </div>

          <Tabs defaultValue="write" className="w-full">
            <TabsList className="bg-background/40 border border-border/5 mb-4 rounded-xl p-1">
              <TabsTrigger value="write" className="rounded-lg px-6 font-black uppercase tracking-widest text-[10px]">Write</TabsTrigger>
              <TabsTrigger value="preview" className="rounded-lg px-6 font-black uppercase tracking-widest text-[10px]">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="write" className="mt-0">
              <Textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Compose your intelligence response..."
                required
                className="rounded-2xl border-border/10 bg-background/30 p-6 min-h-[200px] text-base leading-relaxed"
              />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div className="rounded-2xl border border-border/10 bg-background/20 p-6 min-h-[200px] overflow-auto">
                {content ? (
                    <MarkdownContent content={content} />
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground/30 italic text-sm py-12">
                        Waiting for signal input...
                    </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-2">
            <SubmitButton />
          </div>
          {state.success && state.message && (
            <Alert className="mt-4 bg-primary/5 border-primary/10 rounded-2xl animate-reveal">
              <CheckCircle className="h-4 w-4 text-primary!" />
              <AlertTitle className="text-primary font-black uppercase tracking-widest text-[10px] mb-1">
                Dispatch Successful
              </AlertTitle>
              <AlertDescription className="text-muted-foreground text-sm">
                {state.message}
              </AlertDescription>
            </Alert>
          )}
          {typeof state.error === "string" && (
            <p className="text-xs font-bold text-destructive uppercase tracking-widest mt-4 pl-2">
              {state.error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
