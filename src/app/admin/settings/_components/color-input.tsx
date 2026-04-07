"use client";

import { useEffect, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { themeConfig } from "@/lib/theme";

interface ColorInputProps extends React.ComponentProps<"input"> {
  value: string;
  onChange: (value: string | any) => void;
  name: string;
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${(h * 360).toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%`;
}

function parseHsl(hsl: string): { h: number; s: number; l: number } | null {
  const match = hsl.match(/(\d+(\.\d+)?)\s(\d+(\.\d+)?)%\s(\d+(\.\d+)?)%/);
  if (!match) return null;
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[3]),
    l: parseFloat(match[5]),
  };
}

export function ColorInput({
  value,
  onChange,
  name,
  ...props
}: ColorInputProps) {
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Live update CSS variable for instant preview
    const cssVarName = themeConfig[name];
    if (cssVarName) {
      const root = document.documentElement;

      // Check if the current theme matches the color being edited
      const isDarkThemeVar = name.startsWith("theme.dark");
      const isLightThemeVar = name.startsWith("theme.light");

      if (
        (resolvedTheme === "dark" && isDarkThemeVar) ||
        (resolvedTheme === "light" && isLightThemeVar)
      ) {
        root.style.setProperty(cssVarName, value);
      }
    }
  }, [value, name, resolvedTheme]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const hsl = hexToHsl(hex);
    if (hsl) {
      onChange(hsl);
    }
  };

  const hexColor = useMemo(() => {
    const hsl = parseHsl(value);
    return hsl ? hslToHex(hsl.h, hsl.s, hsl.l) : "#000000";
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-10 w-10 shrink-0">
        <input
          ref={colorPickerRef}
          type="color"
          value={hexColor}
          onChange={handleColorPickerChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          tabIndex={-1}
        />
        <div
          className="h-10 w-10 cursor-pointer rounded-md border"
          style={{ backgroundColor: `hsl(${value})` }}
          onClick={() => colorPickerRef.current?.click()}
        />
      </div>
      <Input
        {...props}
        name={name}
        value={value}
        onChange={handleTextChange}
        className="font-mono text-sm"
      />
    </div>
  );
}
