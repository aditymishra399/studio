
"use server";

import { redact } from "@/ai/flows/redact";

export async function runRedactContent(content: string) {
  return await redact({ content });
}
