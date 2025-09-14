
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
                <><PlusCircle className="mr-2 h-4 w-4" /> Continue Summary</>
            )}
        </Button>
    )
};

export function LessonSummarizerForm() {
  const initialState = { summary: null, error: null };
  const [state, formAction, isFormSubmitting] = useActionState(generateLessonSummaryAction, initialState);
  const [lessonContent, setLessonContent] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  
  const { isContinuing, isContentIncomplete, handleContinue } = useContinueGeneration({
    formRef,
    content: state.summary,
  });

  const showLoader = isFormSubmitting || isContinuing;

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction} ref={formRef}>
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
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Paste your entire lesson transcript or text here..."
                  rows={12}
                  required
                />
                {typeof state.error === 'object' && state.error?.lessonContent && (
                  <p className="text-sm text-destructive">{state.error.lessonContent[0]}</p>
                )}
                 <input type="hidden" name="existingContent" value={state.summary ?? ''} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton isSubmitting={isContinuing} />
          </CardFooter>
        </form>
      </Card>

      {showLoader && <AIGenerationLoader />}

      {state.summary && !showLoader && (
         <div className="mt-8 space-y-4">
            <Alert>
                <Sparkles className="h-5 w-5" />
                <AlertTitle className="font-bold">Generated Summary</AlertTitle>
                <AlertDescription className="mt-4">
                    <MarkdownContent content={state.summary} />
                </AlertDescription>
            </Alert>
            {isContentIncomplete && <ContinueButton onClick={handleContinue} isSubmitting={isContinuing} />}
         </div>
      )}

      {typeof state.error === 'string' && !showLoader && (
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
