import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/utils/supabase';

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await adminSupabase
      .from('categories-medrxiv')
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
    console.error('Error fetching medRxiv categories:', error);
    return NextResponse.json({
      categories: [],
      errors: [(error as any).message]
    }, { status: 500 });
  }
}