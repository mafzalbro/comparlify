"use client";

import { useState, useEffect } from "react";

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
    <div className="relative w-full rounded-lg shadow-sm">
      <textarea
        value={content}
        onChange={(e) => {
          const newContent = e.target.value;
          setContent(newContent);
          onChange(newContent);
        }}
        className="w-full h-48 p-4 rounded-lg"
        placeholder="Start typing..."
      />
    </div>
  );
}
