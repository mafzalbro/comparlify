
'use client';

import { useActionState, useRef } from 'react';
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
import { useContinueGeneration } from '@/hooks/use-continue-generation';

function SubmitButton() {
  const { isSubmitting } = useContinueGeneration();
  return (
    <Button type="submit" disabled={isSubmitting} className="w-full">
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Outline
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

export function CourseOutlinerForm() {
  const initialState = { courseOutline: null, error: null };
  const [state, formAction] = useActionState(generateCourseOutlineAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    isContinuing,
    isContentIncomplete,
    isSubmitting,
    handleContinue,
  } = useContinueGeneration({
    formRef,
    formAction,
    content: state.courseOutline,
  });

  return (
    <>
      <Card className="shadow-lg">
        <form action={(payload) => { formAction(payload); }} ref={formRef}>
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
                  placeholder="e.g., 'An introductory course on baking sourdough bread at home, covering starters, kneading techniques, and different types of loaves...'"
                  rows={6}
                  required
                />
                {typeof state.error === 'object' && state.error?.courseDescription && (
                  <p className="text-sm text-destructive">{state.error.courseDescription[0]}</p>
                )}
                 <input type="hidden" name="existingContent" value={state.courseOutline ?? ''} />
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
            {isContentIncomplete && <ContinueButton onClick={handleContinue} disabled={isSubmitting} text="Continue Generating" />}
         </div>
      )}

      {typeof state.error === 'string' && !isContinuing && (
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
