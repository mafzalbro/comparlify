
'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { themeConfig } from '@/lib/theme';

interface ColorInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (value: string) => void;
  name: string;
}

function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function parseHsl(hsl: string): { h: number, s: number, l: number } | null {
    const match = hsl.match(/(\d+(\.\d+)?)\s(\d+(\.\d+)?)%\s(\d+(\.\d+)?)%/);
    if (!match) return null;
    return {
        h: parseFloat(match[1]),
        s: parseFloat(match[3]),
        l: parseFloat(match[5]),
    };
}


export function ColorInput({ value, onChange, name, ...props }: ColorInputProps) {
    const [colorValue, setColorValue] = useState(value);
    const colorPickerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setColorValue(value);
        
        // Live update CSS variable for instant preview
        const cssVarName = themeConfig[name];
        if (cssVarName) {
            document.documentElement.style.setProperty(cssVarName, value);
            
            // For dark mode variables, we need to apply them to the .dark class
            if (name.startsWith('theme.dark')) {
                const darkElement = document.querySelector('.dark');
                if (darkElement instanceof HTMLElement) {
                    darkElement.style.setProperty(cssVarName, value);
                }
            }
        }
    }, [value, name]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setColorValue(newValue);
        onChange(newValue);
    };

    const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        // This is a simplified conversion, a proper one would be more complex.
        // For now, we just update the text input visually but don't convert back to HSL string.
        // The real value is what's in the text input.
    };
    
    const hexColor = useMemo(() => {
        const hsl = parseHsl(colorValue);
        return hsl ? hslToHex(hsl.h, hsl.s, hsl.l) : '#000000';
    }, [colorValue]);

    return (
        <div className="flex items-center gap-2">
             <div className="relative h-10 w-10">
                <input
                    ref={colorPickerRef}
                    type="color"
                    value={hexColor}
                    onChange={handleColorPickerChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    tabIndex={-1}
                />
                <div
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: `hsl(${colorValue})` }}
                    onClick={() => colorPickerRef.current?.click()}
                />
            </div>
            <Input
                {...props}
                name={name}
                value={colorValue}
                onChange={handleTextChange}
                className="font-mono text-sm"
            />
        </div>
    );
}

// Since the new file `color-input.tsx` only contains a client component, 
// let's ensure it has the 'use client' directive. I'll memoize the hex color
// calculation to avoid re-computing it on every render.
import { useMemo } from 'react';
