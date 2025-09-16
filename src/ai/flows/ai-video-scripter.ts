'use server';

/**
 * @fileOverview A tool to generate a video script for a course lesson.
 *
 * - generateVideoScript - A function that generates a video script.
 * - AIGenerateVideoScriptInput - The input type for the generateVideoScript function.
 * - AIGenerateVideoScriptOutput - The return type for the generateVideoScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateVideoScriptInputSchema = z.object({
  lessonTopic: z
    .string()
    .describe('The specific topic of the video lesson.'),
  videoDuration: z
    .number()
    .describe('The desired duration of the video in minutes.'),
  existingContent: z.string().optional().describe('An existing script to continue generating from.'),
});
export type AIGenerateVideoScriptInput = z.infer<typeof AIGenerateVideoScriptInputSchema>;

const AIGenerateVideoScriptOutputSchema = z.object({
  videoScript: z.string().describe('The generated video script in Markdown format, including cues for tone and visuals.'),
});
type AIGenerateVideoScriptOutput = z.infer<typeof AIGenerateVideoScriptOutputSchema>;

export async function generateVideoScript(input: AIGenerateVideoScriptInput): Promise<AIGenerateVideoScriptOutput> {
  return aiVideoScripterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiVideoScripterPrompt',
  input: {schema: AIGenerateVideoScriptInputSchema},
  output: {schema: AIGenerateVideoScriptOutputSchema},
  prompt: `You are an expert scriptwriter who specializes in creating engaging educational video content.
{{#if existingContent}}
You have already started writing a script. Your task is to continue generating the script from where the existing content ends.
Do not repeat the existing script in your response. Ensure a natural transition.

Lesson Topic: {{{lessonTopic}}}
Desired Total Duration: {{{videoDuration}}} minutes

Existing Script:
{{{existingContent}}}

Continue writing the script from here:
{{else}}
Based on the provided lesson topic and desired duration, write a complete, word-for-word video script.

The script should be formatted in Markdown and include the following elements:
- A clear, engaging hook at the beginning.
- The main content, broken down into logical sections.
- Cues for the presenter's tone (e.g., "[enthusiastically]", "[thoughtfully]").
- Suggestions for on-screen visuals (e.g., "[Show B-roll of...]", "[Text on screen: ...]").
- A clear summary and call to action at the end.
- The total word count should be appropriate for the desired video duration, assuming a speaking rate of about 150 words per minute.

Lesson Topic: {{{lessonTopic}}}
Desired Duration: {{{videoDuration}}} minutes

Script:
{{/if}}
`,
});

const aiVideoScripterFlow = ai.defineFlow(
  {
    name: 'aiVideoScripterFlow',
    inputSchema: AIGenerateVideoScriptInputSchema,
    outputSchema: AIGenerateVideoScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate video script from prompt.');
    }
    const finalScript = input.existingContent ? `${input.existingContent}\n${output.videoScript}` : output.videoScript;
    return { videoScript: finalScript };
  }
);
