
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateIceBreakersAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { AIGenerationLoader } from './ai-generation-loader';
import { useToast } from '@/hooks/use-toast';
import { Slider } from './ui/slider';
import React from 'react';
import { Input } from './ui/input';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Get Ice Breakers</>}
    </Button>
  );
}

export function IceBreakerForm() {
  const initialState = { iceBreakers: null, error: null };
  const [state, formAction, isSubmitting] = useActionState(generateIceBreakersAction, initialState);
  const [audience, setAudience] = useState('');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const { toast } = useToast();

  const handleCopy = () => {
    if (state.iceBreakers) {
      navigator.clipboard.writeText(state.iceBreakers);
      toast({ title: 'Copied!', description: 'Ice breakers copied to clipboard.' });
    }
  };

  return (
    <>
      <AIGenerationLoader show={isSubmitting} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <Card className="shadow-lg h-full flex flex-col">
          <form action={formAction}>
            <CardHeader>
              <CardTitle className="font-headline">Audience & Topic</CardTitle>
              <CardDescription>Describe your audience and the topic of discussion to generate relevant ice breaker questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="space-y-2">
                <Label htmlFor="audience">Audience Description</Label>
                <Textarea id="audience" name="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g., beginner photographers, experienced web developers, marketing managers" rows={2} required />
                {typeof state.error === 'object' && state.error?.audience && <p className="text-sm text-destructive">{state.error.audience[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic of Discussion</Label>
                <Input id="topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Portrait Photography, React Best Practices" required />
                {typeof state.error === 'object' && state.error?.topic && <p className="text-sm text-destructive">{state.error.topic[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Number of Questions</Label>
                <div className="flex items-center gap-4 pt-2">
                  <Slider id="count" name="count" min={1} max={10} step={1} value={[count]} onValueChange={(value) => setCount(value[0])} className="flex-1" />
                  <span className="font-mono text-lg w-16 text-center bg-muted py-1 rounded-md">{count}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        <div className="h-full">
          {state.iceBreakers && !isSubmitting ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /><CardTitle className="font-bold">Generated Ice Breakers</CardTitle></div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy"><Copy className="h-4 w-4" /></Button>
                  <form action={formAction}>
                    <input type="hidden" name="audience" value={audience} />
                    <input type="hidden" name="topic" value={topic} />
                    <input type="hidden" name="count" value={count} />
                    <Button variant="ghost" size="icon" title="Regenerate" type="submit"><RefreshCw className="h-4 w-4" /></Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent className="flex-1"><MarkdownContent content={state.iceBreakers} /></CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-full min-h-[300px] border-dashed">
              <div className="text-center text-muted-foreground"><Wand2 className="mx-auto h-12 w-12" /><h3 className="mt-4 text-lg font-semibold">Your generated questions will appear here.</h3></div>
            </Card>
          )}
          {typeof state.error === 'string' && !isSubmitting && (
            <Alert variant="destructive" className="mt-8"><AlertTitle>Error</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert>
          )}
        </div>
      </div>
    </>
  );
}
