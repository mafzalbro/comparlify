'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateLearningObjectivesAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { MarkdownContent } from './markdown-content';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Objectives
        </>
      )}
    </Button>
  );
}

export function LearningObjectivesGeneratorForm() {
  const initialState = { objectives: null, error: null };
  const [state, formAction] = useActionState(generateLearningObjectivesAction, initialState);

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">Course Topic</CardTitle>
            <CardDescription>
              Enter your course topic or a brief description, and the AI will generate clear, measurable learning objectives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="courseTopic">Course Topic or Description</Label>
                <Textarea
                  id="courseTopic"
                  name="courseTopic"
                  placeholder="e.g., 'An introduction to digital marketing for small business owners.'"
                  rows={4}
                  required
                />
                {typeof state.error === 'object' && state.error?.courseTopic && (
                  <p className="text-sm text-destructive">{state.error.courseTopic[0]}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.objectives && (
        <Alert className="mt-8">
          <Sparkles className="h-5 w-5" />
          <AlertTitle className="font-bold">Generated Learning Objectives</AlertTitle>
          <AlertDescription>
            <ScrollArea className="h-60 mt-4">
              <MarkdownContent content={state.objectives} />
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}

      {typeof state.error === 'string' && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
