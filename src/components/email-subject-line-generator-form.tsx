
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateEmailSubjectLinesAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';
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
          Generate Subjects
        </>
      )}
    </Button>
  );
}

export function EmailSubjectLineGeneratorForm() {
  const initialState = { subjectLines: null, error: null };
  const [state, formAction] = useActionState(generateEmailSubjectLinesAction, initialState);

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">Email Content</CardTitle>
            <CardDescription>
              Paste the body of your email or a summary of its content, and the AI will generate a list of effective subject lines.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="emailContent">Email Content or Summary</Label>
                <Textarea
                  id="emailContent"
                  name="emailContent"
                  placeholder="e.g., 'Announcing my new course on watercolor painting. It's a 4-week course for beginners and covers all the basic techniques...'"
                  rows={8}
                  required
                />
                {typeof state.error === 'object' && state.error?.emailContent && (
                  <p className="text-sm text-destructive">{state.error.emailContent[0]}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.subjectLines && (
        <Alert className="mt-8">
          <Sparkles className="h-5 w-5" />
          <AlertTitle className="font-bold">Generated Subject Lines</AlertTitle>
          <AlertDescription className="mt-4">
            <MarkdownContent content={state.subjectLines} />
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
