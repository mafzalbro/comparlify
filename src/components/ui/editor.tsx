'use client';

import { Textarea } from '@/components/ui/textarea';

interface EditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export function Editor({ initialContent = '', onChange }: EditorProps) {
  return (
    <Textarea
      value={initialContent}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[300px] w-full"
      placeholder="Write your content here. Markdown is supported."
    />
  );
}
