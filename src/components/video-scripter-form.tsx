
'use client';

import { useActionState, useRef, useState } from 'react';
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
                <><PlusCircle className="mr-2 h-4 w-4" /> Continue Script</>
            )}
        </Button>
    )
};

export function VideoScripterForm() {
  const initialState = { videoScript: null, error: null };
  const [state, formAction] = useActionState(generateVideoScriptAction, initialState);
  const [lessonTopic, setLessonTopic] = useState('');
  const [videoDuration, setVideoDuration] = React.useState(5);
  const formRef = useRef<HTMLFormElement>(null);

  const { isSubmitting, isContentIncomplete, handleContinue } = useContinueGeneration({
    formRef,
    content: state.videoScript,
  });
  
  const showLoader = isSubmitting;

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
                value={lessonTopic}
                onChange={(e) => setLessonTopic(e.target.value)}
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
                        value={[videoDuration]}
                        onValueChange={(value) => setVideoDuration(value[0])}
                        className="flex-1"
                    />
                    <span className="font-mono text-lg w-16 text-center bg-muted py-1 rounded-md">{videoDuration} min</span>
                </div>
                 {typeof state.error === 'object' && state.error?.videoDuration && (
                    <p className="text-sm text-destructive">{state.error.videoDuration[0]}</p>
                )}
             </div>
             <input type="hidden" name="existingScript" value={state.videoScript ?? ''} />
          </CardContent>
          <CardFooter>
            <SubmitButton isSubmitting={isSubmitting} />
          </CardFooter>
        </form>
      </Card>

      {showLoader && <AIGenerationLoader />}

      {state.videoScript && !showLoader && (
        <div className="mt-8 space-y-4">
          <Alert>
              <Sparkles className="h-5 w-5" />
              <AlertTitle className="font-bold">Generated Video Script</AlertTitle>
              <AlertDescription className="mt-4">
                   <MarkdownContent content={state.videoScript} />
              </AlertDescription>
          </Alert>
          {isContentIncomplete && <ContinueButton onClick={handleContinue} isSubmitting={isSubmitting} />}
        </div>
      )}

      {typeof state.error === 'string' && !isSubmitting && (
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
