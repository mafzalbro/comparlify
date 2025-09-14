
'use client';

import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { generateFaqsAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { MarkdownContent } from './markdown-content';

function SubmitButton({ isContinuing }: { isContinuing?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          {isContinuing ? <PlusCircle className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {isContinuing ? 'Continue Generating' : 'Generate FAQs'}
        </>
      )}
    </Button>
  );
}

export function FaqGeneratorForm() {
  const initialState = { faqs: null, error: null };
  const [state, formAction] = useActionState(generateFaqsAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);
  const topicContentRef = useRef<HTMLTextAreaElement>(null);

  const handleContinue = () => {
    if (formRef.current && hiddenTextareaRef.current && state.faqs) {
      hiddenTextareaRef.current.value = state.faqs;
      
      if (topicContentRef.current) {
        topicContentRef.current.focus();
        topicContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      formRef.current.requestSubmit();
    }
  };

  const isContentIncomplete = state.faqs && !/[.!?]\s*$/.test(state.faqs.trim());

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction} ref={formRef}>
          <CardHeader>
            <CardTitle className="font-headline">Topic Content</CardTitle>
            <CardDescription>
              Paste your course description, lesson text, or any content, and the AI will generate relevant FAQs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="topicContent">Content</Label>
                <Textarea
                  id="topicContent"
                  name="topicContent"
                  ref={topicContentRef}
                  placeholder="e.g., Paste your full course description or a lesson transcript here..."
                  rows={10}
                  required
                />
                {typeof state.error === 'object' && state.error?.topicContent && (
                  <p className="text-sm text-destructive">{state.error.topicContent[0]}</p>
                )}
                 <textarea name="existingContent" ref={hiddenTextareaRef} className="hidden" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.faqs && (
        <div className="mt-8 space-y-4">
          <Alert>
            <Sparkles className="h-5 w-5" />
            <AlertTitle className="font-bold">Generated FAQs</AlertTitle>
            <AlertDescription className="mt-4">
              <MarkdownContent content={state.faqs} />
            </AlertDescription>
          </Alert>
          {isContentIncomplete && (
            <Button onClick={handleContinue} className="w-full" variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Continue Generating
            </Button>
          )}
        </div>
      )}

      {typeof state.error === 'string' && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
