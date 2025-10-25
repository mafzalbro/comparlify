
import { getContent } from "@/lib/content";

export const revalidate = 0; // Don't cache this page

export async function GET() {
  const content = await getContent();

  const lightTheme = {
    background: content['theme.light.background'] || '0 0% 100%',
    foreground: content['theme.light.foreground'] || '222.2 84% 4.9%',
    card: content['theme.light.card'] || '0 0% 100%',
    cardForeground: content['theme.light.card-foreground'] || '222.2 84% 4.9%',
    popover: content['theme.light.popover'] || '0 0% 100%',
    popoverForeground: content['theme.light.popover-foreground'] || '222.2 84% 4.9%',
    primary: content['theme.light.primary'] || '222.2 47.4% 11.2%',
    primaryForeground: content['theme.light.primary-foreground'] || '210 40% 98%',
    secondary: content['theme.light.secondary'] || '210 40% 96.1%',
    secondaryForeground: content['theme.light.secondary-foreground'] || '222.2 47.4% 11.2%',
    muted: content['theme.light.muted'] || '210 40% 96.1%',
    mutedForeground: content['theme.light.muted-foreground'] || '215.4 16.3% 46.9%',
    accent: content['theme.light.accent'] || '210 40% 96.1%',
    accentForeground: content['theme.light.accent-foreground'] || '222.2 47.4% 11.2%',
    destructive: content['theme.light.destructive'] || '0 84.2% 60.2%',
    destructiveForeground: content['theme.light.destructive-foreground'] || '210 40% 98%',
    border: content['theme.light.border'] || '214.3 31.8% 91.4%',
    input: content['theme.light.input'] || '214.3 31.8% 91.4%',
    ring: content['theme.light.ring'] || '222.2 84% 4.9%',
  };

  const darkTheme = {
    background: content['theme.dark.background'] || '222.2 84% 4.9%',
    foreground: content['theme.dark.foreground'] || '210 40% 98%',
    card: content['theme.dark.card'] || '222.2 84% 4.9%',
    cardForeground: content['theme.dark.card-foreground'] || '210 40% 98%',
    popover: content['theme.dark.popover'] || '222.2 84% 4.9%',
    popoverForeground: content['theme.dark.popover-foreground'] || '210 40% 98%',
    primary: content['theme.dark.primary'] || '210 40% 98%',
    primaryForeground: content['theme.dark.primary-foreground'] || '222.2 47.4% 11.2%',
    secondary: content['theme.dark.secondary'] || '217.2 32.6% 17.5%',
    secondaryForeground: content['theme.dark.secondary-foreground'] || '210 40% 98%',
    muted: content['theme.dark.muted'] || '217.2 32.6% 17.5%',
    mutedForeground: content['theme.dark.muted-foreground'] || '215 20.2% 65.1%',
    accent: content['theme.dark.accent'] || '217.2 32.6% 17.5%',
    accentForeground: content['theme.dark.accent-foreground'] || '210 40% 98%',
    destructive: content['theme.dark.destructive'] || '0 62.8% 30.6%',
    destructiveForeground: content['theme.dark.destructive-foreground'] || '210 40% 98%',
    border: content['theme.dark.border'] || '217.2 32.6% 17.5%',
    input: content['theme.dark.input'] || '217.2 32.6% 17.5%',
    ring: content['theme.dark.ring'] || '212.7 93.5% 58.8%',
  };

  const css = `
    @layer base {
      :root {
        --background: ${lightTheme.background};
        --foreground: ${lightTheme.foreground};
        --card: ${lightTheme.card};
        --card-foreground: ${lightTheme.cardForeground};
        --popover: ${lightTheme.popover};
        --popover-foreground: ${lightTheme.popoverForeground};
        --primary: ${lightTheme.primary};
        --primary-foreground: ${lightTheme.primaryForeground};
        --secondary: ${lightTheme.secondary};
        --secondary-foreground: ${lightTheme.secondaryForeground};
        --muted: ${lightTheme.muted};
        --muted-foreground: ${lightTheme.mutedForeground};
        --accent: ${lightTheme.accent};
        --accent-foreground: ${lightTheme.accentForeground};
        --destructive: ${lightTheme.destructive};
        --destructive-foreground: ${lightTheme.destructiveForeground};
        --border: ${lightTheme.border};
        --input: ${lightTheme.input};
        --ring: ${lightTheme.ring};
        --radius: 0.5rem;
        --chart-1: ${lightTheme.primary};
        --chart-2: 35 93% 68%;
        --chart-3: 25 85% 62%;
        --chart-4: 43 74% 66%;
        --chart-5: 27 87% 67%;
      }

      .dark {
        --background: ${darkTheme.background};
        --foreground: ${darkTheme.foreground};
        --card: ${darkTheme.card};
        --card-foreground: ${darkTheme.cardForeground};
        --popover: ${darkTheme.popover};
        --popover-foreground: ${darkTheme.popoverForeground};
        --primary: ${darkTheme.primary};
        --primary-foreground: ${darkTheme.primaryForeground};
        --secondary: ${darkTheme.secondary};
        --secondary-foreground: ${darkTheme.secondaryForeground};
        --muted: ${darkTheme.muted};
        --muted-foreground: ${darkTheme.mutedForeground};
        --accent: ${darkTheme.accent};
        --accent-foreground: ${darkTheme.accentForeground};
        --destructive: ${darkTheme.destructive};
        --destructive-foreground: ${darkTheme.destructiveForeground};
        --border: ${darkTheme.border};
        --input: ${darkTheme.input};
        --ring: ${darkTheme.ring};
      }
    }
  `;

  return new Response(css, {
    headers: {
      'Content-Type': 'text/css',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
