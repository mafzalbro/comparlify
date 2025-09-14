
'use client';

import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { generateCourseOutlineAction } from '@/app/actions/ai';
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
          {isContinuing ? 'Continue Generating' : 'Generate Outline'}
        </>
      )}
    </Button>
  );
}

export function CourseOutlinerForm() {
  const initialState = { courseOutline: null, error: null };
  const [state, formAction] = useActionState(generateCourseOutlineAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);
  const courseDescriptionRef = useRef<HTMLTextAreaElement>(null);
  
  const handleContinue = () => {
    if (formRef.current && hiddenTextareaRef.current && state.courseOutline) {
      hiddenTextareaRef.current.value = state.courseOutline;

      if (courseDescriptionRef.current) {
        courseDescriptionRef.current.focus();
        courseDescriptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      formRef.current.requestSubmit();
    }
  };

  const isContentIncomplete = state.courseOutline && !/[.!?]\s*$/.test(state.courseOutline.trim());

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction} ref={formRef}>
          <CardHeader>
            <CardTitle className="font-headline">Describe Your Course</CardTitle>
            <CardDescription>
              Provide a high-level description of your course topic. The more specific you are, the better the generated outline will be.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="courseDescription">Course Description</Label>
                <Textarea
                  id="courseDescription"
                  name="courseDescription"
                  ref={courseDescriptionRef}
                  placeholder="e.g., 'An introductory course on baking sourdough bread at home, covering starters, kneading techniques, and different types of loaves...'"
                  rows={6}
                  required
                />
                {typeof state.error === 'object' && state.error?.courseDescription && (
                  <p className="text-sm text-destructive">{state.error.courseDescription[0]}</p>
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

      {state.courseOutline && (
         <div className="mt-8 space-y-4">
            <Alert>
                <Sparkles className="h-5 w-5" />
                <AlertTitle className="font-bold">Generated Course Outline</AlertTitle>
                <AlertDescription className="mt-4">
                    <MarkdownContent content={state.courseOutline} />
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
          <AlertDescription>
            {state.error}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
