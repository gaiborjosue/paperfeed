import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase, adminSupabase } from "@/utils/supabase";
import { NextResponse } from "next/server";

const MAX_CREDITS = 5;

// Get user credits
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Use adminSupabase client to bypass RLS if available
    const client = adminSupabase || supabase;
    
    // Check if user exists in credits table - don't use single() to avoid PGRST116 error
    const { data, error } = await client
      .from('user_credits')
      .select('remaining_credits')
      .eq('user_id', session.user.id);
    
    if (error) {
      throw error;
    }
    
    // If user doesn't have a record yet, create one with max credits
    if (!data || data.length === 0) {
      const { data: newRecord, error: insertError } = await client
        .from('user_credits')
        .insert([
          { user_id: session.user.id, remaining_credits: MAX_CREDITS }
        ])
        .select();
      
      if (insertError) throw insertError;
      
      return NextResponse.json({ credits: newRecord[0].remaining_credits });
    }
    
    // Use the first record if multiple exist
    return NextResponse.json({ credits: data[0].remaining_credits });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
  }
}

// Use a credit (decrement)
export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Use adminSupabase client to bypass RLS if available
    const client = adminSupabase || supabase;
    
    // Check if user has credits - don't use single() to avoid PGRST116 error
    const { data: userData, error: fetchError } = await client
      .from('user_credits')
      .select('remaining_credits')
      .eq('user_id', session.user.id);
    
    if (fetchError) throw fetchError;
    
    // Ensure user has credits to use
    if (!userData || userData.length === 0 || userData[0].remaining_credits <= 0) {
      return NextResponse.json({ error: "No credits remaining" }, { status: 403 });
    }
    
    // Decrement credits
    const { data, error } = await client
      .from('user_credits')
      .update({ remaining_credits: userData[0].remaining_credits - 1 })
      .eq('user_id', session.user.id)
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ credits: data[0].remaining_credits });
  } catch (error) {
    console.error('Error using credit:', error);
    return NextResponse.json({ error: "Failed to use credit" }, { status: 500 });
  }
}