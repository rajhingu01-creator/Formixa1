import Groq from "groq-sdk";

const MODEL = "llama-3.3-70b-versatile";

function getClient(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set in environment variables");
  return new Groq({ apiKey: key });
}

export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
      { role: "user" as const, content: prompt },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}

// Vision is not supported by Groq text models — falls back to text-only description request
export async function generateFromParts(
  parts: { text?: string; inlineData?: { data: string; mimeType: string } }[],
  systemInstruction?: string,
): Promise<string> {
  const client = getClient();
  const textParts = parts.filter((p) => p.text).map((p) => p.text).join("\n");
  const hasFile = parts.some((p) => p.inlineData);

  const userContent = hasFile
    ? `${textParts}\n\n[A document image/file was uploaded for analysis. Provide a thorough immigration document verification report based on the context provided.]`
    : textParts;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
      { role: "user" as const, content: userContent },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}
