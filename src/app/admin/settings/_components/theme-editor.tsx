"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateContentAction } from "@/app/actions/content";
import { type SiteContent } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "@/components/submit-button";
import { ColorInput } from "./color-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ThemeEditorProps {
  themeContent: SiteContent[];
  onFormSuccess?: () => void;
}

const themeStructure = [
  { mode: "light", name: "Primary", key: "theme.light.primary" },
  {
    mode: "light",
    name: "Primary Foreground",
    key: "theme.light.primary-foreground",
  },
  { mode: "light", name: "Secondary", key: "theme.light.secondary" },
  { mode: "light", name: "Accent", key: "theme.light.accent" },
  { mode: "light", name: "Background", key: "theme.light.background" },
  { mode: "light", name: "Foreground", key: "theme.light.foreground" },
  { mode: "light", name: "Card", key: "theme.light.card" },
  { mode: "light", name: "Border", key: "theme.light.border" },
  { mode: "light", name: "Input", key: "theme.light.input" },
  { mode: "light", name: "Destructive", key: "theme.light.destructive" },
  { mode: "dark", name: "Primary", key: "theme.dark.primary" },
  {
    mode: "dark",
    name: "Primary Foreground",
    key: "theme.dark.primary-foreground",
  },
  { mode: "dark", name: "Secondary", key: "theme.dark.secondary" },
  { mode: "dark", name: "Accent", key: "theme.dark.accent" },
  { mode: "dark", name: "Background", key: "theme.dark.background" },
  { mode: "dark", name: "Foreground", key: "theme.dark.foreground" },
  { mode: "dark", name: "Card", key: "theme.dark.card" },
  { mode: "dark", name: "Border", key: "theme.dark.border" },
  { mode: "dark", name: "Input", key: "theme.dark.input" },
  { mode: "dark", name: "Destructive", key: "theme.dark.destructive" },
];

const defaultThemeValues: Record<string, string> = {
  "theme.light.background": "48 100% 98%",
  "theme.light.foreground": "35 33% 20%",
  "theme.light.card": "48 100% 98%",
  "theme.light.card-foreground": "35 33% 20%",
  "theme.light.popover": "48 100% 98%",
  "theme.light.popover-foreground": "35 33% 20%",
  "theme.light.primary": "45 93% 58%",
  "theme.light.primary-foreground": "35 33% 15%",
  "theme.light.secondary": "48 95% 91%",
  "theme.light.secondary-foreground": "35 33% 20%",
  "theme.light.muted": "48 95% 94%",
  "theme.light.muted-foreground": "35 33% 45%",
  "theme.light.accent": "45 93% 85%",
  "theme.light.accent-foreground": "35 33% 15%",
  "theme.light.destructive": "0 84.2% 60.2%",
  "theme.light.destructive-foreground": "0 0% 98%",
  "theme.light.border": "45 80% 92%",
  "theme.light.input": "45 80% 92%",
  "theme.light.ring": "45 93% 58%",
  "theme.dark.background": "30 10% 10%",
  "theme.dark.foreground": "45 60% 95%",
  "theme.dark.card": "30 10% 12%",
  "theme.dark.card-foreground": "45 60% 95%",
  "theme.dark.popover": "30 10% 10%",
  "theme.dark.popover-foreground": "45 60% 95%",
  "theme.dark.primary": "45 93% 58%",
  "theme.dark.primary-foreground": "35 33% 15%",
  "theme.dark.secondary": "30 10% 18%",
  "theme.dark.secondary-foreground": "45 60% 95%",
  "theme.dark.muted": "30 10% 18%",
  "theme.dark.muted-foreground": "45 60% 75%",
  "theme.dark.accent": "30 10% 22%",
  "theme.dark.accent-foreground": "45 60% 95%",
  "theme.dark.destructive": "0 62.8% 30.6%",
  "theme.dark.destructive-foreground": "0 0% 98%",
  "theme.dark.border": "30 10% 25%",
  "theme.dark.input": "30 10% 25%",
  "theme.dark.ring": "45 93% 58%",
};

export function ThemeEditor({ themeContent, onFormSuccess }: ThemeEditorProps) {
  const [state, formAction] = useActionState(updateContentAction, {
    error: null,
    success: false,
  });
  const { toast } = useToast();
  const successShownRef = useRef(false);

  const [themeValues, setThemeValues] = useState<Record<string, string>>(() => {
    return themeContent.reduce(
      (acc, item) => {
        acc[item.key] = item.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  });

  useEffect(() => {
    if (state.success && !successShownRef.current) {
      toast({ title: "Success!", description: "Theme updated successfully." });
      onFormSuccess?.();
      successShownRef.current = true;
    } else if (state.error) {
      toast({
        title: "Error",
        description: state.error.toString(),
        variant: "destructive",
      });
      successShownRef.current = false; // Reset on error
    } else if (!state.success && !state.error) {
      successShownRef.current = false;
    }
  }, [state, toast, onFormSuccess]);

  const handleColorChange = (key: string, value: string) => {
    setThemeValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setThemeValues(defaultThemeValues);
    toast({
      title: "Theme Reset",
      description:
        'Colors have been reset to default. Click "Save Theme" to apply.',
    });
  };

  const lightThemeItems = themeStructure.filter(
    (item) => item.mode === "light",
  );
  const darkThemeItems = themeStructure.filter((item) => item.mode === "dark");

  return (
    <form action={formAction}>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Light Mode</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {lightThemeItems.map((item) => (
              <div key={item.key} className="space-y-1">
                <Label htmlFor={item.key}>{item.name}</Label>
                <ColorInput
                  id={item.key}
                  name={item.key}
                  value={themeValues[item.key] || ""}
                  onChange={(value) => handleColorChange(item.key, value)}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Dark Mode</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {darkThemeItems.map((item) => (
              <div key={item.key} className="space-y-1">
                <Label htmlFor={item.key}>{item.name}</Label>
                <ColorInput
                  id={item.key}
                  name={item.key}
                  value={themeValues[item.key] || ""}
                  onChange={(value) => handleColorChange(item.key, value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Theme
        </Button>
        <SubmitButton isEditing={true} editingText="Save Theme" />
      </div>
    </form>
  );
}
