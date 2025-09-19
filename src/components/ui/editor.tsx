"use client";

import { useEffect, useState } from "react";
import { EditorContent as NovelEditor } from "novel";

interface EditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export function Editor({ initialContent = "", onChange }: EditorProps) {
  const [content, setContent] = useState(initialContent);

  // Sync when initialContent changes from parent
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  return (
    <div className="relative w-full rounded-lg border bg-background shadow-sm">
      <NovelEditor
        // assume there is a `value` prop; check docs if exists
        value={content}
        onUpdate={(editor) => {
          const md = editor?.storage.markdown.getMarkdown() || "";
          onChange(md);
          setContent(md);
        }}
        disableLocalStorage
      />
    </div>
  );
}
