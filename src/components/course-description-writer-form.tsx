
'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateCourseDescriptionAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, PlusCircle, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { Input } from './ui/input';
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
          Writing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Description
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
                <><PlusCircle className="mr-2 h-4 w-4" /> Continue Writing</>
            )}
        </Button>
    )
};

export function CourseDescriptionWriterForm() {
  const initialState = { description: null, error: null };
  const [state, formAction, isFormSubmitting] = useActionState(generateCourseDescriptionAction, initialState);
  const [courseTitle, setCourseTitle] = useState('');
  const [keyTopics, setKeyTopics] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  
  const { isContinuing, isContentIncomplete, handleContinue } = useContinueGeneration({
    formRef,
    content: state.description,
  });
  
  const showLoader = isFormSubmitting || isContinuing;

  const handleCopy = () => {
    if (state.description) {
      navigator.clipboard.writeText(state.description);
      toast({
        title: 'Copied!',
        description: 'Description copied to clipboard.',
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <form
            ref={formRef}
            action={(formData) => {
            formAction(formData);
            }}
            className="space-y-6"
        >
            <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline">Course Details</CardTitle>
                <CardDescription>
                Provide your course title and the key topics you'll cover. The AI will write a compelling sales description.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="courseTitle">Course Title</Label>
                    <Input 
                    id="courseTitle" 
                    name="courseTitle" 
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="e.g., The Ultimate Guide to Sourdough Baking" 
                    required 
                    />
                    {typeof state.error === 'object' && state.error?.courseTitle && (
                    <p className="text-sm text-destructive">{state.error.courseTitle[0]}</p>
                    )}
                </div>
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="keyTopics">Key Topics Covered</Label>
                <Textarea
                    id="keyTopics"
                    name="keyTopics"
                    value={keyTopics}
                    onChange={(e) => setKeyTopics(e.target.value)}
                    placeholder="e.g., Creating a starter, kneading and folding, scoring techniques, baking in a Dutch oven, different types of flour..."
                    rows={6}
                    required
                />
                {typeof state.error === 'object' && state.error?.keyTopics && (
                    <p className="text-sm text-destructive">{state.error.keyTopics[0]}</p>
                )}
                </div>
                {isContinuing && state.description && (
                    <input type="hidden" name="existingContent" value={state.description} />
                )}
            </CardContent>
            <CardFooter>
                <SubmitButton isSubmitting={isContinuing} />
            </CardFooter>
            </Card>
        </form>

        <div className="h-full">
            {state.description && !showLoader ? (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <CardTitle className="font-bold">Generated Course Description</CardTitle>
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
                        <MarkdownContent content={state.description} />
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
