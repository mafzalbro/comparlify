
'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateCourseDescriptionAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { Input } from './ui/input';
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
  const [state, formAction] = useActionState(generateCourseDescriptionAction, initialState);
  const [courseTitle, setCourseTitle] = useState('');
  const [keyTopics, setKeyTopics] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  
  const { isSubmitting, isContentIncomplete, handleContinue } = useContinueGeneration({
    formRef,
    content: state.description,
  });
  
  const showLoader = isSubmitting;

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction} ref={formRef}>
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
               <input type="hidden" name="existingContent" value={state.description ?? ''} />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton isSubmitting={isSubmitting} />
          </CardFooter>
        </form>
      </Card>

      {showLoader && <AIGenerationLoader />}

      {state.description && !showLoader && (
        <div className="mt-8 space-y-4">
          <Alert>
            <Sparkles className="h-5 w-5" />
            <AlertTitle className="font-bold">Generated Course Description</AlertTitle>
            <AlertDescription className="mt-4">
              <MarkdownContent content={state.description} />
            </AlertDescription>
          </Alert>
          {isContentIncomplete && <ContinueButton onClick={handleContinue} isSubmitting={isSubmitting} />}
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
