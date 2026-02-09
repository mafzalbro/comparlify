"use client";

import React, { useState, useEffect } from "react";
import { MdEditor, Themes } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import { useTheme } from "next-themes";

interface EditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export function Editor({ initialContent = "", onChange }: EditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const [content, setContent] = useState(initialContent);

  // Update internal state when initialContent changes (e.g. from AI fill)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (value: string) => {
    setContent(value);
    onChange(value);
  };

  const currentTheme = (theme === "system" ? resolvedTheme : theme) as Themes;

  return (
    <div className="w-full border rounded-md overflow-hidden bg-background min-h-[400px] flex flex-col">
      <MdEditor
        modelValue={content}
        onChange={handleChange}
        theme={currentTheme}
        language="en-US"
        placeholder="Write your content here. Markdown is supported."
        className="flex-1 !border-none"
        toolbars={[
          "bold",
          "underline",
          "italic",
          "-",
          "title",
          "strikeThrough",
          "sub",
          "sup",
          "quote",
          "unorderedList",
          "orderedList",
          "task",
          "-",
          "codeRow",
          "code",
          "link",
          "image",
          "table",
          "mermaid",
          "katex",
          "-",
          "revoke",
          "next",
          "save",
          "=",
          "pageFullscreen",
          "fullscreen",
          "preview",
          "htmlPreview",
          "catalog",
        ]}
      />
    </div>
  );
}
