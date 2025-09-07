'use server';
/**
 * @fileOverview A tool to generate learning objectives for a course.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateLearningObjectivesInputSchema = z.object({
  courseTopic: z
    .string()
    .describe('The topic or a brief description of the course.'),
});
type AIGenerateLearningObjectivesInput = z.infer<typeof AIGenerateLearningObjectivesInputSchema>;

const AIGenerateLearningObjectivesOutputSchema = z.object({
  objectives: z.string().describe('The generated learning objectives in Markdown list format.'),
});
type AIGenerateLearningObjectivesOutput = z.infer<typeof AIGenerateLearningObjectivesOutputSchema>;

export async function generateLearningObjectives(input: AIGenerateLearningObjectivesInput): Promise<AIGenerateLearningObjectivesOutput> {
  return aiLearningObjectivesGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiLearningObjectivesGeneratorPrompt',
  input: {schema: AIGenerateLearningObjectivesInputSchema},
  output: {schema: AIGenerateLearningObjectivesOutputSchema},
  prompt: `You are an expert instructional designer. Based on the provided course topic, generate a list of 5-7 clear, measurable learning objectives.

The objectives should start with an action verb (e.g., "Define," "Analyze," "Create") and describe what the student will be able to do upon completion.
Format the output as a Markdown list.

Course Topic: {{{courseTopic}}}

Learning Objectives:`,
});

const aiLearningObjectivesGeneratorFlow = ai.defineFlow(
  {
    name: 'aiLearningObjectivesGeneratorFlow',
    inputSchema: AIGenerateLearningObjectivesInputSchema,
    outputSchema: AIGenerateLearningObjectivesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
