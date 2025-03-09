import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';
import { Paper, SearchParams, SearchResponse } from '@/types';
import { BiorxivService } from '@/utils/biorxiv';
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

    // Fetch feed content (could be RSS or JSON based on if it's a weekend)
    const feedUrl = BiorxivService.buildFeedUrl(searchParams.category);
    const feedContent = await BiorxivService.fetchFeed(feedUrl);

    console.log(feedContent)
    
    // Check if it's a weekend (API returns JSON directly)
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    let papers: Paper[] = [];
    
    if (isWeekend) {
      // Handle JSON response (from date range API)
      if (feedContent.collection && Array.isArray(feedContent.collection)) {
        papers = feedContent.collection.map((item: any) => BiorxivService.parseJsonPaper(item));
      }
    } else {
      // Handle RSS feed response
      try {
        const parsedFeed = await parseStringPromise(feedContent);
        
        // Process results
        const items = parsedFeed.rdf?.item || [];
        papers = items.map((item: any) => BiorxivService.parsePaper(item));
      } catch (parseError) {
        console.error('Error parsing bioRxiv XML:', parseError);
        throw new Error('Error parsing bioRxiv feed. The feed format may have changed.');
      }
    }
    
    // Filter by keywords and limit results
    const matchedPapers = papers
      .filter(paper => BiorxivService.matchesKeywords(paper, searchParams.keywords || []))
      .slice(0, searchParams.limit);

    return NextResponse.json({
      papers: matchedPapers,
      totalResults: papers.length,
      matchedResults: matchedPapers.length,
      errors: []
    });
  } catch (error) {
    console.error('Error processing bioRxiv papers request:', error);
    return NextResponse.json({
      papers: [],
      totalResults: 0,
      matchedResults: 0,
      errors: [(error as Error).message]
    }, { status: 500 });
  }
}