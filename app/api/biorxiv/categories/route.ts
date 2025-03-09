import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/utils/supabase';

export async function GET(req: NextRequest) {
  try {
    if (!adminSupabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await adminSupabase
      .from('categories-biorxiv')
      .select('category, display_name')
      .order('display_name');
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      categories: data.map(item => ({
        value: item.category, // The underscore format used in API calls
        label: item.display_name || item.category.replace(/_/g, ' ') // Human-readable format
      })),
      errors: []
    });
  } catch (error) {
    console.error('Error fetching bioRxiv categories:', error);
    return NextResponse.json({
      categories: [],
      errors: [(error as any).message]
    }, { status: 500 });
  }
}