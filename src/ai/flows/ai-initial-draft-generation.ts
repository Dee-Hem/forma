'use server';
/**
 * @fileOverview A Genkit flow for generating an initial document outline or draft content in Markdown.
 *
 * - generateInitialDraft - A function that handles the AI-powered initial draft generation.
 * - InitialDraftGenerationInput - The input type for the generateInitialDraft function.
 * - InitialDraftGenerationOutput - The return type for the generateInitialDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialDraftGenerationInputSchema = z.object({
  topic: z
    .string()
    .describe('A short prompt or topic for the document to be generated.'),
});
export type InitialDraftGenerationInput = z.infer<
  typeof InitialDraftGenerationInputSchema
>;

const InitialDraftGenerationOutputSchema = z.object({
  markdownContent: z
    .string()
    .describe('The AI-generated initial document outline or draft content in Markdown format.'),
});
export type InitialDraftGenerationOutput = z.infer<
  typeof InitialDraftGenerationOutputSchema
>;

export async function generateInitialDraft(
  input: InitialDraftGenerationInput
): Promise<InitialDraftGenerationOutput> {
  return initialDraftGenerationFlow(input);
}

const initialDraftPrompt = ai.definePrompt({
  name: 'initialDraftPrompt',
  input: {schema: InitialDraftGenerationInputSchema},
  output: {schema: InitialDraftGenerationOutputSchema},
  prompt: `You are an expert technical writer and content creator.

Your task is to generate an initial document outline or draft content in Markdown format based on the provided topic.
The output should be a well-structured Markdown document, suitable as a starting point for further writing.
Focus on creating a logical flow and including relevant headings, subheadings, and placeholder content where appropriate.
Do not include any conversational text, just the Markdown output.

Topic: {{{topic}}}`,
});

const initialDraftGenerationFlow = ai.defineFlow(
  {
    name: 'initialDraftGenerationFlow',
    inputSchema: InitialDraftGenerationInputSchema,
    outputSchema: InitialDraftGenerationOutputSchema,
  },
  async (input) => {
    const {output} = await initialDraftPrompt(input);
    return output!;
  }
);
