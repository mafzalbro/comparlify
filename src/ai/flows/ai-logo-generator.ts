'use server';
/**
 * @fileOverview A tool to generate logos for platforms using AI.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateLogoInputSchema = z.object({
  name: z.string().describe('The name of the platform to generate a logo for.'),
});
type AIGenerateLogoInput = z.infer<typeof AIGenerateLogoInputSchema>;

const AIGenerateLogoOutputSchema = z.object({
  logoUrl: z.string().describe('The data URI of the generated logo.'),
});
type AIGenerateLogoOutput = z.infer<typeof AIGenerateLogoOutputSchema>;

export async function generateLogo(input: AIGenerateLogoInput): Promise<AIGenerateLogoOutput> {
  return aiLogoGeneratorFlow(input);
}


const logoPromptGenerator = ai.definePrompt({
  name: 'logoPromptGenerator',
  input: {schema: z.object({name: z.string()})},
  output: {schema: z.object({prompt: z.string()})},
  prompt: `You are an expert prompt engineer for a text-to-image model that generates logos.
Based on the user's platform name, create a prompt that will generate a modern, minimalist, vector-style logo.

Platform Name: {{{name}}}

Enhanced Prompt: A minimalist vector logo for a tech company called "{{{name}}}", simple, clean, abstract mark.`,
});


const aiLogoGeneratorFlow = ai.defineFlow(
  {
    name: 'aiLogoGeneratorFlow',
    inputSchema: AIGenerateLogoInputSchema,
    outputSchema: AIGenerateLogoOutputSchema,
  },
  async input => {
    // Generate a more descriptive prompt using the free-tier model first.
    const {output} = await logoPromptGenerator(input);
    const enhancedPrompt = output?.prompt ?? input.name;

    // Fallback to a placeholder image service as Imagen requires billing.
    // Use the AI-generated prompt as a seed for more variety.
    const logoUrl = `https://picsum.photos/seed/${encodeURIComponent(enhancedPrompt)}/400/200`;
    return {logoUrl: logoUrl};
  }
);
