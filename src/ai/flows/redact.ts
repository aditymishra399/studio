
'use server';
/**
 * @fileOverview A content redaction AI agent.
 *
 * - redact - A function that handles the content redaction process.
 * - RedactInput - The input type for the redact function.
 * - RedactOutput - The return type for the redact function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const RedactInputSchema = z.object({
  content: z.string(),
});
export type RedactInput = z.infer<typeof RedactInputSchema>;

const RedactOutputSchema = z.object({
  redactedContent: z.string(),
  sensitiveTerms: z.array(z.string()),
});
export type RedactOutput = z.infer<typeof RedactOutputSchema>;

export async function redact(input: RedactInput): Promise<RedactOutput> {
  return redactContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'redactContentPrompt',
  input: {schema: RedactInputSchema},
  output: {schema: RedactOutputSchema},
  prompt: `
        Analyze the following text for sensitive information like phone numbers, email addresses, social security numbers, and credit card numbers.
        Respond with a JSON object with two keys:
        1. "sensitiveTerms": an array of strings, where each string is a piece of sensitive information you found.
        2. "redactedContent": the original text, but with each sensitive term replaced by the string "[REDACTED]".

        If no sensitive information is found, return an empty array for "sensitiveTerms" and the original text for "redactedContent".

        Text to analyze:
        "{{{content}}}"
      `,
  config: {
    temperature: 0.1,
  },
});

const redactContentFlow = ai.defineFlow(
  {
    name: 'redactContentFlow',
    inputSchema: RedactInputSchema,
    outputSchema: RedactOutputSchema,
  },
  async ({content}) => {
    if (!content.trim()) {
      return {redactedContent: '', sensitiveTerms: []};
    }
    const {output} = await prompt({content});
    return (
      output || {
        redactedContent: content,
        sensitiveTerms: [],
      }
    );
  },
);
