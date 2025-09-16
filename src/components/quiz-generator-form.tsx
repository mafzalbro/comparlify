
'use client';

import { useActionState, useState } from 'react';
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
import { Loader2, Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import { Slider } from './ui/slider';
import React from 'react';
import { QuizViewer } from './quiz-viewer';
import { AIGenerationLoader } from './ai-generation-loader';

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
  const [state, formAction, isSubmitting] = useActionState(generateQuizAction, initialState);
  const [textContent, setTextContent] = useState('');
  const [numQuestions, setNumQuestions] = React.useState(5);

  return (
    <>
      <AIGenerationLoader show={isSubmitting} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <Card className="shadow-lg h-full flex flex-col">
          <form action={formAction}>
            <CardHeader>
              <CardTitle className="font-headline">Lesson Content</CardTitle>
              <CardDescription>
                Paste your lesson text below and choose the number of questions. The AI will generate a multiple-choice quiz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="textContent">Lesson Text</Label>
                <Textarea
                  id="textContent"
                  name="textContent"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
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

        <div className="h-full">
            {state.quiz && !isSubmitting ? (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <CardTitle className="font-bold">Generated Quiz</CardTitle>
                        </div>
                        <form action={formAction}>
                            <input type="hidden" name="textContent" value={textContent} />
                            <input type="hidden" name="numQuestions" value={numQuestions} />
                            <Button variant="ghost" size="icon" title="Regenerate" type="submit">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent className="flex-1">
                    <QuizViewer quizMarkdown={state.quiz} />
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
            {typeof state.error === 'string' && !isSubmitting && (
                <Alert variant="destructive" className="mt-8">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {state.error}
                </AlertDescription>
                </Alert>
            )}
        </div>
      </div>
    </>
  );
}
