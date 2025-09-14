
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
import { useContinueGeneration } from '@/hooks/use-continue-generation';

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={isSubmitting || pending} className="w-full">
      {(isSubmitting || pending) ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Writing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Description
        </>
      )}
    </Button>
  );
}

const ContinueButton = ({ onClick, disabled, text }: { onClick: () => void; disabled: boolean, text: string }) => (
    <Button onClick={onClick} disabled={disabled} className="w-full" variant="outline" type="button">
        {disabled ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Continuing...</>
        ) : (
            <><PlusCircle className="mr-2 h-4 w-4" /> {text}</>
        )}
    </Button>
);

export function CourseDescriptionWriterForm() {
  const initialState = { description: null, error: null };
  const [state, formAction] = useActionState(generateCourseDescriptionAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  const {
    isContinuing,
    isContentIncomplete,
    isSubmitting,
    handleContinue,
  } = useContinueGeneration({
    formRef,
    formAction,
    content: state.description,
  });

  return (
    <>
      <Card className="shadow-lg">
        <form action={(payload) => { formAction(payload); }} ref={formRef}>
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
                placeholder="e.g., Creating a starter, kneading and folding, scoring techniques, baking in a Dutch oven, different types of flour..."
                rows={6}
                required
              />
              {typeof state.error === 'object' && state.error?.keyTopics && (
                <p className="text-sm text-destructive">{state.error.keyTopics[0]}</p>
              )}
               <input type="hidden" name="existingContent" value={state.description ?? ''} />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton isSubmitting={isSubmitting} />
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
          {isContentIncomplete && <ContinueButton onClick={handleContinue} disabled={isSubmitting} text="Continue Writing" />}
        </div>
      )}

      {typeof state.error === 'string' && !isContinuing && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
