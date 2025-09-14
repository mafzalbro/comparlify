
'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { generateAudiencePersonaAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, PlusCircle, Copy, RefreshCw } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { useContinueGeneration } from '@/hooks/use-continue-generation';
import { AIGenerationLoader } from './ai-generation-loader';
import { useToast } from '@/hooks/use-toast';

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
           Generate Persona
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

export function AudiencePersonaGeneratorForm() {
  const initialState = { persona: null, error: null };
  const [state, formAction, isFormSubmitting] = useActionState(generateAudiencePersonaAction, initialState);
  const [courseIdea, setCourseIdea] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const { isContinuing, isContentIncomplete, handleContinue } = useContinueGeneration({
    formRef,
    content: state.persona
  });

  const showLoader = isFormSubmitting || isContinuing;

  const handleCopy = () => {
    if (state.persona) {
      navigator.clipboard.writeText(state.persona);
      toast({
        title: 'Copied!',
        description: 'Persona copied to clipboard.',
      });
    }
  };

  const handleRegenerate = () => {
    if (formRef.current) {
      // Clear previous result before regenerating
      const clearedState = { ...initialState };
      const newFormData = new FormData(formRef.current);
      formAction(newFormData);
    }
  };

  return (
    <>
      <AIGenerationLoader show={showLoader} />
      <Card className="shadow-lg">
        <form
          ref={formRef}
          action={(formData) => {
            // When submitting, we clear the previous content.
            formData.delete('existingContent');
            formAction(formData);
          }}
        >
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
            <SubmitButton isSubmitting={isContinuing} />
          </CardFooter>
        </form>
      </Card>

      {state.persona && !showLoader && (
        <div className="mt-8 space-y-4">
          <Alert className="relative">
             <div className="absolute top-2 right-2 flex gap-1">
                <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy">
                    <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleRegenerate} title="Regenerate">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
            <Sparkles className="h-5 w-5" />
            <AlertTitle className="font-bold">Generated Audience Persona</AlertTitle>
            <AlertDescription className="mt-4 pr-16">
              <MarkdownContent content={state.persona} />
            </AlertDescription>
          </Alert>
          {isContentIncomplete && <ContinueButton onClick={handleContinue} isSubmitting={isContinuing} />}
        </div>
      )}

      {typeof state.error === 'string' && !showLoader && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
