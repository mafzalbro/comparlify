
'use client';

import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { generateCourseDescriptionAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { Input } from './ui/input';

function SubmitButton({ isContinuing }: { isContinuing?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isContinuing ? 'Continuing...' : 'Writing...'}
        </>
      ) : (
        <>
          {isContinuing ? <PlusCircle className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {isContinuing ? 'Continue Generating' : 'Generate Description'}
        </>
      )}
    </Button>
  );
}

export function CourseDescriptionWriterForm() {
  const initialState = { description: null, error: null };
  const [state, formAction] = useActionState(generateCourseDescriptionAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);
  const keyTopicsRef = useRef<HTMLTextAreaElement>(null);

  const handleContinue = () => {
    if (formRef.current && hiddenTextareaRef.current && state.description) {
      hiddenTextareaRef.current.value = state.description;

      if (keyTopicsRef.current) {
        keyTopicsRef.current.focus();
        keyTopicsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      formRef.current.requestSubmit();
    }
  };

  const isContentIncomplete = state.description && !/[.!?]\s*$/.test(state.description.trim());

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction} ref={formRef}>
          <CardHeader>
            <CardTitle className="font-headline">Course Details</CardTitle>
            <CardDescription>
              Provide your course title and the key topics you'll cover. The AI will write a compelling sales description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input id="courseTitle" name="courseTitle" placeholder="e.g., The Ultimate Guide to Sourdough Baking" required />
                 {typeof state.error === 'object' && state.error?.courseTitle && (
                  <p className="text-sm text-destructive">{state.error.courseTitle[0]}</p>
                )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="keyTopics">Key Topics Covered</Label>
              <Textarea
                id="keyTopics"
                name="keyTopics"
                ref={keyTopicsRef}
                placeholder="e.g., Creating a starter, kneading and folding, scoring techniques, baking in a Dutch oven, different types of flour..."
                rows={6}
                required
              />
              {typeof state.error === 'object' && state.error?.keyTopics && (
                <p className="text-sm text-destructive">{state.error.keyTopics[0]}</p>
              )}
               <textarea name="existingContent" ref={hiddenTextareaRef} className="hidden" />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.description && (
        <div className="mt-8 space-y-4">
          <Alert>
            <Sparkles className="h-5 w-5" />
            <AlertTitle className="font-bold">Generated Course Description</AlertTitle>
            <AlertDescription className="mt-4">
              <MarkdownContent content={state.description} />
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
