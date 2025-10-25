
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { updateContentAction } from '@/app/actions/content';
import { type SiteContent } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from '@/components/submit-button';

interface ThemeEditorProps {
  themeContent: SiteContent[];
  onFormSuccess?: () => void;
}

const themeStructure = [
  { mode: 'light', name: 'Primary', key: 'theme.light.primary' },
  { mode: 'light', name: 'Secondary', key: 'theme.light.secondary' },
  { mode: 'light', name: 'Accent', key: 'theme.light.accent' },
  { mode: 'light', name: 'Background', key: 'theme.light.background' },
  { mode: 'light', name: 'Foreground', key: 'theme.light.foreground' },
  { mode: 'dark', name: 'Primary', key: 'theme.dark.primary' },
  { mode: 'dark', name: 'Secondary', key: 'theme.dark.secondary' },
  { mode: 'dark', name: 'Accent', key: 'theme.dark.accent' },
  { mode: 'dark', name: 'Background', key: 'theme.dark.background' },
  { mode: 'dark', name: 'Foreground', key: 'theme.dark.foreground' },
];

export function ThemeEditor({ themeContent, onFormSuccess }: ThemeEditorProps) {
  const [state, formAction] = useActionState(updateContentAction, { error: null, success: false });
  const { toast } = useToast();
  const successShownRef = useRef(false);

  const contentMap = new Map(themeContent.map(item => [item.key, item.value]));

  const [formState, setFormState] = useState(() => 
    themeStructure.reduce((acc, { key }) => {
      acc[key] = contentMap.get(key) || '';
      return acc;
    }, {} as Record<string, string>)
  );

  const handleInputChange = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };
  
  useEffect(() => {
    if (state.success && !successShownRef.current) {
      toast({ title: 'Success!', description: 'Theme updated successfully.' });
      onFormSuccess?.();
      successShownRef.current = true;
    } else if (state.error) {
      toast({ title: 'Error', description: state.error, variant: 'destructive' });
      successShownRef.current = false;
    } else if (!state.success && !state.error) {
        successShownRef.current = false;
    }
  }, [state, toast, onFormSuccess]);

  const lightFields = themeStructure.filter(f => f.mode === 'light');
  const darkFields = themeStructure.filter(f => f.mode === 'dark');

  return (
    <form action={formAction}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Light Mode</h3>
          {lightFields.map(({ key, name }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{name}</Label>
              <Input
                id={key}
                name={key}
                value={formState[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder="e.g. 45 93% 58%"
              />
            </div>
          ))}
        </div>
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Dark Mode</h3>
            {darkFields.map(({ key, name }) => (
                <div key={key} className="space-y-2">
                <Label htmlFor={key}>{name}</Label>
                <Input
                    id={key}
                    name={key}
                    value={formState[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder="e.g. 45 93% 58%"
                />
                </div>
            ))}
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <SubmitButton isEditing={true} />
      </div>
    </form>
  );
}
