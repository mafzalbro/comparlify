
'use client';

import { useTransition } from 'react';
import type { ContactMessage } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogPortal,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, Trash2, Eye, Mail, MailOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteContactMessage, toggleMessageReadStatus } from '@/app/actions/contact';
import { format } from 'date-fns';

export function MessageActions({ message }: { message: ContactMessage }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteContactMessage(message.id);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Message deleted.' });
      }
    });
  };

  const handleToggleRead = () => {
    startTransition(async () => {
        const result = await toggleMessageReadStatus(message.id, !message.read);
        if (result.error) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
          toast({ title: 'Success', description: `Message marked as ${!message.read ? 'read' : 'unread'}.` });
        }
      });
  }

  return (
    <Dialog>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DialogTrigger asChild>
                <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" /> View Message
                </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem onClick={handleToggleRead} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (message.read ? <Mail className="mr-2 h-4 w-4" /> : <MailOpen className="mr-2 h-4 w-4" />)}
              Mark as {message.read ? 'Unread' : 'Read'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive" disabled={isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogPortal>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this message.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Contact Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="text-sm">
                    <p className="font-semibold">{message.name}</p>
                    <p className="text-muted-foreground">{message.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(message.createdAt), 'PPpp')}</p>
                </div>
                <div className="prose prose-sm dark:prose-invert bg-muted p-4 rounded-md">
                   <p>{message.message}</p>
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
}
