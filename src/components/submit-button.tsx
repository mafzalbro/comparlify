'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  isEditing?: boolean;
  defaultText?: string;
  editingText?: string;
}

export function SubmitButton({
  isEditing = false,
  defaultText = 'Create',
  editingText = 'Save Changes',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const text = isEditing ? editingText : defaultText;
  const pendingText = isEditing ? 'Saving...' : 'Creating...';

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
}
