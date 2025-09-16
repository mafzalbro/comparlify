
'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateFaqsAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, PlusCircle, Copy, RefreshCw, Wand2 } from 'lucide-react';
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
          Generate FAQs
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
                <><PlusCircle className="mr-2 h-4 w-4" /> Generate More FAQs</>
            )}
        </Button>
    )
};

export function FaqGeneratorForm() {
  const initialState = { faqs: null, error: null };
  const [state, formAction, isFormSubmitting] = useActionState(generateFaqsAction, initialState);
  const [topicContent, setTopicContent] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  
  const { isContinuing, isContentIncomplete, handleContinue } = useContinueGeneration({
    formRef,
    content: state.faqs,
  });

  const showLoader = isFormSubmitting || isContinuing;

  const handleCopy = () => {
    if (state.faqs) {
      navigator.clipboard.writeText(state.faqs);
      toast({
        title: 'Copied!',
        description: 'FAQs copied to clipboard.',
      });
    }
  };

  return (
    <>
        <AIGenerationLoader show={showLoader} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <form
            ref={formRef}
            action={(formData) => {
            formAction(formData);
            }}
            className="space-y-6"
        >
            <Card className="shadow-lg h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Topic Content</CardTitle>
                <CardDescription>
                Paste your course description, lesson text, or any content, and the AI will generate relevant FAQs.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="topicContent">Content</Label>
                    <Textarea
                    id="topicContent"
                    name="topicContent"
                    value={topicContent}
                    onChange={(e) => setTopicContent(e.target.value)}
                    placeholder="e.g., Paste your full course description or a lesson transcript here..."
                    rows={10}
                    required
                    />
                    {typeof state.error === 'object' && state.error?.topicContent && (
                    <p className="text-sm text-destructive">{state.error.topicContent[0]}</p>
                    )}
                </div>
                </div>
                {isContinuing && state.faqs && (
                    <input type="hidden" name="existingContent" value={state.faqs} />
                )}
            </CardContent>
            <CardFooter>
                <SubmitButton isSubmitting={isContinuing} />
            </CardFooter>
            </Card>
        </form>

        <div className="h-full">
            {state.faqs && !showLoader ? (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <CardTitle className="font-bold">Generated FAQs</CardTitle>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy">
                                <Copy className="h-4 w-4" />
                            </Button>
                            <form action={formAction}>
                                <input type="hidden" name="topicContent" value={topicContent} />
                                <Button variant="ghost" size="icon" title="Regenerate" type="submit">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <MarkdownContent content={state.faqs} />
                        {isContentIncomplete && (
                            <div className="mt-4 pt-4 border-t">
                            <ContinueButton onClick={handleContinue} isSubmitting={isContinuing} />
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
            {typeof state.error === 'string' && !showLoader && (
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
