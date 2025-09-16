
'use client';

import NovelEditor from 'novel';

interface EditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export function Editor({ initialContent, onChange }: EditorProps) {
  return (
    <div className="relative w-full rounded-lg border bg-background shadow-sm">
      <NovelEditor
        defaultValue={initialContent}
        onUpdate={(editor) => {
          onChange(editor?.storage.markdown.getMarkdown() || '');
        }}
        disableLocalStorage
      />
    </div>
  );
}
