
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
import { useContinueGeneration } from '@/hooks/use-continue-generation';

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={isSubmitting || pending} className="w-full">
      {(isSubmitting || pending) ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate FAQs
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

export function FaqGeneratorForm() {
  const initialState = { faqs: null, error: null };
  const [state, formAction] = useActionState(generateFaqsAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  const {
    isContinuing,
    isContentIncomplete,
    isSubmitting,
    handleContinue,
  } = useContinueGeneration({
    formRef,
    formAction,
    content: state.faqs,
  });

  return (
    <>
      <Card className="shadow-lg">
        <form action={(payload) => { formAction(payload); }} ref={formRef}>
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
                  placeholder="e.g., Paste your full course description or a lesson transcript here..."
                  rows={10}
                  required
                />
                {typeof state.error === 'object' && state.error?.topicContent && (
                  <p className="text-sm text-destructive">{state.error.topicContent[0]}</p>
                )}
                 <input type="hidden" name="existingContent" value={state.faqs ?? ''} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton isSubmitting={isSubmitting} />
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
          {isContentIncomplete && <ContinueButton onClick={handleContinue} disabled={isSubmitting} text="Generate More FAQs" />}
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
