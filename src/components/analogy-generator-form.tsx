
'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateAnalogyAction } from '@/app/actions/ai';
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
          Generate Analogy
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
    <Button
      onClick={onClick}
      disabled={isSubmitting}
      className="w-full"
      variant="outline"
      type="button"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Continuing...
        </>
      ) : (
        <>
          <PlusCircle className="mr-2 h-4 w-4" /> Continue Generating
        </>
      )}
    </Button>
  );
};

export function AnalogyGeneratorForm() {
  const initialState = { analogy: null, error: null };
  const [state, formAction, isFormSubmitting] = useActionState(generateAnalogyAction, initialState);
  const [complexTopic, setComplexTopic] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const { isContinuing, isContentIncomplete, handleContinue } =
    useContinueGeneration({
      formRef,
      content: state.analogy,
    });
  
  const showLoader = isFormSubmitting || isContinuing;

  const handleCopy = () => {
    if (state.analogy) {
      navigator.clipboard.writeText(state.analogy);
      toast({
        title: 'Copied!',
        description: 'Analogy copied to clipboard.',
      });
    }
  };

  const handleRegenerate = () => {
    if (formRef.current) {
      const newFormData = new FormData(formRef.current);
      newFormData.delete('existingContent');
      formAction(newFormData);
    }
  };

  return (
    <div className="w-full space-y-6">
      <AIGenerationLoader show={showLoader} />
      <Card className="shadow-lg">
        <form
          ref={formRef}
          action={(formData) => {
            if (isContinuing) {
               formData.set('existingContent', state.analogy ?? '');
            } else {
               formData.delete('existingContent');
            }
            formAction(formData);
          }}
        >
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
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton isSubmitting={isContinuing} />
          </CardFooter>
        </form>
      </Card>

      {state.analogy && !showLoader && (
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="font-bold">Generated Analogy</CardTitle>
            </div>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy">
                    <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleRegenerate} title="Regenerate">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
          </CardHeader>
          <CardContent>
              <MarkdownContent content={state.analogy} />
              {isContentIncomplete && (
                <div className="mt-4 pt-4 border-t">
                  <ContinueButton
                    onClick={handleContinue}
                    isSubmitting={isContinuing}
                  />
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {typeof state.error === 'string' && !showLoader && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
