
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useActionState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormStatus } from 'react-dom';
import { Send, Loader2 } from 'lucide-react';
import { createTopicAction } from '@/app/actions/community';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Topic</>}
    </Button>
  )
}

function NewTopicForm() {
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category');
    const router = useRouter();
    const { toast } = useToast();

    const [state, formAction] = useActionState(createTopicAction, { success: false, error: null, message: null });

    useEffect(() => {
        if (state.success && state.message) {
            toast({
                title: 'Success!',
                description: state.message
            });
            router.back();
        }
    }, [state, router, toast])

    return (
        <form action={formAction}>
            <input type="hidden" name="categoryId" value={categoryId ?? ''} />
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Create a New Topic</CardTitle>
                    <CardDescription>Share your thoughts, ask a question, or start a discussion.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="A clear and concise title for your topic" required />
                        {typeof state.error !== 'string' && state.error?.title && <p className="text-destructive text-sm">{state.error.title[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea id="content" name="content" placeholder="Write the main content of your topic here. Markdown is supported." rows={10} required />
                        {typeof state.error !== 'string' && state.error?.content && <p className="text-destructive text-sm">{state.error.content[0]}</p>}
                    </div>
                    {typeof state.error === 'string' && (
                        <p className="text-destructive text-sm text-center">{state.error}</p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                     <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>
    )
}

export default function NewTopicPage() {
  return (
    <div className="container py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <NewTopicForm />
      </Suspense>
    </div>
  );
}
