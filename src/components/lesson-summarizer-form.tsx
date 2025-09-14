
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
  const { toast } = useToast();
  
  const { isContinuing, isContentIncomplete, handleContinue } = useContinueGeneration({
    formRef,
    content: state.summary,
  });

  const showLoader = isFormSubmitting || isContinuing;

  const handleCopy = () => {
    if (state.summary) {
      navigator.clipboard.writeText(state.summary);
      toast({
        title: 'Copied!',
        description: 'Summary copied to clipboard.',
      });
    }
  };

  const handleRegenerate = () => {
    if (formRef.current) {
        const formData = new FormData(formRef.current);
        if(formData.has('existingContent')) {
          formData.delete('existingContent');
        }
        formAction(formData);
    }
  };

  return (
    <>
      <AIGenerationLoader show={showLoader} />
      <form
        ref={formRef}
        action={(formData) => {
          formAction(formData);
        }}
        className="space-y-6"
      >
        <Card className="shadow-lg">
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
              </div>
            </div>
             {isContinuing && state.summary && (
                <input type="hidden" name="existingContent" value={state.summary} />
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton isSubmitting={isContinuing} />
          </CardFooter>
        </Card>
      </form>

      {state.summary && !showLoader && (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <CardTitle className="font-bold">Generated Summary</CardTitle>
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
                <MarkdownContent content={state.summary} />
                {isContentIncomplete && (
                    <div className="mt-4 pt-4 border-t">
                    <ContinueButton onClick={handleContinue} isSubmitting={isContinuing} />
                    </div>
                )}
            </CardContent>
        </Card>
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
