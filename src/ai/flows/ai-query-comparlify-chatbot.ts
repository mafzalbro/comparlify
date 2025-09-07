'use server';
/**
 * @fileOverview An AI chatbot for Comparlify that answers user queries and provides personalized recommendations.
 *
 * - aiQueryComparlifyChatbot - A function that handles the chatbot interaction.
 * - AIQueryComparlifyChatbotInput - The input type for the aiQueryComparlifyChatbot function.
 * - AIQueryComparlifyChatbotOutput - The return type for the aiQueryComparlifyChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIQueryComparlifyChatbotInputSchema = z.object({
  query: z.string().describe('The user query about Comparlify.'),
});
export type AIQueryComparlifyChatbotInput = z.infer<typeof AIQueryComparlifyChatbotInputSchema>;

const AIQueryComparlifyChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type AIQueryComparlifyChatbotOutput = z.infer<typeof AIQueryComparlifyChatbotOutputSchema>;

export async function aiQueryComparlifyChatbot(input: AIQueryComparlifyChatbotInput): Promise<AIQueryComparlifyChatbotOutput> {
  return aiQueryComparlifyChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiQueryComparlifyChatbotPrompt',
  input: {schema: AIQueryComparlifyChatbotInputSchema},
  output: {schema: AIQueryComparlifyChatbotOutputSchema},
  prompt: `You are a chatbot designed to answer questions about Comparlify, a platform that helps course creators.

  Your goal is to provide helpful and informative responses to user queries about Comparlify's features, benefits, and services.
  Use your knowledge of Comparlify to provide personalized recommendations and guide users towards the best solutions for their needs.

  User Query: {{{query}}}`,
});

const aiQueryComparlifyChatbotFlow = ai.defineFlow(
  {
    name: 'aiQueryComparlifyChatbotFlow',
    inputSchema: AIQueryComparlifyChatbotInputSchema,
    outputSchema: AIQueryComparlifyChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
