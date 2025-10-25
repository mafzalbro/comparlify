
import { getContent } from "@/lib/content";

export const revalidate = 0; // Don't cache this page

export async function GET() {
  const content = await getContent();

  const lightTheme = {
    primary: content['theme.light.primary'] || '45 93% 58%',
    secondary: content['theme.light.secondary'] || '48 95% 91%',
    accent: content['theme.light.accent'] || '45 93% 85%',
    background: content['theme.light.background'] || '48 100% 98%',
    foreground: content['theme.light.foreground'] || '35 33% 20%',
  };

  const darkTheme = {
    primary: content['theme.dark.primary'] || '45 93% 58%',
    secondary: content['theme.dark.secondary'] || '30 10% 18%',
    accent: content['theme.dark.accent'] || '30 10% 22%',
    background: content['theme.dark.background'] || '30 10% 10%',
    foreground: content['theme.dark.foreground'] || '45 60% 95%',
  };
  
  // NOTE: Other values like card, popover, destructive, border, etc. are omitted
  // to keep the admin UI simple. They can be added if more fine-grained control is needed.

  const css = `
    @layer base {
      :root {
        --background: ${lightTheme.background};
        --foreground: ${lightTheme.foreground};
        --card: ${lightTheme.background};
        --card-foreground: ${lightTheme.foreground};
        --popover: ${lightTheme.background};
        --popover-foreground: ${lightTheme.foreground};
        --primary: ${lightTheme.primary};
        --primary-foreground: 35 33% 15%;
        --secondary: ${lightTheme.secondary};
        --secondary-foreground: ${lightTheme.foreground};
        --muted: ${lightTheme.secondary};
        --muted-foreground: 35 33% 45%;
        --accent: ${lightTheme.accent};
        --accent-foreground: 35 33% 15%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 0 0% 98%;
        --border: ${lightTheme.secondary};
        --input: ${lightTheme.secondary};
        --ring: ${lightTheme.primary};
        --radius: 0.8rem;
        --chart-1: ${lightTheme.primary};
        --chart-2: 35 93% 68%;
        --chart-3: 25 85% 62%;
        --chart-4: 43 74% 66%;
        --chart-5: 27 87% 67%;
      }

      .dark {
        --background: ${darkTheme.background};
        --foreground: ${darkTheme.foreground};
        --card: ${darkTheme.background};
        --card-foreground: ${darkTheme.foreground};
        --popover: ${darkTheme.background};
        --popover-foreground: ${darkTheme.foreground};
        --primary: ${darkTheme.primary};
        --primary-foreground: 35 33% 15%;
        --secondary: ${darkTheme.secondary};
        --secondary-foreground: ${darkTheme.foreground};
        --muted: ${darkTheme.secondary};
        --muted-foreground: 45 60% 75%;
        --accent: ${darkTheme.accent};
        --accent-foreground: ${darkTheme.foreground};
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 0 0% 98%;
        --border: ${darkTheme.secondary};
        --input: ${darkTheme.secondary};
        --ring: ${darkTheme.primary};
        --radius: 1rem;
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
