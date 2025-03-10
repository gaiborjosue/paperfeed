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

    const selectedCategory = searchParams.category;

    // Fetch feed content (always RSS feed now)
    const feedUrl = BiorxivService.buildFeedUrl(selectedCategory);
    const feedContent = await BiorxivService.fetchFeed(feedUrl);
    
    let papers: Paper[] = [];
    
    // Handle RSS feed response - this already filters by category through the URL
    try {
      const parsedFeed = await parseStringPromise(feedContent);
      
      console.log('Parsed feed structure:', JSON.stringify(parsedFeed, null, 2).substring(0, 500) + '...');
      
      // Process results - check for the right structure format from the feed
      const items = parsedFeed['rdf:RDF']?.item || [];
      console.log(`Found ${items.length} items in the RSS feed`);
      
      papers = items.map((item: any) => BiorxivService.parsePaper(item));
    } catch (parseError) {
      console.error('Error parsing bioRxiv XML:', parseError);
      throw new Error('Error parsing bioRxiv feed. The feed format may have changed.');
    }
    
    // Filter by keywords only - no limit for bioRxiv papers as requested
    const matchedPapers = papers
      .filter(paper => BiorxivService.matchesKeywords(paper, searchParams.keywords || []));

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