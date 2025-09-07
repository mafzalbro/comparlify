'use server';
/**
 * @fileOverview A tool to generate a multiple-choice quiz from text.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateQuizInputSchema = z.object({
  textContent: z
    .string()
    .describe('A block of text to generate the quiz from.'),
  numQuestions: z
    .number()
    .describe('The number of questions to generate.'),
});
type AIGenerateQuizInput = z.infer<typeof AIGenerateQuizInputSchema>;

const AIGenerateQuizOutputSchema = z.object({
  quiz: z.string().describe('The generated multiple-choice quiz in Markdown format.'),
});
type AIGenerateQuizOutput = z.infer<typeof AIGenerateQuizOutputSchema>;

export async function generateQuiz(input: AIGenerateQuizInput): Promise<AIGenerateQuizOutput> {
  return aiQuizGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiQuizGeneratorPrompt',
  input: {schema: AIGenerateQuizInputSchema},
  output: {schema: AIGenerateQuizOutputSchema},
  prompt: `You are an expert educator and quiz creator. Based on the provided text content, create a multiple-choice quiz with {{{numQuestions}}} questions.

Each question should have 4 possible answers (A, B, C, D), with only one correct answer.
Indicate the correct answer for each question.
Format the entire output in Markdown. Use bold for the questions and a list for the options.

Text Content: {{{textContent}}}

Quiz:`,
});

const aiQuizGeneratorFlow = ai.defineFlow(
  {
    name: 'aiQuizGeneratorFlow',
    inputSchema: AIGenerateQuizInputSchema,
    outputSchema: AIGenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
