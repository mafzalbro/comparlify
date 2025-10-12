
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { updateContentAction } from '@/app/actions/content';
import { type SiteContent } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from '@/components/submit-button';
import { Editor } from '@/components/ui/editor';

interface ContentFormProps {
  items: SiteContent[];
  onFormSuccess?: () => void;
}

export function ContentForm({ items, onFormSuccess }: ContentFormProps) {
  const [state, formAction] = useActionState(updateContentAction, { error: null, success: false });
  const { toast } = useToast();
  const successShownRef = useRef(false);

  useEffect(() => {
    if (state.success && !successShownRef.current) {
      toast({ title: 'Success!', description: 'Content updated successfully.' });
      onFormSuccess?.();
      successShownRef.current = true;
    } else if (state.error) {
      toast({ title: 'Error', description: state.error, variant: 'destructive' });
      successShownRef.current = false; // Reset on error
    } else if (!state.success && !state.error) {
        // Reset the flag if the form is in its initial state
        successShownRef.current = false;
    }
  }, [state, toast, onFormSuccess]);

  const renderInput = (item: SiteContent) => {
    // This hidden input ensures the value is always submitted, even for the Editor which manages its own state.
    const hiddenInput = <input type="hidden" name={item.key} defaultValue={item.value} />;

    switch(item.type) {
        case 'TEXTAREA':
            return <Textarea id={item.key} name={item.key} defaultValue={item.value} rows={5} />
        case 'MARKDOWN':
            return (
                <>
                    {hiddenInput}
                    <Editor
                        key={item.id}
                        initialContent={item.value}
                        onChange={value => {
                            const input = document.querySelector(`input[name="${item.key}"]`) as HTMLInputElement;
                            if (input) input.value = value;
                        }}
                    />
                </>
            );
        case 'TEXT':
        default:
            return <Input id={item.key} name={item.key} defaultValue={item.value} />
    }
  }


  return (
    <form action={formAction}>
      <div className="space-y-6">
        {items.map(item => (
          <div key={item.id} className="space-y-2">
            <Label htmlFor={item.key}>{item.key}</Label>
            {renderInput(item)}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <SubmitButton isEditing={true} />
      </div>
    </form>
  );
}
