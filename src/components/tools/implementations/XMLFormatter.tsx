"use client";

import React, { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function XMLFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatXML = (xml: string, spacing: string) => {
    let formatted = "";
    // Regex matching XML tags or text nodes
    let reg = /(<\/?[a-zA-Z0-9-:]+(?:\s+[a-zA-Z0-9-:]+(?:=(?:"[^"]*"|'[^']*'|[^>\s]+))?)*\s*\/?>)|([^<]+)/g;
    let pad = 0;
    const tabString = spacing === "tab" ? "\t" : " ".repeat(parseInt(spacing, 10));

    let match;
    while ((match = reg.exec(xml)) !== null) {
      const tag = match[1];
      const text = match[2];

      if (tag) {
        if (tag.endsWith("/>") || tag.startsWith("<!") || tag.startsWith("<?")) {
          formatted += tabString.repeat(pad) + tag + "\n";
        } else if (tag.startsWith("</")) {
          pad = Math.max(0, pad - 1);
          formatted += tabString.repeat(pad) + tag + "\n";
        } else {
          formatted += tabString.repeat(pad) + tag + "\n";
          pad++;
        }
      } else if (text && text.trim()) {
        formatted += tabString.repeat(pad) + text.trim() + "\n";
      }
    }
    return formatted.trim();
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const formatted = formatXML(input.trim(), indent);
    setOutput(formatted);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Beautified XML copied.",
    });
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground">
              Raw XML Input
            </label>
            <div className="flex items-center gap-3">
              <select
                value={indent}
                onChange={(e) => setIndent(e.target.value)}
                className="text-xs bg-secondary border border-border/40 px-2 py-1 rounded-md focus:outline-none"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tab">Tabs</option>
              </select>
              <button
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 font-bold"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='<user><id>1</id><name>Bob</name><skills><skill>JS</skill></skills></user>'
            className="w-full h-80 p-4 rounded-xl border border-border/30 bg-secondary/20 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
          />
          <button
            onClick={handleFormat}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Format XML
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-7">
            <label className="text-sm font-bold text-foreground">
              Formatted XML Output
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                title="Copy XML"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted XML will appear here..."
            className="w-full h-80 p-4 rounded-xl border border-border/30 bg-secondary/30 font-mono text-xs text-foreground focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
