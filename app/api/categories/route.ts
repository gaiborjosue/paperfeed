// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

type CategoryData = {
  key: string
  field: string
  description: string
}

type ErrorResponse = {
  error: string
  details?: unknown
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  try {
    let query = supabase
      .from('categories')
      .select('key, field, description')

    // If category is provided, filter by it
    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'No categories found',
        details: category ? `No results found for category: ${category}` : 'The categories table appears to be empty'
      }, { status: 404 })
    }

    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch categories',
      details: error
    }, { status: 500 })
  }
}

export const config = {
  runtime: 'edge',
}
