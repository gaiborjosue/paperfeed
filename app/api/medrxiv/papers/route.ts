import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';
import { Paper, SearchParams, SearchResponse } from '@/types';
import { MedrxivService } from '@/utils/medrxiv';
import { adminSupabase } from '@/utils/supabase';

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
  try {
    // Parse search parameters
    const searchParams: any = req.method === 'POST'
      ? await req.json()
      : {
          category: req.nextUrl.searchParams.get('category') || '',
          keywords: (req.nextUrl.searchParams.get('keywords') || '').split(',').filter(Boolean),
          limit: parseInt(req.nextUrl.searchParams.get('limit') || '50')
        };

    // Validate parameters
    if (!searchParams.category) {
      return NextResponse.json({
        papers: [],
        totalResults: 0,
        matchedResults: 0,
        errors: ['A category is required']
      }, { status: 400 });
    }

    const selectedCategory = searchParams.category;

    // Fetch feed content (could be RSS or JSON based on if it's a weekend)
    const feedUrl = MedrxivService.buildFeedUrl(selectedCategory);
    const feedContent = await MedrxivService.fetchFeed(feedUrl);
    
    // Check if it's a weekend (API returns JSON directly)
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    let papers: Paper[] = [];
    
    if (isWeekend) {
      // Handle JSON response (from date range API)
      if (feedContent.collection && Array.isArray(feedContent.collection)) {
        // For weekend API responses, we need to filter by category since the API
        // doesn't support filtering by category directly
        papers = feedContent.collection
          .filter((item: any) => 
            // Only include papers that match the selected category
            item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()
          )
          .map((item: any) => MedrxivService.parseJsonPaper(item));
      }
    } else {
      // Handle RSS feed response - this already filters by category through the URL
      try {
        const parsedFeed = await parseStringPromise(feedContent);
        
        // Process results
        const items = parsedFeed.rdf?.item || [];
        papers = items.map((item: any) => MedrxivService.parsePaper(item));
      } catch (parseError) {
        console.error('Error parsing medRxiv XML:', parseError);
        throw new Error('Error parsing medRxiv feed. The feed format may have changed.');
      }
    }
    
    // Filter by keywords only - no limit for medRxiv papers as requested
    const matchedPapers = papers
      .filter(paper => MedrxivService.matchesKeywords(paper, searchParams.keywords || []));

    return NextResponse.json({
      papers: matchedPapers,
      totalResults: papers.length,
      matchedResults: matchedPapers.length,
      errors: []
    });
  } catch (error) {
    console.error('Error processing medRxiv papers request:', error);
    return NextResponse.json({
      papers: [],
      totalResults: 0,
      matchedResults: 0,
      errors: [(error as Error).message]
    }, { status: 500 });
  }
}