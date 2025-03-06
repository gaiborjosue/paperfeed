import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ArxivService } from "@/utils/arxiv";

export async function POST(req: Request) {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    
    // Get arXiv ID from request
    const { arxivId } = await req.json();
    
    if (!arxivId) {
      return Response.json({ error: "Missing arXiv ID" }, { status: 400 });
    }
    
    // Fetch the paper abstract directly from arXiv API using the ID
    const abstract = await ArxivService.fetchPaperById(arxivId);
    
    if (!abstract) {
      return Response.json({ error: "Could not fetch paper abstract" }, { status: 404 });
    }
    
    // Generate simplified version
    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: 'You are a helpful scientific paper abstract simplifier. Keep length of simplified abstracts to its original length, but dumb it down to a 5th grade reading level, as if you were explaining it to a kid.',
      prompt: `Please simplify this scientific abstract and make it easier to understand for a general audience, while preserving the key points:\n\n${abstract}`,
    });
    
    return Response.json({ text });
  } catch (error) {
    console.error('Error simplifying abstract:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}