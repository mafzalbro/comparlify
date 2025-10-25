
'use client';

import { useState, useEffect } from 'react';
import NovelEditor from 'novel';

interface EditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export function Editor({ initialContent = "", onChange }: EditorProps) {
  const [content, setContent] = useState<string>(initialContent);

  // Sync when initialContent changes from parent
  useEffect(() => {
    if (initialContent !== null) {
      setContent(initialContent);
    } else {
      setContent("");
    }
  }, [initialContent]);


  return (
    <div className="relative w-full rounded-lg border bg-background shadow-sm">
       <NovelEditor
          defaultValue={content}
          onUpdate={(editor) => {
            const markdown = editor?.storage.markdown.getMarkdown();
            onChange(markdown || '');
          }}
          disableLocalStorage={true}
          className="relative min-h-[300px] w-full max-w-screen-lg"
       />
    </div>
  );
}
