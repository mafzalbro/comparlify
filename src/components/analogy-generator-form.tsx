
'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { generateAnalogyAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, PlusCircle, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
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
  const [isContinuing, startContinueTransition] = useTransition();

  const isContentIncomplete = state.analogy ? /[^.!?\])'"`\s]$/i.test(state.analogy) : false;
  
  const showLoader = isFormSubmitting || isContinuing;

  const handleContinue = () => {
    if (formRef.current) {
      startContinueTransition(() => {
        const formData = new FormData(formRef.current!);
        formData.set('complexTopic', complexTopic);
        formData.set('existingContent', state.analogy || '');
        formAction(formData);
      });
    }
  };

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
      const formData = new FormData(formRef.current);
      formData.delete('existingContent');
      formAction(formData);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formAction(formData);
  };

  return (
    <>
      <AIGenerationLoader show={showLoader} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <form
          ref={formRef}
          onSubmit={handleFormSubmit}
          className="space-y-6"
        >
          <Card className="shadow-lg">
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
          </Card>
        </form>

        <div className="h-full">
            {state.analogy && !showLoader ? (
                <Card>
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
            ) : (
                 <Card className="flex items-center justify-center h-full min-h-[300px] border-dashed">
                    <div className="text-center text-muted-foreground">
                        <Wand2 className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">Your generated content will appear here.</h3>
                    </div>
                </Card>
            )}
             {typeof state.error === 'string' && (
                <Alert variant="destructive" className="mt-8">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}
        </div>
      </div>
    </>
  );
}
