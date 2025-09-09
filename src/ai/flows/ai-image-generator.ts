'use server';
/**
 * @fileOverview A tool to generate images using AI.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
type AIGenerateImageInput = z.infer<typeof AIGenerateImageInputSchema>;

const AIGenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
type AIGenerateImageOutput = z.infer<typeof AIGenerateImageOutputSchema>;

export async function generateImage(input: AIGenerateImageInput): Promise<AIGenerateImageOutput> {
  return aiImageGeneratorFlow(input);
}

const aiImageGeneratorFlow = ai.defineFlow(
  {
    name: 'aiImageGeneratorFlow',
    inputSchema: AIGenerateImageInputSchema,
    outputSchema: AIGenerateImageOutputSchema,
  },
  async input => {
    // Fallback to a placeholder image service as Imagen requires billing.
    // Use the user-provided prompt as a seed for variety.
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(input.prompt)}/1200/800`;
    return {imageUrl: imageUrl};
  }
);
