'use client';

import { useActionState } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { useRef, useState, useEffect } from 'react';
import type { Session } from 'next-auth';
import type { User, Comment, CommentStatus } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addCommentAction, updateCommentAction } from '@/app/actions';
import { Loader2, Send, Edit, X } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CommentWithAuthor = Comment & { author: User };

interface CommentsSectionProps {
  postId: string;
  comments: CommentWithAuthor[];
  session: Session | null;
}

function SubmitButton({ isEditing }: { isEditing?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      {isEditing ? 'Update Comment' : 'Post Comment'}
    </Button>
  );
}

export function CommentsSection({ postId, comments, session }: CommentsSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addCommentAction, { error: null, success: false });
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);
  
  const handleEditClick = (commentId: string) => {
    setEditingCommentId(commentId);
  };
  
  const handleCancelEdit = () => {
    setEditingCommentId(null);
  }

  return (
    <section id="comments" className="pt-12">
      <h2 className="font-headline text-3xl font-bold mb-6">
        Comments ({comments.length})
      </h2>

      {session?.user ? (
        <form
          ref={formRef}
          action={formAction}
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
          {state.success && (
            <Alert className="mt-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CheckCircle className="h-4 w-4 !text-green-500" />
                <AlertTitle className="text-green-800 dark:text-green-300">Comment Submitted</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                    Your comment has been submitted for review. It will be visible after approval.
                </AlertDescription>
            </Alert>
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
            editingCommentId === comment.id ? (
                <EditCommentForm key={comment.id} comment={comment} onCancel={handleCancelEdit} />
            ) : (
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
                <p className="text-foreground/90 mt-1 whitespace-pre-wrap">{comment.content}</p>
                 {session?.user?.id === comment.authorId && (
                     <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={() => handleEditClick(comment.id)}>
                         <Edit className="h-3 w-3 mr-1" /> Edit
                     </Button>
                 )}
                </div>
            </div>
            )
        ))}
      </div>
    </section>
  );
}


function EditCommentForm({ comment, onCancel }: { comment: CommentWithAuthor, onCancel: () => void }) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(updateCommentAction, { error: null, success: false });

    useEffect(() => {
        if (state.success) {
            toast({
                title: 'Comment Updated',
                description: 'Your comment has been submitted for re-approval.',
            })
            onCancel();
        }
        if (state.error) {
            toast({
                title: 'Error',
                description: state.error,
                variant: 'destructive',
            })
        }
    }, [state, onCancel, toast])

    return (
        <form action={formAction}>
            <input type="hidden" name="commentId" value={comment.id} />
            <div className="flex items-start gap-4">
                 <Avatar>
                    <AvatarImage src={comment.author.image ?? undefined} />
                    <AvatarFallback>{comment.author.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                    <Textarea name="content" defaultValue={comment.content} rows={3} required />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onCancel}>
                            <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                        <SubmitButton isEditing />
                    </div>
                </div>
            </div>
        </form>
    );
}
