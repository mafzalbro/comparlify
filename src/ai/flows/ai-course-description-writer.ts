'use server';
/**
 * @fileOverview A tool to write compelling course descriptions.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateCourseDescriptionInputSchema = z.object({
  courseTitle: z.string().describe('The title of the course.'),
  keyTopics: z.string().describe('A list or summary of the key topics covered in the course.'),
  existingContent: z.string().optional().describe('Existing description content to continue or expand upon.'),
});
type AIGenerateCourseDescriptionInput = z.infer<typeof AIGenerateCourseDescriptionInputSchema>;

const AIGenerateCourseDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated course description in Markdown format.'),
});
type AIGenerateCourseDescriptionOutput = z.infer<typeof AIGenerateCourseDescriptionOutputSchema>;

export async function generateCourseDescription(input: AIGenerateCourseDescriptionInput): Promise<AIGenerateCourseDescriptionOutput> {
  return aiCourseDescriptionWriterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCourseDescriptionWriterPrompt',
  input: {schema: AIGenerateCourseDescriptionInputSchema},
  output: {schema: AIGenerateCourseDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in educational content.
{{#if existingContent}}
You have already started generating a course description. Continue where you left off, expanding upon the existing text based on the provided title and topics.
Do not repeat the existing content in your response.

Course Title: {{{courseTitle}}}
Key Topics: {{{keyTopics}}}
Existing Description:
{{{existingContent}}}

Continue From There:
{{else}}
Write a compelling and persuasive course description based on the provided title and key topics.

The description should:
- Start with a strong hook to grab the reader's attention.
- Clearly state who the course is for.
- Highlight the key benefits and learning outcomes.
- Use bullet points to list the key topics.
- End with a strong call to action.
- Be formatted in Markdown.

Course Title: {{{courseTitle}}}
Key Topics: {{{keyTopics}}}

Course Description:
{{/if}}
`,
});

const aiCourseDescriptionWriterFlow = ai.defineFlow(
  {
    name: 'aiCourseDescriptionWriterFlow',
    inputSchema: AIGenerateCourseDescriptionInputSchema,
    outputSchema: AIGenerateCourseDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    const finalDescription = input.existingContent ? `${input.existingContent}\n${output!.description}` : output!.description;
    return { description: finalDescription };
  }
);
