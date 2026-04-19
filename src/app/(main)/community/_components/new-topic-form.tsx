"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useActionState, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormStatus } from "react-dom";
import { Send, Loader2 } from "lucide-react";
import { createTopicAction } from "@/app/actions/community";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionState } from "@/types/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownContent } from "@/components/markdown-content";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto px-10 h-12 rounded-2xl font-black uppercase tracking-widest text-xs">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" /> Submit Topic
        </>
      )}
    </Button>
  );
}

export function NewTopicForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const [state, formAction] = useActionState(createTopicAction, {
    success: false,
    error: null,
    message: null,
  } as ActionState);

  useEffect(() => {
    if (state.success && state.message) {
      toast({
        title: "Success!",
        description: state.message,
      });
      router.back();
    }
  }, [state.success, state.message, router, toast]);

  return (
    <form action={formAction}>
      <input type="hidden" name="categoryId" value={categoryId ?? ""} />
      <Card className="max-w-4xl mx-auto border-primary/10 shadow-2xl rounded-[2.5rem] bg-card/60 backdrop-blur-3xl overflow-hidden">
        <CardHeader className="p-10 pb-6 border-b border-border/10">
          <CardTitle className="text-3xl font-black italic">
            Initialize <span className="text-primary">Dispatch</span>
          </CardTitle>
          <CardDescription className="text-base font-medium">
            Broadcast your intelligence to the global creator network.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-10">
          {!categoryId && (
            <div className="space-y-3">
              <Label
                htmlFor="categoryId"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground"
              >
                Intelligence Module
              </Label>
              <Select name="categoryId" required>
                <SelectTrigger className="h-14 rounded-2xl border-border/10 bg-background/50">
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/10">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="rounded-xl"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.error && typeof state.error !== 'string' && state.error.categoryId && (
                <p className="text-destructive text-xs font-bold uppercase tracking-widest pl-2">
                  {state.error.categoryId[0]}
                </p>
              )}
            </div>
          )}
          <div className="space-y-3">
            <Label
              htmlFor="title"
              className="text-xs font-black uppercase tracking-widest text-muted-foreground"
            >
              Topic Index
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="A precise and surgical headline"
              required
              className="h-14 rounded-2xl border-border/10 bg-background/50"
            />
            {state.error && typeof state.error !== 'string' && state.error.title && (
              <p className="text-destructive text-xs font-bold uppercase tracking-widest pl-2">
                {state.error.title[0]}
              </p>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label
                htmlFor="content"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                >
                Raw Intelligence
                </Label>
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Supports Markdown</span>
            </div>

            <Tabs defaultValue="write" className="w-full">
              <TabsList className="bg-background/50 border border-border/10 mb-4 rounded-xl p-1">
                <TabsTrigger value="write" className="rounded-lg px-6 font-black uppercase tracking-widest text-[10px]">Write</TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg px-6 font-black uppercase tracking-widest text-[10px]">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="write" className="mt-0">
                <Textarea
                  id="content"
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide deep-dive data, strategies, or questions..."
                  rows={10}
                  required
                  className="rounded-4xl border-border/10 bg-background/50 p-8 min-h-[400px] text-base leading-relaxed"
                />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0">
                <div className="rounded-4xl border border-border/10 bg-background/30 p-8 min-h-[400px] overflow-auto">
                    {content ? (
                        <MarkdownContent content={content} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground/40 italic text-sm">
                            Waiting for data input...
                        </div>
                    )}
                </div>
              </TabsContent>
            </Tabs>
            
            {state.error && typeof state.error !== 'string' && state.error.content && (
              <p className="text-destructive text-xs font-bold uppercase tracking-widest pl-2">
                {state.error.content[0]}
              </p>
            )}
          </div>
          
          {typeof state.error === "string" && (
            <p className="text-destructive text-sm font-bold text-center p-4 bg-destructive/5 rounded-2xl">
              {state.error}
            </p>
          )}
        </CardContent>
        <CardFooter className="p-10 pt-6 flex flex-col sm:flex-row justify-end gap-6 bg-primary/5 border-t border-border/10">
          <Button
            type="button"
            variant="ghost"
            className="font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl hover:bg-primary/10 transition-colors"
            onClick={() => router.back()}
          >
            Abort Dispatch
          </Button>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
