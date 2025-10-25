
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/alert-dialog';

interface ConfirmationDialogProps {
  actionType: 'seed' | 'cleanup';
  onConfirm: () => void;
}

export function ConfirmationDialog({ actionType, onConfirm }: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const confirmationText = actionType === 'seed' ? 'seed' : 'cleanup';
  const isButtonDisabled = inputValue !== confirmationText;

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
    setInputValue('');
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          {actionType === 'seed' ? 'Clean & Seed Database' : 'Cleanup Database'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible. To proceed, please type{' '}
            <strong className="text-destructive">{confirmationText}</strong> into the box below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Type "${confirmationText}" to confirm`}
          className="mt-2"
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setInputValue('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isButtonDisabled}
            className="bg-destructive hover:bg-destructive/90"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
