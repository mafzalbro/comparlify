
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createPostAction } from '@/app/actions/community';
import { Send, Loader2 } from 'lucide-react';
import type { Session } from 'next-auth';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Post Reply
        </Button>
    )
}

interface ReplyFormProps {
    topicId: string;
    session: Session | null;
}

export function ReplyForm({ topicId, session }: ReplyFormProps) {
    const [state, formAction] = useActionState(createPostAction, { success: false, error: null, message: null });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if(state.success) {
            formRef.current?.reset();
        }
    }, [state.success]);

    if (!session?.user) {
        return (
             <div className="text-center p-6 rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground mb-4">You must be logged in to post a reply.</p>
                <Button asChild>
                    <Link href="/login">Log In</Link>
                </Button>
            </div>
        )
    }

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="topicId" value={topicId} />
            <Textarea 
                name="content"
                rows={5}
                placeholder="Write your reply..."
                required
            />
            <div className="flex justify-end">
                <SubmitButton />
            </div>
            {state.success && state.message && (
                 <Alert className="mt-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 !text-green-500" />
                    <AlertTitle className="text-green-800 dark:text-green-300">Reply Submitted</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-400">
                        {state.message}
                    </AlertDescription>
                </Alert>
            )}
             {typeof state.error === 'string' && (
                <p className="text-sm text-destructive mt-2">{state.error}</p>
            )}
        </form>
    );
}
