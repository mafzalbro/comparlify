
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateAudiencePersonaAction } from '@/app/actions/ai';
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
          Generating Persona...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Persona
        </>
      )}
    </Button>
  );
}

export function AudiencePersonaGeneratorForm() {
  const initialState = { persona: null, error: null };
  const [state, formAction] = useActionState(generateAudiencePersonaAction, initialState);

  return (
    <>
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">Describe Your Course Idea</CardTitle>
            <CardDescription>
              Provide a description of your course, and the AI will generate a detailed persona for your ideal student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="courseIdea">Course Idea</Label>
                <Textarea
                  id="courseIdea"
                  name="courseIdea"
                  placeholder="e.g., 'A course for busy professionals who want to learn photography on their weekends.'"
                  rows={4}
                  required
                />
                {typeof state.error === 'object' && state.error?.courseIdea && (
                  <p className="text-sm text-destructive">{state.error.courseIdea[0]}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.persona && (
        <Alert className="mt-8">
          <Sparkles className="h-5 w-5" />
          <AlertTitle className="font-bold">Generated Audience Persona</AlertTitle>
          <AlertDescription className="mt-4">
            <MarkdownContent content={state.persona} />
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
