"use server";

import { redactContent } from "@/ai/flows/redact";
import { run } from "@genkit-ai/next/server";

export async function runRedactContent(content: string) {
  return await run(redactContent, { content });
}
