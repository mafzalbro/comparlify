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

const aiLogoGeneratorFlow = ai.defineFlow(
  {
    name: 'aiLogoGeneratorFlow',
    inputSchema: AIGenerateLogoInputSchema,
    outputSchema: AIGenerateLogoOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `a simple, modern, iconic, flat, 2d vector logo for a company named "${input.name}". Centered on a clean, solid, white background. Minimalist design.`,
    });
    
    if (!media.url) {
        throw new Error('Logo generation failed to return a data URI.');
    }

    return {logoUrl: media.url};
  }
);
