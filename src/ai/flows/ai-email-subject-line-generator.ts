'use server';
/**
 * @fileOverview A tool to generate email subject lines.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateEmailSubjectLinesInputSchema = z.object({
  emailContent: z
    .string()
    .describe('The body or a summary of the email content.'),
});
type AIGenerateEmailSubjectLinesInput = z.infer<typeof AIGenerateEmailSubjectLinesInputSchema>;

const AIGenerateEmailSubjectLinesOutputSchema = z.object({
  subjectLines: z.string().describe('A list of 5-10 generated email subject lines in Markdown list format.'),
});
type AIGenerateEmailSubjectLinesOutput = z.infer<typeof AIGenerateEmailSubjectLinesOutputSchema>;

export async function generateEmailSubjectLines(input: AIGenerateEmailSubjectLinesInput): Promise<AIGenerateEmailSubjectLinesOutput> {
  return aiEmailSubjectLineGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiEmailSubjectLineGeneratorPrompt',
  input: {schema: AIGenerateEmailSubjectLinesInputSchema},
  output: {schema: AIGenerateEmailSubjectLinesOutputSchema},
  prompt: `You are an expert email marketer known for writing subject lines with high open rates.
Based on the provided email content, generate a list of 5-10 compelling subject lines.

The subject lines should be varied, including some that are direct, some that are intriguing, and some that use urgency.
Format the output as a Markdown list.

Email Content: {{{emailContent}}}

Subject Lines:`,
});

const aiEmailSubjectLineGeneratorFlow = ai.defineFlow(
  {
    name: 'aiEmailSubjectLineGeneratorFlow',
    inputSchema: AIGenerateEmailSubjectLinesInputSchema,
    outputSchema: AIGenerateEmailSubjectLinesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
