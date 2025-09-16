
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateContentRepurposeIdeasAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { AIGenerationLoader } from './ai-generation-loader';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

const originalFormats = ["Blog Post", "Video Script", "Podcast Transcript", "Lesson Text"];
const targetFormats = ["Twitter Thread", "LinkedIn Post", "Facebook Post", "Email Newsletter", "Short Video Idea", "Infographic Outline"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Ideas...</> : <><Sparkles className="mr-2 h-4 w-4" /> Get Ideas</>}
    </Button>
  );
}

export function ContentRepurposerForm() {
  const initialState = { repurposedIdeas: null, error: null };
  const [state, formAction, isSubmitting] = useActionState(generateContentRepurposeIdeasAction, initialState);
  const [originalContent, setOriginalContent] = useState('');
  const { toast } = useToast();

  const handleCopy = () => {
    if (state.repurposedIdeas) {
      navigator.clipboard.writeText(state.repurposedIdeas);
      toast({ title: 'Copied!', description: 'Ideas copied to clipboard.' });
    }
  };

  return (
    <>
      <AIGenerationLoader show={isSubmitting} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <Card className="shadow-lg h-full flex flex-col">
          <form action={formAction}>
            <CardHeader>
              <CardTitle className="font-headline">Repurpose Your Content</CardTitle>
              <CardDescription>
                Paste your original content, specify its format, and choose what you want to turn it into.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="space-y-2">
                <Label htmlFor="originalContent">Original Content</Label>
                <Textarea id="originalContent" name="originalContent" value={originalContent} onChange={(e) => setOriginalContent(e.target.value)} placeholder="Paste your blog post, script, or lesson text here..." rows={8} required />
                {typeof state.error === 'object' && state.error?.originalContent && <p className="text-sm text-destructive">{state.error.originalContent[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalFormat">Original Format</Label>
                <Select name="originalFormat" defaultValue={originalFormats[0]}>
                  <SelectTrigger id="originalFormat"><SelectValue placeholder="Select format..." /></SelectTrigger>
                  <SelectContent>
                    {originalFormats.map(format => <SelectItem key={format} value={format}>{format}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Formats</Label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-4">
                  {targetFormats.map(format => (
                    <div key={format} className="flex items-center gap-2">
                      <Checkbox id={`format-${format}`} name="targetFormats" value={format} />
                      <Label htmlFor={`format-${format}`} className="font-normal">{format}</Label>
                    </div>
                  ))}
                </div>
                 {typeof state.error === 'object' && state.error?.targetFormats && <p className="text-sm text-destructive">{state.error.targetFormats[0]}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        <div className="h-full">
          {state.repurposedIdeas && !isSubmitting ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /><CardTitle className="font-bold">Repurposing Ideas</CardTitle></div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy"><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Regenerate" type="submit"><RefreshCw className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1"><MarkdownContent content={state.repurposedIdeas} /></CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-full min-h-[300px] border-dashed">
              <div className="text-center text-muted-foreground"><Wand2 className="mx-auto h-12 w-12" /><h3 className="mt-4 text-lg font-semibold">Your generated ideas will appear here.</h3></div>
            </Card>
          )}
          {typeof state.error === 'string' && !isSubmitting && (
            <Alert variant="destructive" className="mt-8"><AlertTitle>Error</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert>
          )}
        </div>
      </div>
    </>
  );
}
