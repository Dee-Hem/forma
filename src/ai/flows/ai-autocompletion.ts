'use server';
/**
 * @fileOverview This file implements a Genkit flow for providing AI-powered context-aware autocompletion suggestions.
 *
 * - aiAutocompletion - A function that handles the autocompletion process.
 * - AiAutocompletionInput - The input type for the aiAutocompletion function.
 * - AiAutocompletionOutput - The return type for the aiAutocompletion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiAutocompletionInputSchema = z.object({
  editorContent: z.string().describe('The entire content of the editor.'),
  currentCursorContext: z.string().optional().describe('A small snippet of text around the cursor for more precise context.'),
});
export type AiAutocompletionInput = z.infer<typeof AiAutocompletionInputSchema>;

const AiAutocompletionOutputSchema = z.array(z.string()).describe('A list of context-aware word or phrase suggestions.');
export type AiAutocompletionOutput = z.infer<typeof AiAutocompletionOutputSchema>;

export async function aiAutocompletion(input: AiAutocompletionInput): Promise<AiAutocompletionOutput> {
  return aiAutocompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAutocompletionPrompt',
  input: { schema: AiAutocompletionInputSchema },
  output: { schema: AiAutocompletionOutputSchema },
  prompt: `You are an AI writing assistant. Based on the following text, provide 3-5 context-aware word or phrase suggestions to help the user complete their thought or sentence. Respond with a JSON array of strings, where each string is a suggestion. Do not include any other text or commentary.

Text:
{{{editorContent}}}

{{#if currentCursorContext}}
Consider the immediate context around the cursor to refine suggestions:
Context: {{{currentCursorContext}}}
{{/if}}

Suggestions:`,
});

const aiAutocompletionFlow = ai.defineFlow(
  {
    name: 'aiAutocompletionFlow',
    inputSchema: AiAutocompletionInputSchema,
    outputSchema: AiAutocompletionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
