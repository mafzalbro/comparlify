
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { updateContentAction } from '@/app/actions/content';
import { type SiteContent } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from '@/components/submit-button';
import { Editor } from '@/components/ui/editor';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ContentFormProps {
  items: SiteContent[];
  onFormSuccess?: () => void;
}

const isJsonArrayOfObjects = (value: string): any[] | null => {
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
            return parsed;
        }
    } catch (e) {
        return null;
    }
    return null;
}

const JsonArrayEditor = ({ item }: { item: SiteContent }) => {
    const initialArray = isJsonArrayOfObjects(item.value) || [];
    const [array, setArray] = useState(initialArray);
    
    useEffect(() => {
        setArray(isJsonArrayOfObjects(item.value) || []);
    }, [item.value]);
    
    const handleItemChange = (itemIndex: number, key: string, value: string) => {
        const newArray = [...array];
        newArray[itemIndex][key] = value;
        setArray(newArray);
    };

    const handleAddItem = () => {
        const newItem = array.length > 0 ? Object.fromEntries(Object.keys(array[0]).map(key => [key, ''])) : { label: '', href: '' };
        setArray([...array, newItem]);
    };

    const handleRemoveItem = (itemIndex: number) => {
        setArray(array.filter((_, i) => i !== itemIndex));
    };
    
    const objectKeys = array.length > 0 ? Object.keys(array[0]) : [];

    return (
        <div className="space-y-4">
            <input type="hidden" name={item.key} value={JSON.stringify(array, null, 2)} />
            {array.map((listItem, itemIndex) => (
                <Card key={itemIndex} className="p-4 relative">
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-0">
                         {objectKeys.map(key => (
                             <div key={key} className="space-y-1">
                                 <Label htmlFor={`${item.key}-${itemIndex}-${key}`} className="capitalize text-xs">{key}</Label>
                                 <Input
                                     id={`${item.key}-${itemIndex}-${key}`}
                                     value={listItem[key]}
                                     onChange={(e) => handleItemChange(itemIndex, key, e.target.value)}
                                 />
                             </div>
                         ))}
                    </CardContent>
                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive h-7 w-7" onClick={() => handleRemoveItem(itemIndex)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </Card>
            ))}
             <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
        </div>
    )
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
    const jsonArray = isJsonArrayOfObjects(item.value);

    if (jsonArray) {
        return <JsonArrayEditor item={item} />
    }

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
