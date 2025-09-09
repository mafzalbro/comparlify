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
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `photorealistic image, blog post header, professional photography, ${input.prompt}`,
    });
    
    if (!media.url) {
        throw new Error('Image generation failed to return a data URI.');
    }

    return {imageUrl: media.url};
  }
);
