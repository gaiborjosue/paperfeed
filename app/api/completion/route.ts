import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: 'You are a helpful scientific paper abstract simplifier. Keep length of simplified abstracts to its original lentgh, but dumb it down to a 5th grade reading level, as if you were explaining it to a kid.',
    prompt,
  });

  return Response.json({ text });
}