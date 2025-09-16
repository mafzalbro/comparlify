
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateGenericContentAction } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { AIGenerationLoader } from './ai-generation-loader';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import type { Tool } from '@/app/(main)/tools/tools';

function SubmitButton({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate</>}
    </Button>
  );
}

export function AIGenericForm({ tool }: { tool: Tool }) {
    const fieldType = tool.title;
    const initialState = { generatedContent: null, error: null };
    const [state, formAction, isSubmitting] = useActionState(async (prevState: any, formData: FormData) => {
        const topic = formData.get('topic') as string;
        const context = formData.get('context') as string | undefined;
        return generateGenericContentAction({ fieldType, topic, context });
    }, initialState);

    const [topic, setTopic] = useState('');
    const [context, setContext] = useState('');
    const { toast } = useToast();

    const handleCopy = () => {
        if (state.generatedContent) {
            navigator.clipboard.writeText(state.generatedContent);
            toast({ title: 'Copied!', description: 'Content copied to clipboard.' });
        }
    };

    return (
        <>
            <AIGenerationLoader show={isSubmitting} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <Card className="shadow-lg h-full flex flex-col">
                    <form action={formAction}>
                        <CardHeader>
                            <CardTitle className="font-headline">Input</CardTitle>
                            <CardDescription>
                                Provide a topic and optional context to generate content.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 flex-1">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic / Title</Label>
                                <Input id="topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'React Hooks Best Practices'" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="context">Context (Optional)</Label>
                                <Textarea id="context" name="context" value={context} onChange={(e) => setContext(e.target.value)} placeholder="Provide any additional context or keywords..." rows={4} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <SubmitButton title={tool.title} />
                        </CardFooter>
                    </form>
                </Card>

                <div className="h-full">
                    {state.generatedContent && !isSubmitting ? (
                        <Card className="h-full flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /><CardTitle className="font-bold">Generated Content</CardTitle></div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy"><Copy className="h-4 w-4" /></Button>
                                    <form action={formAction}>
                                        <input type="hidden" name="topic" value={topic} />
                                        <input type="hidden" name="context" value={context} />
                                        <Button variant="ghost" size="icon" title="Regenerate" type="submit"><RefreshCw className="h-4 w-4" /></Button>
                                    </form>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1"><MarkdownContent content={state.generatedContent} /></CardContent>
                        </Card>
                    ) : (
                        <Card className="flex items-center justify-center h-full min-h-[300px] border-dashed">
                            <div className="text-center text-muted-foreground"><Wand2 className="mx-auto h-12 w-12" /><h3 className="mt-4 text-lg font-semibold">Your generated content will appear here.</h3></div>
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
