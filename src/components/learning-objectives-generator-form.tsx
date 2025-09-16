
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateLearningObjectivesAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
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
          Generate Objectives
        </>
      )}
    </Button>
  );
}

export function LearningObjectivesGeneratorForm() {
  const initialState = { objectives: null, error: null };
  const [state, formAction, isSubmitting] = useActionState(generateLearningObjectivesAction, initialState);
  const [courseTopic, setCourseTopic] = useState('');
  const { toast } = useToast();

  const handleCopy = () => {
    if (state.objectives) {
      navigator.clipboard.writeText(state.objectives);
      toast({
        title: 'Copied!',
        description: 'Objectives copied to clipboard.',
      });
    }
  };

  return (
    <>
      <AIGenerationLoader show={isSubmitting} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
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
                    value={courseTopic}
                    onChange={(e) => setCourseTopic(e.target.value)}
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

        <div className="h-full">
            {state.objectives && !isSubmitting ? (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <CardTitle className="font-bold">Generated Learning Objectives</CardTitle>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy">
                                <Copy className="h-4 w-4" />
                            </Button>
                            <form action={formAction}><input type="hidden" name="courseTopic" value={courseTopic} /><Button variant="ghost" size="icon" title="Regenerate"><RefreshCw className="h-4 w-4" /></Button></form>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <MarkdownContent content={state.objectives} />
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
                <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}
        </div>
      </div>
    </>
  );
}
