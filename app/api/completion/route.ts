import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ArxivService } from "@/utils/arxiv";
import { supabase, adminSupabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get arXiv ID from request
    const { arxivId } = await req.json();

    if (!arxivId) {
      return Response.json({ error: "Missing arXiv ID" }, { status: 400 });
    }

    // Check and use credits directly in this endpoint
    // Use adminSupabase client to bypass RLS if available
    const client = adminSupabase || supabase;
    
    // Verify user has credits available
    const { data: userData, error: fetchError } = await client
      .from("user_credits")
      .select("remaining_credits")
      .eq("user_id", session.user.id);

    if (fetchError) {
      console.error("Error checking user credits:", fetchError);
      return Response.json({ error: "Failed to check credits" }, { status: 500 });
    }

    // Ensure user has credits to use
    if (!userData || userData.length === 0 || userData[0].remaining_credits <= 0) {
      return Response.json({ error: "No credits remaining" }, { status: 403 });
    }

    // Fetch the paper abstract directly from arXiv API using the ID
    const abstract = await ArxivService.fetchPaperById(arxivId);

    if (!abstract) {
      return Response.json(
        { error: "Could not fetch paper abstract" },
        { status: 404 }
      );
    }

    // Generate simplified version
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system:
        "You are a helpful scientific paper abstract simplifier. Keep length of simplified abstracts to its original length, but dumb it down to a 5th grade reading level, as if you were explaining it to a kid.",
      prompt: `Please simplify this scientific abstract and make it easier to understand for a general audience, while preserving the key points:\n\n${abstract}`,
    });

    // Decrement credits only after successful generation
    const { error: updateError } = await client
      .from("user_credits")
      .update({ remaining_credits: userData[0].remaining_credits - 1 })
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error("Error updating user credits:", updateError);
      // Continue since we already generated the text
    }

    // Return only the simplified text - don't expose credit info in API response
    return Response.json({ text });

  } catch (error) {
    console.error("Error simplifying abstract:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}