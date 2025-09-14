
'use client';

import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { generateVideoScriptAction } from '@/app/actions/ai';
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
import { Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { Slider } from './ui/slider';
import React from 'react';
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
          Generate Script
        </>
      )}
    </Button>
  );
}

export function VideoScripterForm() {
  const initialState = { videoScript: null, error: null };
  const [state, formAction] = useActionState(generateVideoScriptAction, initialState);
  const [duration, setDuration] = React.useState(5);

  const formRef = useRef<HTMLFormElement>(null);
  const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lessonTopicRef = useRef<HTMLTextAreaElement>(null);

  const handleContinue = () => {
    if (formRef.current && hiddenTextareaRef.current && lessonTopicRef.current && state.videoScript) {
      // Set the value of the hidden textarea to the current script
      hiddenTextareaRef.current.value = state.videoScript;

      lessonTopicRef.current.focus();
      lessonTopicRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      formRef.current.requestSubmit();
    }
  };

  const isContentIncomplete = state.videoScript && !/[.!?]\s*$/.test(state.videoScript.trim());

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction} ref={formRef}>
          <CardHeader>
            <CardTitle className="font-headline">Describe Your Lesson</CardTitle>
            <CardDescription>
              Provide the topic for your video lesson and choose the desired length. The AI will generate a complete script for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="lessonTopic">Lesson Topic</Label>
              <Textarea
                id="lessonTopic"
                name="lessonTopic"
                ref={lessonTopicRef}
                placeholder="e.g., 'How to choose the right flour for sourdough bread' or 'An introduction to React Hooks: useState and useEffect'"
                rows={4}
                required
              />
              {typeof state.error === 'object' && state.error?.lessonTopic && (
                <p className="text-sm text-destructive">{state.error.lessonTopic[0]}</p>
              )}
            </div>
             <div className="flex flex-col space-y-1.5">
                <Label htmlFor="videoDuration">Desired Video Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                    <Slider 
                        id="videoDuration"
                        name="videoDuration"
                        min={1} 
                        max={30} 
                        step={1} 
                        value={[duration]}
                        onValueChange={(value) => setDuration(value[0])}
                        className="flex-1"
                    />
                    <span className="font-mono text-lg w-16 text-center bg-muted py-1 rounded-md">{duration} min</span>
                </div>
                 {typeof state.error === 'object' && state.error?.videoDuration && (
                    <p className="text-sm text-destructive">{state.error.videoDuration[0]}</p>
                )}
             </div>
             {/* Hidden field to pass the existing script when continuing */}
             <textarea name="existingScript" ref={hiddenTextareaRef} className="hidden" />
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.videoScript && (
        <div className="mt-8 space-y-4">
          <Alert>
              <Sparkles className="h-5 w-5" />
              <AlertTitle className="font-bold">Generated Video Script</AlertTitle>
              <AlertDescription className="mt-4">
                   <MarkdownContent content={state.videoScript} />
              </AlertDescription>
          </Alert>
          {isContentIncomplete && (
            <Button onClick={handleContinue} className="w-full" variant="outline" type="button">
              <PlusCircle className="mr-2 h-4 w-4" /> Continue Generating
            </Button>
          )}
        </div>
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
