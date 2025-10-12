
'use client';

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Trash2 } from "lucide-react";
import type { ModerationItem } from "../page";
import { updateCommunityItemStatus, deleteCommunityItemAction } from "@/app/actions/community";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface ModerationActionsProps {
  item: ModerationItem;
}

export function ModerationActions({ item }: ModerationActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusChange = (status: 'APPROVED' | 'REJECTED') => {
    startTransition(async () => {
        try {
            await updateCommunityItemStatus(item.id, item.type, status);
            toast({ title: 'Success', description: `Item marked as ${status.toLowerCase()}.` });
        } catch(e) {
            toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
        }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
        const result = await deleteCommunityItemAction(item.id, item.type);
        if (result.success) {
            toast({ title: 'Success', description: 'Item has been deleted.' });
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    });
  }

  return (
    <div className="flex gap-2 justify-end">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4"/>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {item.status !== 'APPROVED' && (
                <DropdownMenuItem onClick={() => handleStatusChange('APPROVED')}>
                    <Check className="mr-2 h-4 w-4" /> Approve
                </DropdownMenuItem>
            )}
            {item.status !== 'REJECTED' && (
                <DropdownMenuItem onClick={() => handleStatusChange('REJECTED')}>
                    <X className="mr-2 h-4 w-4" /> Reject
                </DropdownMenuItem>
            )}
             <DropdownMenuSeparator />
             <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
             </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this {item.type.toLowerCase()}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
