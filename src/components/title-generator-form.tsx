
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateCourseTitleAction } from '@/app/actions/ai';
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
import { Loader2, Sparkles, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { AIGenerationLoader } from './ai-generation-loader';
import { useToast } from '@/hooks/use-toast';

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
          Generate Title
        </>
      )}
    </Button>
  );
}

export function TitleGeneratorForm() {
  const initialState = { courseTitle: null, error: null };
  const [state, formAction, isSubmitting] = useActionState(generateCourseTitleAction, initialState);
  const [courseDescription, setCourseDescription] = useState('');
  const { toast } = useToast();

  const handleCopy = () => {
    if (state.courseTitle) {
      navigator.clipboard.writeText(state.courseTitle);
      toast({
        title: 'Copied!',
        description: 'Title copied to clipboard.',
      });
    }
  };

  return (
    <>
      <AIGenerationLoader show={isSubmitting} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <Card className="shadow-lg h-full flex flex-col">
          <form action={formAction}>
            <CardHeader>
              <CardTitle className="font-headline">Describe Your Course</CardTitle>
              <CardDescription>
                Enter a detailed description of your course content below. The more detail you provide, the better the title suggestions will be.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="courseDescription">Course Description</Label>
                  <Textarea
                    id="courseDescription"
                    name="courseDescription"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="e.g., 'A comprehensive course on modern JavaScript, covering ES6+, React, Node.js, and building full-stack applications...'"
                    rows={8}
                    required
                  />
                  {typeof state.error === 'object' && state.error?.courseDescription && (
                    <p className="text-sm text-destructive">{state.error.courseDescription[0]}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        <div className="h-full">
            {state.courseTitle && !isSubmitting ? (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <CardTitle className="font-bold">Generated Title</CardTitle>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy">
                                <Copy className="h-4 w-4" />
                            </Button>
                            <form action={formAction}>
                                <input type="hidden" name="courseDescription" value={courseDescription} />
                                <Button variant="ghost" size="icon" title="Regenerate" type="submit">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="text-lg">{state.courseTitle}</p>
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
