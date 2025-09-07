'use server';
/**
 * @fileOverview A tool to generate social media posts.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateSocialMediaPostInputSchema = z.object({
  postTopic: z.string().describe('The topic or main message of the social media post.'),
  platform: z.string().describe('The social media platform (e.g., Twitter, LinkedIn, Facebook).'),
});
type AIGenerateSocialMediaPostInput = z.infer<typeof AIGenerateSocialMediaPostInputSchema>;

const AIGenerateSocialMediaPostOutputSchema = z.object({
  post: z.string().describe('The generated social media post content.'),
});
type AIGenerateSocialMediaPostOutput = z.infer<typeof AIGenerateSocialMediaPostOutputSchema>;

export async function generateSocialMediaPost(input: AIGenerateSocialMediaPostInput): Promise<AIGenerateSocialMediaPostOutput> {
  return aiSocialMediaPostGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSocialMediaPostGeneratorPrompt',
  input: {schema: AIGenerateSocialMediaPostInputSchema},
  output: {schema: AIGenerateSocialMediaPostOutputSchema},
  prompt: `You are a social media marketing expert. Create a compelling social media post for the specified platform based on the given topic.

- Tailor the tone, length, and format for the specific platform: {{{platform}}}.
- Include relevant hashtags.
- If the platform is visual (like Instagram), suggest an image concept.

Topic: {{{postTopic}}}
Platform: {{{platform}}}

Post:`,
});

const aiSocialMediaPostGeneratorFlow = ai.defineFlow(
  {
    name: 'aiSocialMediaPostGeneratorFlow',
    inputSchema: AIGenerateSocialMediaPostInputSchema,
    outputSchema: AIGenerateSocialMediaPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
