'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateCourseTitleAction } from '@/app/actions';
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
  const [state, formAction] = useActionState(generateCourseTitleAction, initialState);

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">Describe Your Course</CardTitle>
            <CardDescription>
              Enter a detailed description of your course content below. The more detail you provide, the better the title suggestions will be.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="courseDescription">Course Description</Label>
                <Textarea
                  id="courseDescription"
                  name="courseDescription"
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

      {state.courseTitle && (
        <Alert className="mt-8 bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
          <Sparkles className="h-5 w-5 text-green-500 dark:text-green-400" />
          <AlertTitle className="font-bold text-green-900 dark:text-green-200">Generated Title Suggestion</AlertTitle>
          <AlertDescription>
            {state.courseTitle}
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
