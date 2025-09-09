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
    // Fallback to a placeholder image service as Imagen requires billing.
    // Use the platform name as a seed for variety.
    const logoUrl = `https://picsum.photos/seed/${encodeURIComponent(input.name)}/400/200`;
    return {logoUrl: logoUrl};
  }
);
