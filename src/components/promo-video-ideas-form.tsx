
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generatePromoVideoIdeasAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { AIGenerationLoader } from './ai-generation-loader';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Ideas...</> : <><Sparkles className="mr-2 h-4 w-4" /> Get Video Ideas</>}
    </Button>
  );
}

export function PromoVideoIdeasForm() {
  const initialState = { videoIdeas: null, error: null };
  const [state, formAction, isSubmitting] = useActionState(generatePromoVideoIdeasAction, initialState);
  const [courseTopic, setCourseTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const { toast } = useToast();

  const handleCopy = () => {
    if (state.videoIdeas) {
      navigator.clipboard.writeText(state.videoIdeas);
      toast({ title: 'Copied!', description: 'Video ideas copied to clipboard.' });
    }
  };

  return (
    <>
      <AIGenerationLoader show={isSubmitting} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <Card className="shadow-lg h-full flex flex-col">
          <form action={formAction}>
            <CardHeader>
              <CardTitle className="font-headline">Course & Audience</CardTitle>
              <CardDescription>
                Tell us about your course and who it's for, and we'll brainstorm some short-form video ideas to promote it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="space-y-2">
                <Label htmlFor="courseTopic">Course Topic</Label>
                <Textarea id="courseTopic" name="courseTopic" value={courseTopic} onChange={(e) => setCourseTopic(e.target.value)} placeholder="e.g., 'Learn to bake artisanal bread'" rows={2} required />
                {typeof state.error === 'object' && state.error?.courseTopic && <p className="text-sm text-destructive">{state.error.courseTopic[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Textarea id="targetAudience" name="targetAudience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., 'Home cooks who want to up their baking game'" rows={2} required />
                {typeof state.error === 'object' && state.error?.targetAudience && <p className="text-sm text-destructive">{state.error.targetAudience[0]}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        <div className="h-full">
          {state.videoIdeas && !isSubmitting ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /><CardTitle className="font-bold">Generated Video Ideas</CardTitle></div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy"><Copy className="h-4 w-4" /></Button>
                   <form action={formAction}>
                        <input type="hidden" name="courseTopic" value={courseTopic} />
                        <input type="hidden" name="targetAudience" value={targetAudience} />
                        <Button variant="ghost" size="icon" title="Regenerate" type="submit"><RefreshCw className="h-4 w-4" /></Button>
                    </form>
                </div>
              </CardHeader>
              <CardContent className="flex-1"><MarkdownContent content={state.videoIdeas} /></CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-full min-h-[300px] border-dashed">
              <div className="text-center text-muted-foreground"><Wand2 className="mx-auto h-12 w-12" /><h3 className="mt-4 text-lg font-semibold">Your generated ideas will appear here.</h3></div>
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
