
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
import { Loader2, Sparkles, PlusCircle, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { Slider } from './ui/slider';
import React from 'react';
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
  const [state, formAction, isFormSubmitting] = useActionState(generateVideoScriptAction, initialState);
  const [lessonTopic, setLessonTopic] = useState('');
  const [videoDuration, setVideoDuration] = React.useState(5);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const { isContinuing, isContentIncomplete, handleContinue } = useContinueGeneration({
    formRef,
    content: state.videoScript,
  });
  
  const showLoader = isFormSubmitting || isContinuing;

  const handleCopy = () => {
    if (state.videoScript) {
      navigator.clipboard.writeText(state.videoScript);
      toast({
        title: 'Copied!',
        description: 'Script copied to clipboard.',
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
                <CardTitle className="font-headline">Describe Your Lesson</CardTitle>
                <CardDescription>
                Provide the topic for your video lesson and choose the desired length. The AI will generate a complete script for you.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
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
                            max={10} 
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
                {isContinuing && state.videoScript && (
                    <input type="hidden" name="existingContent" value={state.videoScript} />
                )}
            </CardContent>
            <CardFooter>
                <SubmitButton isSubmitting={isContinuing} />
            </CardFooter>
            </Card>
        </form>

        <div className="h-full">
            {state.videoScript && !showLoader ? (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <CardTitle className="font-bold">Generated Video Script</CardTitle>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy">
                                <Copy className="h-4 w-4" />
                            </Button>
                            <form action={formAction}>
                                <input type="hidden" name="lessonTopic" value={lessonTopic} />
                                <input type="hidden" name="videoDuration" value={videoDuration} />
                                <Button variant="ghost" size="icon" title="Regenerate" type="submit">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <MarkdownContent content={state.videoScript} />
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
