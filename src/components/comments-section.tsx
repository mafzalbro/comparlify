"use client";

import { useFormStatus } from "react-dom";
import { useRef, useState, useEffect, useActionState } from "react";
import type { Session } from "next-auth";
import type { User, Comment, CommentStatus } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCommentAction, updateCommentAction } from "@/app/actions/comments";
import { Loader2, Send, Edit, X } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type CommentWithAuthor = Comment & { author: User };

interface CommentsSectionProps {
  postId: string;
  comments: CommentWithAuthor[];
  session: Session | null;
}

function SubmitButton({ isEditing }: { isEditing?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 gap-3"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      {isEditing ? "Update Comment" : "Post Comment"}
    </Button>
  );
}

export function CommentsSection({
  postId,
  comments,
  session,
}: CommentsSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addCommentAction, {
    error: null,
    success: false,
  });
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
  };

  return (
    <section id="comments" className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/20 pb-3">
        <h2 className="text-xl font-extrabold uppercase tracking-tight">
          Discussion{" "}
          <span className="text-primary italic">({comments.length})</span>
        </h2>
      </div>

      {session?.user ? (
        <form
          ref={formRef}
          action={formAction}
          className="p-5 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors shadow-md relative overflow-hidden group"
        >
          <input type="hidden" name="postId" value={postId} />
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10 shadow-sm shrink-0">
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground font-extrabold">
                {session.user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                name="content"
                placeholder="Write a comment..."
                rows={3}
                required
                className="bg-background/50 border-border/20 rounded-xl p-3 text-sm focus:ring-primary/20 transition-all resize-none shadow-xs"
              />
              <div className="flex justify-end">
                <SubmitButton />
              </div>
            </div>
          </div>
          {typeof state.error === "string" && (
            <p className="text-[10px] font-bold text-destructive mt-2 text-right uppercase tracking-wider">
              {state.error.toString()}
            </p>
          )}
          {state.success && (
            <Alert className="mt-4 bg-primary/5 border-primary/20 rounded-xl p-3 shadow-sm">
              <CheckCircle className="h-4 w-4 text-primary!" />
              <AlertTitle className="text-xs font-extrabold uppercase tracking-tight mb-0.5 text-foreground">
                Comment Submitted
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground font-medium">
                Your comment is being reviewed and will be visible soon.
              </AlertDescription>
            </Alert>
          )}
        </form>
      ) : (
        <div className="p-6 text-center border border-dashed border-border/30 rounded-2xl bg-card/20 backdrop-blur-sm">
          <p className="text-muted-foreground text-sm font-medium mb-4">
            Log in to join the discussion.
          </p>
          <Button
            asChild
            className="rounded-full px-6 h-10 font-extrabold uppercase tracking-widest text-[10px] shadow-md shadow-primary/20 hover:scale-102 active:scale-98 transition-all"
          >
            <Link href="/login">Initialize Access</Link>
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) =>
          editingCommentId === comment.id ? (
            <EditCommentForm
              key={comment.id}
              comment={comment}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div
              key={comment.id}
              className="group relative flex items-start gap-4 p-4 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-all shadow-xs"
            >
              <Avatar className="h-10 w-10 ring-1 ring-background shadow-xs shrink-0">
                <AvatarImage src={comment.author.image ?? undefined} />
                <AvatarFallback className="font-extrabold">
                  {comment.author.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-extrabold text-foreground tracking-tight">
                      {comment.author.name}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                      {format(new Date(comment.createdAt), "PP")}
                    </p>
                  </div>
                  {session?.user?.id === comment.authorId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full h-7 px-3 font-extrabold uppercase tracking-widest text-[8px] hover:bg-primary/10 hover:text-primary transition-all"
                      onClick={() => handleEditClick(comment.id)}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  )}
                </div>
                <div className="text-xs font-medium italic text-muted-foreground leading-relaxed">
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function EditCommentForm({
  comment,
  onCancel,
}: {
  comment: CommentWithAuthor;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateCommentAction, {
    error: null,
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Comment Updated",
        description: "Your comment has been submitted for re-approval.",
      });
      onCancel();
    }
    if (state.error) {
      toast({
        title: "Error",
        description:
          typeof state.error === "string"
            ? state.error
            : "Validation failed. Please check your input.",
        variant: "destructive",
      });
    }
  }, [state, onCancel, toast]);

  return (
    <form action={formAction}>
      <input type="hidden" name="commentId" value={comment.id} />
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarImage src={comment.author.image ?? undefined} />
          <AvatarFallback>{comment.author.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-6">
          <Textarea
            name="content"
            defaultValue={comment.content}
            rows={3}
            required
            className="bg-background/40 border-border/10 rounded-4xl p-6 text-lg focus:ring-primary/20 transition-all resize-none shadow-inner"
          />
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" /> Cancel Task
            </Button>
            <SubmitButton isEditing />
          </div>
        </div>
      </div>
    </form>
  );
}
