
'use client';

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import type { ModerationItem } from "../page";
import { updateCommunityItemStatus } from "@/app/actions/community";

interface ModerationActionsProps {
  item: ModerationItem;
}

export function ModerationActions({ item }: ModerationActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(() => {
        updateCommunityItemStatus(item.id, item.type, 'APPROVED');
    });
  };
  
  const handleReject = () => {
    startTransition(() => {
        updateCommunityItemStatus(item.id, item.type, 'REJECTED');
    });
  };

  return (
    <div className="flex gap-2 justify-end">
      {item.status !== 'APPROVED' && (
        <Button size="sm" onClick={handleApprove} disabled={isPending} variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
          <span className="ml-2">Approve</span>
        </Button>
      )}
      {item.status !== 'REJECTED' && (
        <Button size="sm" onClick={handleReject} disabled={isPending} variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4"/>}
           <span className="ml-2">Reject</span>
        </Button>
      )}
    </div>
  );
}
