'use server';
/**
 * @fileOverview An AI writing assistant that suggests alternative phrasings for selected text.
 *
 * - aiTextRephrasing - A function that rephrases the input text.
 * - AiTextRephrasingInput - The input type for the aiTextRephrasing function.
 * - AiTextRephrasingOutput - The return type for the aiTextRephrasing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTextRephrasingInputSchema = z.object({
  selectedText: z.string().describe('The sentence or paragraph to be rephrased.'),
});
export type AiTextRephrasingInput = z.infer<typeof AiTextRephrasingInputSchema>;

const AiTextRephrasingOutputSchema = z.array(z.string()).describe('An array of suggested alternative phrasings.');
export type AiTextRephrasingOutput = z.infer<typeof AiTextRephrasingOutputSchema>;

const rephrasingPrompt = ai.definePrompt({
  name: 'rephrasingPrompt',
  input: {schema: AiTextRephrasingInputSchema},
  output: {schema: AiTextRephrasingOutputSchema},
  prompt: `You are an AI writing assistant. Your task is to rephrase the given text to improve its clarity, tone, or style. Provide several distinct alternative phrasings as a JSON array of strings.

Text to rephrase: """{{{selectedText}}}"""`,
});

const aiTextRephrasingFlow = ai.defineFlow(
  {
    name: 'aiTextRephrasingFlow',
    inputSchema: AiTextRephrasingInputSchema,
    outputSchema: AiTextRephrasingOutputSchema,
  },
  async (input) => {
    const {output} = await rephrasingPrompt(input);
    if (!output) {
      throw new Error('No output received from the rephrasing prompt.');
    }
    return output;
  }
);

export async function aiTextRephrasing(input: AiTextRephrasingInput): Promise<AiTextRephrasingOutput> {
  return aiTextRephrasingFlow(input);
}
