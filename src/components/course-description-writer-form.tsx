'use client';

import { useActionState } from 'react';
import { generateCourseDescriptionAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { ScrollArea } from './ui/scroll-area';
import { MarkdownContent } from './markdown-content';
import { Input } from './ui/input';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
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

export function CourseDescriptionWriterForm() {
  const initialState = { description: null, error: null };
  const [state, formAction] = useActionState(generateCourseDescriptionAction, initialState);

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">Course Details</CardTitle>
            <CardDescription>
              Provide your course title and the key topics you'll cover. The AI will write a compelling sales description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input id="courseTitle" name="courseTitle" placeholder="e.g., The Ultimate Guide to Sourdough Baking" required />
                 {typeof state.error === 'object' && state.error?.courseTitle && (
                  <p className="text-sm text-destructive">{state.error.courseTitle[0]}</p>
                )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="keyTopics">Key Topics Covered</Label>
              <Textarea
                id="keyTopics"
                name="keyTopics"
                placeholder="e.g., Creating a starter, kneading and folding, scoring techniques, baking in a Dutch oven, different types of flour..."
                rows={6}
                required
              />
              {typeof state.error === 'object' && state.error?.keyTopics && (
                <p className="text-sm text-destructive">{state.error.keyTopics[0]}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.description && (
        <Alert className="mt-8">
          <Sparkles className="h-5 w-5" />
          <AlertTitle className="font-bold">Generated Course Description</AlertTitle>
          <AlertDescription>
            <ScrollArea className="h-80 mt-4">
              <MarkdownContent content={state.description} />
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
