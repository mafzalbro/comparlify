'use client';

import { useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import type { Session } from 'next-auth';
import type { User, Comment } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addComment } from '@/app/actions';
import { Loader2, Send } from 'lucide-react';
import Link from 'next/link';

type CommentWithAuthor = Comment & { author: User };

interface CommentsSectionProps {
  postId: string;
  comments: CommentWithAuthor[];
  session: Session | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Post Comment
    </Button>
  );
}

export function CommentsSection({ postId, comments, session }: CommentsSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(addComment, { error: null });

  return (
    <section id="comments" className="pt-12">
      <h2 className="font-headline text-3xl font-bold mb-6">
        Comments ({comments.length})
      </h2>

      {session?.user ? (
        <form
          ref={formRef}
          action={async (formData) => {
            formAction(formData);
            if(!state?.error) {
              formRef.current?.reset();
            }
          }}
          className="mb-8"
        >
          <input type="hidden" name="postId" value={postId} />
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea
                name="content"
                placeholder="Join the discussion..."
                rows={3}
                required
              />
              <div className="flex justify-end">
                <SubmitButton />
              </div>
            </div>
          </div>
          {typeof state.error === 'string' && (
            <p className="text-sm text-destructive mt-2 text-right">{state.error}</p>
          )}
        </form>
      ) : (
        <div className="text-center p-6 rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground mb-4">You must be logged in to post a comment.</p>
            <Button asChild>
                <Link href="/login">Log In</Link>
            </Button>
        </div>
      )}

      <div className="space-y-8">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={comment.author.image ?? undefined} />
              <AvatarFallback>{comment.author.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="font-semibold">{comment.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <p className="text-foreground/90 mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
