
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateQuizAction } from '@/app/actions/ai';
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
import { Loader2, Sparkles } from 'lucide-react';
import { Slider } from './ui/slider';
import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { MarkdownContent } from './markdown-content';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Quiz...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Quiz
        </>
      )}
    </Button>
  );
}

export function QuizGeneratorForm() {
  const initialState = { quiz: null, error: null };
  const [state, formAction] = useActionState(generateQuizAction, initialState);
  const [numQuestions, setNumQuestions] = React.useState(5);

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">Lesson Content</CardTitle>
            <CardDescription>
              Paste your lesson text below and choose the number of questions. The AI will generate a multiple-choice quiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="textContent">Lesson Text</Label>
              <Textarea
                id="textContent"
                name="textContent"
                placeholder="Paste the content you want to create a quiz from..."
                rows={10}
                required
              />
              {typeof state.error === 'object' && state.error?.textContent && (
                <p className="text-sm text-destructive">{state.error.textContent[0]}</p>
              )}
            </div>
             <div className="flex flex-col space-y-1.5">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <div className="flex items-center gap-4">
                    <Slider 
                        id="numQuestions"
                        name="numQuestions"
                        min={1} 
                        max={10} 
                        step={1} 
                        value={[numQuestions]}
                        onValueChange={(value) => setNumQuestions(value[0])}
                        className="flex-1"
                    />
                    <span className="font-mono text-lg w-16 text-center bg-muted py-1 rounded-md">{numQuestions}</span>
                </div>
                 {typeof state.error === 'object' && state.error?.numQuestions && (
                    <p className="text-sm text-destructive">{state.error.numQuestions[0]}</p>
                )}
             </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.quiz && (
        <Alert className="mt-8">
            <Sparkles className="h-5 w-5" />
            <AlertTitle className="font-bold">Generated Quiz</AlertTitle>
            <AlertDescription>
              <ScrollArea className="h-96 mt-4">
                 <MarkdownContent content={state.quiz} />
              </ScrollArea>
            </AlertDescription>
        </Alert>
      )}

      {typeof state.error === 'string' && (
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
