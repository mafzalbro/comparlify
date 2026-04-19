"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Highlighter,
  Copy,
  Check,
} from "lucide-react";

interface EditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [copied, setCopied] = useState(false);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const copyMarkdown = () => {
    const markdown = (editor.storage as any).markdown.getMarkdown();
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeClass = "bg-primary/20 text-primary";
  const getButtonClass = (isActive: boolean) =>
    `p-2 rounded-md hover:bg-muted transition-colors ${isActive ? activeClass : "text-muted-foreground"}`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/20">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive("bold"))}
        type="button"
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive("italic"))}
        type="button"
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={getButtonClass(editor.isActive("underline"))}
        type="button"
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive("strike"))}
        type="button"
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={getButtonClass(editor.isActive("heading", { level: 1 }))}
        type="button"
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getButtonClass(editor.isActive("heading", { level: 2 }))}
        type="button"
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={getButtonClass(editor.isActive("heading", { level: 3 }))}
        type="button"
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={getButtonClass(editor.isActive({ textAlign: "left" }))}
        type="button"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={getButtonClass(editor.isActive({ textAlign: "center" }))}
        type="button"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={getButtonClass(editor.isActive({ textAlign: "right" }))}
        type="button"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass(editor.isActive("bulletList"))}
        type="button"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass(editor.isActive("orderedList"))}
        type="button"
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={getButtonClass(editor.isActive("blockquote"))}
        type="button"
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={setLink}
        className={getButtonClass(editor.isActive("link"))}
        type="button"
        title="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <button
        onClick={addImage}
        className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
        type="button"
        title="Image"
      >
        <ImageIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors"
        type="button"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors"
        type="button"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={copyMarkdown}
        className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors ml-auto"
        type="button"
        title="Copy Markdown"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export function Editor({ initialContent = "", onChange }: EditorProps) {
  const [syncedContent, setSyncedContent] = useState(initialContent);
  const [isAiFilling, setIsAiFilling] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      Image,
      Highlight,
      Typography,
      Placeholder.configure({
        placeholder: "Write your content here...",
      }),
    ],

    immediatelyRender: false,
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (!isAiFilling) {
        const markdown = (editor.storage as any).markdown.getMarkdown();
        setSyncedContent(markdown);
        onChange(markdown);
      }
    },
    editorProps: {
      attributes: {
        class:
          "premium-prose focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  // Track initial content updates (from AI filling)
  useEffect(() => {
    if (editor && initialContent !== syncedContent) {
      if (initialContent) {
        setIsAiFilling(true);
        editor.commands.setContent(initialContent);
        setSyncedContent(initialContent);

        // Allow selection to remain if it was focused.
        setTimeout(() => setIsAiFilling(false), 50);
      } else if (initialContent === "" && syncedContent !== "") {
        editor.commands.clearContent();
        setSyncedContent("");
      }
    }
  }, [initialContent, editor, syncedContent]);

  if (!editor) {
    return null;
  }

  const wordCount = syncedContent.split(/\s+/).filter(Boolean).length;
  const charCount = syncedContent.length;

  return (
    <div className="w-full border rounded-xl overflow-hidden bg-background flex flex-col relative shadow-sm">
      <MenuBar editor={editor} />
      <div className="flex-1 bg-card/30">
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t text-[10px] uppercase font-black tracking-widest text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Characters: {charCount}</span>
          <span>Words: {wordCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary/60 animate-pulse text-xs">●</span>
          <span>Visual Editor Active</span>
        </div>
      </div>
    </div>
  );
}
