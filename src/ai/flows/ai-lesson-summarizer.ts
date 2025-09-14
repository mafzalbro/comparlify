'use server';
/**
 * @fileOverview A tool to generate a summary for a lesson.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateLessonSummaryInputSchema = z.object({
  lessonContent: z
    .string()
    .describe('The full text content of the lesson.'),
  existingContent: z.string().optional().describe('Existing summary to continue or expand upon.'),
});
type AIGenerateLessonSummaryInput = z.infer<typeof AIGenerateLessonSummaryInputSchema>;

const AIGenerateLessonSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the lesson in Markdown format.'),
});
type AIGenerateLessonSummaryOutput = z.infer<typeof AIGenerateLessonSummaryOutputSchema>;

export async function generateLessonSummary(input: AIGenerateLessonSummaryInput): Promise<AIGenerateLessonSummaryOutput> {
  return aiLessonSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiLessonSummarizerPrompt',
  input: {schema: AIGenerateLessonSummaryInputSchema},
  output: {schema: AIGenerateLessonSummaryOutputSchema},
  prompt: `You are an expert at distilling information.
{{#if existingContent}}
You have already started generating a summary. Continue where you left off, expanding upon the existing text.
Do not repeat the existing content in your response.

Existing Summary:
{{{existingContent}}}

Continue From There:
{{else}}
Based on the provided lesson content, create a concise summary.

The summary should:
- Be a short paragraph.
- Identify the 3-5 most important key takeaways.
- Be formatted in Markdown, with the key takeaways as a bulleted list.

Lesson Content: {{{lessonContent}}}

Summary:
{{/if}}
`,
});

const aiLessonSummarizerFlow = ai.defineFlow(
  {
    name: 'aiLessonSummarizerFlow',
    inputSchema: AIGenerateLessonSummaryInputSchema,
    outputSchema: AIGenerateLessonSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    const finalSummary = input.existingContent ? `${input.existingContent}\n${output!.summary}` : output!.summary;
    return { summary: finalSummary };
  }
);
