'use server';
/**
 * @fileOverview A tool to generate a detailed audience persona.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateAudiencePersonaInputSchema = z.object({
  courseIdea: z
    .string()
    .describe('A description of the course idea or topic.'),
});
type AIGenerateAudiencePersonaInput = z.infer<typeof AIGenerateAudiencePersonaInputSchema>;

const AIGenerateAudiencePersonaOutputSchema = z.object({
  persona: z.string().describe('The generated audience persona in Markdown format.'),
});
type AIGenerateAudiencePersonaOutput = z.infer<typeof AIGenerateAudiencePersonaOutputSchema>;

export async function generateAudiencePersona(input: AIGenerateAudiencePersonaInput): Promise<AIGenerateAudiencePersonaOutput> {
  return aiAudiencePersonaGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAudiencePersonaGeneratorPrompt',
  input: {schema: AIGenerateAudiencePersonaInputSchema},
  output: {schema: AIGenerateAudiencePersonaOutputSchema},
  prompt: `You are an expert market researcher and strategist. Based on the provided course idea, create a detailed audience persona for the ideal student.

The persona should be formatted in Markdown and include:
- A name and photo suggestion (e.g., "[Photo of a curious young professional in a cafe]").
- Demographics (Age, Occupation, Education).
- Goals (What do they want to achieve?).
- Pain Points (What challenges are they facing?).
- Watering Holes (Where do they hang out online? e.g., blogs, forums, social media).
- A brief narrative summary.

Course Idea: {{{courseIdea}}}

Persona:`,
});

const aiAudiencePersonaGeneratorFlow = ai.defineFlow(
  {
    name: 'aiAudiencePersonaGeneratorFlow',
    inputSchema: AIGenerateAudiencePersonaInputSchema,
    outputSchema: AIGenerateAudiencePersonaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
