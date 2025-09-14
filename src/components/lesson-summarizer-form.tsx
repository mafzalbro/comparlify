
'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateLessonSummaryAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { MarkdownContent } from './markdown-content';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Summarizing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Summary
        </>
      )}
    </Button>
  );
}

export function LessonSummarizerForm() {
  const initialState = { summary: null, error: null };
  const [state, formAction] = useActionState(generateLessonSummaryAction, initialState);
  const [isContinuing, setIsContinuing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContinue = () => {
    if (formRef.current && hiddenTextareaRef.current && state.summary) {
      setIsContinuing(true);
      hiddenTextareaRef.current.value = state.summary;
      
      const formData = new FormData(formRef.current);
      formAction(formData);
    }
  };

  // This effect helps manage the loading state for the continue button
  if (isContinuing && !state.summary) {
      setIsContinuing(false);
  }

  const isContentIncomplete = state.summary && !/[.!?\])'"`]\s*$/.test(state.summary.trim());

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction} ref={formRef} onSubmit={() => setIsContinuing(false)}>
          <CardHeader>
            <CardTitle className="font-headline">Lesson Content</CardTitle>
            <CardDescription>
              Paste the full text of your lesson below, and the AI will generate a concise summary and list the key takeaways.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lessonContent">Lesson Text</Label>
                <Textarea
                  id="lessonContent"
                  name="lessonContent"
                  placeholder="Paste your entire lesson transcript or text here..."
                  rows={12}
                  required
                />
                {typeof state.error === 'object' && state.error?.lessonContent && (
                  <p className="text-sm text-destructive">{state.error.lessonContent[0]}</p>
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

      {state.summary && (
         <div className="mt-8 space-y-4">
            <Alert>
                <Sparkles className="h-5 w-5" />
                <AlertTitle className="font-bold">Generated Summary</AlertTitle>
                <AlertDescription className="mt-4">
                    <MarkdownContent content={state.summary} />
                </AlertDescription>
            </Alert>
            {isContentIncomplete && (
              <Button onClick={handleContinue} className="w-full" variant="outline" type="button" disabled={isContinuing}>
                  {isContinuing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Continuing...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" /> 
                      Continue Generating
                    </>
                  )}
              </Button>
            )}
         </div>
      )}

      {typeof state.error === 'string' && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {state.error}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
