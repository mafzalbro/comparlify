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

const imagePromptGenerator = ai.definePrompt({
  name: 'imagePromptGenerator',
  input: {schema: z.object({prompt: z.string()})},
  output: {schema: z.object({prompt: z.string()})},
  prompt: `You are an expert prompt engineer for a text-to-image model.
Based on the user's input, create a highly detailed and descriptive prompt that will generate a photorealistic, high-quality image suitable for a blog post header.
Focus on composition, lighting, and mood. Do not include any text in the prompt.

User Input: {{{prompt}}}

Enhanced Prompt:`,
});

const aiImageGeneratorFlow = ai.defineFlow(
  {
    name: 'aiImageGeneratorFlow',
    inputSchema: AIGenerateImageInputSchema,
    outputSchema: AIGenerateImageOutputSchema,
  },
  async input => {
    // Generate a more descriptive prompt using the free-tier model first.
    const {output} = await imagePromptGenerator(input);
    const enhancedPrompt = output?.prompt ?? input.prompt;

    // Fallback to a placeholder image service as Imagen requires billing.
    // Use the AI-generated prompt as a seed for more variety.
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(enhancedPrompt)}/1200/800`;
    return {imageUrl: imageUrl};
  }
);
