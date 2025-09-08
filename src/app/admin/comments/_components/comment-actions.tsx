'use client';

import { useActionState, useTransition } from "react";
import { approveCommentAction, rejectCommentAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import type { Comment } from "@prisma/client";

interface CommentActionsProps {
  comment: Comment;
}

export function CommentActions({ comment }: CommentActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(() => {
      approveCommentAction(comment.id);
    });
  };
  
  const handleReject = () => {
    startTransition(() => {
      rejectCommentAction(comment.id);
    });
  };

  return (
    <div className="flex gap-2 justify-end">
      {comment.status !== 'APPROVED' && (
        <Button size="sm" onClick={handleApprove} disabled={isPending} variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
          <span className="ml-2">Approve</span>
        </Button>
      )}
      {comment.status !== 'REJECTED' && (
        <Button size="sm" onClick={handleReject} disabled={isPending} variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4"/>}
           <span className="ml-2">Reject</span>
        </Button>
      )}
    </div>
  );
}
