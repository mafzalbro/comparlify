
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { updateContentAction } from '@/app/actions/content';
import { type SiteContent } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from '@/components/submit-button';
import { ColorInput } from './color-input';
import { Label } from '@/components/ui/label';

interface ThemeEditorProps {
  themeContent: SiteContent[];
  onFormSuccess?: () => void;
}

const themeStructure = [
    { mode: 'light', name: 'Primary', key: 'theme.light.primary' },
    { mode: 'light', name: 'Primary Foreground', key: 'theme.light.primary-foreground' },
    { mode: 'light', name: 'Secondary', key: 'theme.light.secondary' },
    { mode: 'light', name: 'Accent', key: 'theme.light.accent' },
    { mode: 'light', name: 'Background', key: 'theme.light.background' },
    { mode: 'light', name: 'Foreground', key: 'theme.light.foreground' },
    { mode: 'light', name: 'Card', key: 'theme.light.card' },
    { mode: 'light', name: 'Border', key: 'theme.light.border' },
    { mode: 'light', name: 'Input', key: 'theme.light.input' },
    { mode