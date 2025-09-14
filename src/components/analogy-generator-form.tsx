
'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateAnalogyAction } from '@/app/actions/ai';
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
          Generate Analogy
        </>
      )}
    </Button>
  );
}

const ContinueButton = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <Button onClick={onClick} disabled={disabled} className="w-full" variant="outline" type="button">
        {disabled ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Continuing...</>
        ) : (
            <><PlusCircle className="mr-2 h-4 w-4" /> Continue Generating</>
        )}
    </Button>
);


export function AnalogyGeneratorForm() {
  const initialState = { analogy: null, error: null };
  const [state, formAction] = useActionState(generateAnalogyAction, initialState);
  const [complexTopic, setComplexTopic] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const {
    isContinuing,
    isContentIncomplete,
    handleContinue,
  } = useContinueGeneration({
    formRef,
    content: state.analogy,
  });

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction} ref={formRef}>
          <CardHeader>
            <CardTitle className="font-headline">Enter Complex Topic</CardTitle>
            <CardDescription>
              Describe a complex topic or concept, and the AI will generate a simple analogy to explain it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="complexTopic">Complex Topic</Label>
                <Textarea
                  id="complexTopic"
                  name="complexTopic"
                  value={complexTopic}
                  onChange={(e) => setComplexTopic(e.target.value)}
                  placeholder="e.g., 'Blockchain technology' or 'Quantum computing'"
                  rows={4}
                  required
                />
                {typeof state.error === 'object' && state.error?.complexTopic && (
                  <p className="text-sm text-destructive">{state.error.complexTopic[0]}</p>
                )}
                 <input type="hidden" name="existingContent" value={state.analogy ?? ''} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton isSubmitting={isContinuing} />
          </CardFooter>
        </form>
      </Card>

      {state.analogy && (
        <div className="mt-8 space-y-4">
          <Alert>
            <Sparkles className="h-5 w-5" />
            <AlertTitle className="font-bold">Generated Analogy</AlertTitle>
            <AlertDescription className="mt-4">
              <MarkdownContent content={state.analogy} />
            </AlertDescription>
          </Alert>
          {isContentIncomplete && <ContinueButton onClick={handleContinue} disabled={isContinuing} />}
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
