import { defineFlow, run } from "genkit";
import { z } from "zod";
import { ai } from "../genkit";

const redactInputSchema = z.object({
  content: z.string(),
});

const redactOutputSchema = z.object({
  redactedContent: z.string(),
  sensitiveTerms: z.array(z.string()),
});

export const redactContent = defineFlow(
  {
    name: "redactContent",
    inputSchema: redactInputSchema,
    outputSchema: redactOutputSchema,
  },
  async ({ content }) => {
    if (!content.trim()) {
      return { redactedContent: "", sensitiveTerms: [] };
    }

    const llmResponse = await run("extract-sensitive-info", async () => {
      const prompt = `
        Analyze the following text for sensitive information like phone numbers, email addresses, social security numbers, and credit card numbers.
        Respond with a JSON object with two keys:
        1. "sensitiveTerms": an array of strings, where each string is a piece of sensitive information you found.
        2. "redactedContent": the original text, but with each sensitive term replaced by the string "[REDACTED]".

        If no sensitive information is found, return an empty array for "sensitiveTerms" and the original text for "redactedContent".

        Text to analyze:
        "${content}"
      `;

      return await ai.generate({
        prompt,
        model: "googleai/gemini-2.0-flash",
        config: {
          temperature: 0.1,
        },
        output: {
          format: "json",
          schema: redactOutputSchema,
        },
      });
    });

    return llmResponse.output() || { redactedContent: content, sensitiveTerms: [] };
  }
);
