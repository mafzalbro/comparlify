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

Format the entire output in Markdown. 
For each question:
- Use a Level 3 Markdown heading (###) for the question itself.
- Provide 4 possible answers (A, B, C, D) as a numbered list.
- After the options, clearly state the correct answer on a new line, like this: **Correct Answer:** C

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
