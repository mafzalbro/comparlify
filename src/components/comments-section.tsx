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
    <section id="comments" className="space-y-10">
      <div className="flex items-center justify-between border-b border-border/10 pb-4">
        <h2 className="text-2xl font-black uppercase tracking-tight">
          Discussion{" "}
          <span className="text-primary italic">({comments.length})</span>
        </h2>
      </div>

      {session?.user ? (
        <form
          ref={formRef}
          action={formAction}
          className="p-6 rounded-[2rem] bg-card/40 backdrop-blur-3xl border border-border/10 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <input type="hidden" name="postId" value={postId} />
          <div className="flex items-start gap-6">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10 shadow-xl shrink-0">
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground font-black">
                {session.user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea
                name="content"
                placeholder="Write a comment..."
                rows={3}
                required
                className="bg-background/40 border-border/10 rounded-2xl p-4 text-base focus:ring-primary/20 transition-all resize-none shadow-inner"
              />
              <div className="flex justify-end">
                <SubmitButton />
              </div>
            </div>
          </div>
          {typeof state.error === "string" && (
            <p className="text-[10px] font-bold text-destructive mt-4 text-right uppercase tracking-wider">
              {state.error}
            </p>
          )}
          {state.success && (
            <Alert className="mt-6 bg-primary/5 border-primary/20 rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
              <CheckCircle className="h-5 w-5 !text-primary" />
              <AlertTitle className="text-sm font-black uppercase tracking-tight mb-1 text-foreground">
                Comment Submitted
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground font-medium">
                Your comment is being reviewed and will be visible soon.
              </AlertDescription>
            </Alert>
          )}
        </form>
      ) : (
        <div className="p-10 text-center border-2 border-dashed border-border/10 rounded-[2rem] bg-secondary/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-grid-pattern-light opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <p className="text-muted-foreground text-lg font-medium mb-6 relative z-10">
            Log in to join the discussion.
          </p>
          <Button
            asChild
            className="rounded-full px-10 h-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all relative z-10"
          >
            <Link href="/login">Initialize Access</Link>
          </Button>
        </div>
      )}

      <div className="space-y-8">
        {comments.map((comment, index) =>
          editingCommentId === comment.id ? (
            <EditCommentForm
              key={comment.id}
              comment={comment}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div
              key={comment.id}
              className="group relative flex items-start gap-6 p-6 rounded-[2rem] bg-card/20 backdrop-blur-xl border border-border/10 hover:border-primary/20 hover:bg-card/40 transition-all duration-500 hover:shadow-xl"
            >
              <Avatar className="h-12 w-12 ring-2 ring-background shadow-lg shrink-0 group-hover:ring-primary/10 transition-all">
                <AvatarImage src={comment.author.image ?? undefined} />
                <AvatarFallback className="font-black">
                  {comment.author.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-baseline gap-3">
                    <p className="text-base font-black text-foreground uppercase tracking-tight">
                      {comment.author.name}
                    </p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                      {format(new Date(comment.createdAt), "PP")}
                    </p>
                  </div>
                  {session?.user?.id === comment.authorId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full h-8 px-4 font-black uppercase tracking-widest text-[8px] hover:bg-primary/10 hover:text-primary transition-all"
                      onClick={() => handleEditClick(comment.id)}
                    >
                      <Edit className="h-3 w-3 mr-1.5" /> Edit
                    </Button>
                  )}
                </div>
                <div className="text-sm font-medium italic text-muted-foreground leading-relaxed">
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
            className="bg-background/40 border-border/10 rounded-[2rem] p-6 text-lg focus:ring-primary/20 transition-all resize-none shadow-inner"
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
