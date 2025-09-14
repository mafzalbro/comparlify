
'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateAudiencePersonaAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { useContinueGeneration, ContinueGenerationProvider } from '@/hooks/use-continue-generation';
import { AIGenerationLoader } from './ai-generation-loader';

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
           Generate Persona
        </>
      )}
    </Button>
  );
}

const ContinueButton = () => {
    const { handleContinue, isSubmitting } = useContinueGeneration();
    return (
        <Button onClick={handleContinue} disabled={isSubmitting} className="w-full" variant="outline" type="button">
            {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Continuing...</>
            ) : (
                <><PlusCircle className="mr-2 h-4 w-4" /> Continue Generating</>
            )}
        </Button>
    )
};

function AudiencePersonaGeneratorFormInner() {
  const initialState = { persona: null, error: null };
  const [state, formAction] = useActionState(generateAudiencePersonaAction, initialState);
  const [courseIdea, setCourseIdea] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const {
    isSubmitting,
    isContentIncomplete,
  } = useContinueGeneration();

  const showLoader = isSubmitting;

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction} ref={formRef}>
          <CardHeader>
            <CardTitle className="font-headline">Describe Your Course Idea</CardTitle>
            <CardDescription>
              Provide a description of your course, and the AI will generate a detailed persona for your ideal student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="courseIdea">Course Idea</Label>
                <Textarea
                  id="courseIdea"
                  name="courseIdea"
                  value={courseIdea}
                  onChange={(e) => setCourseIdea(e.target.value)}
                  placeholder="e.g., 'A course for busy professionals who want to learn photography on their weekends.'"
                  rows={4}
                  required
                />
                {typeof state.error === 'object' && state.error?.courseIdea && (
                  <p className="text-sm text-destructive">{state.error.courseIdea[0]}</p>
                )}
                <input type="hidden" name="existingContent" value={state.persona ?? ''} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton isSubmitting={isSubmitting} />
          </CardFooter>
        </form>
      </Card>

      {showLoader && <AIGenerationLoader />}

      {state.persona && !showLoader && (
        <div className="mt-8 space-y-4">
          <Alert>
            <Sparkles className="h-5 w-5" />
            <AlertTitle className="font-bold">Generated Audience Persona</AlertTitle>
            <AlertDescription className="mt-4">
              <MarkdownContent content={state.persona} />
            </AlertDescription>
          </Alert>
          {isContentIncomplete && <ContinueButton />}
        </div>
      )}

      {typeof state.error === 'string' && !isSubmitting && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}

export function AudiencePersonaGeneratorForm() {
    return (
        <ContinueGenerationProvider>
            <AudiencePersonaGeneratorFormInner />
        </ContinueGenerationProvider>
    )
}
