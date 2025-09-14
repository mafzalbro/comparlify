
'use client';

import { useActionState, useRef, useState } from 'react';
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
import { useContinueGeneration } from '@/hooks/use-continue-generation';
import { AIGenerationLoader } from './ai-generation-loader';

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = isSubmitting || pending;
  return (
    <Button type="submit" disabled={isDisabled} className="w-full">
      {isDisabled ? (
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

const ContinueButton = ({
  onClick,
  isSubmitting,
}: {
  onClick: () => void;
  isSubmitting: boolean;
}) => {
    return (
        <Button onClick={onClick} disabled={isSubmitting} className="w-full" variant="outline" type="button">
            {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Continuing...</>
            ) : (
                <><PlusCircle className="mr-2 h-4 w-4" /> Continue Generating</>
            )}
        </Button>
    )
};

export function CourseOutlinerForm() {
  const initialState = { courseOutline: null, error: null };
  const [state, formAction] = useActionState(generateCourseOutlineAction, initialState);
  const [courseDescription, setCourseDescription] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const { isSubmitting, isContentIncomplete, handleContinue } = useContinueGeneration({
    formRef,
    content: state.courseOutline,
  });
  
  const showLoader = isSubmitting;

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
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
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
            <SubmitButton isSubmitting={isSubmitting} />
          </CardFooter>
        </form>
      </Card>

      {showLoader && <AIGenerationLoader />}

      {state.courseOutline && !showLoader && (
         <div className="mt-8 space-y-4">
            <Alert>
                <Sparkles className="h-5 w-5" />
                <AlertTitle className="font-bold">Generated Course Outline</AlertTitle>
                <AlertDescription className="mt-4">
                    <MarkdownContent content={state.courseOutline} />
                </AlertDescription>
            </Alert>
            {isContentIncomplete && <ContinueButton onClick={handleContinue} isSubmitting={isSubmitting} />}
         </div>
      )}

      {typeof state.error === 'string' && !isSubmitting && (
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
