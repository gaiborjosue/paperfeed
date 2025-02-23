import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';
import { Paper, SearchParams, SearchResponse } from '@/types';
import { ArxivService } from '@/utils/arxiv';

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
  try {
    // Parse search parameters
    const searchParams: SearchParams = req.method === 'POST'
      ? await req.json()
      : {
          categories: (req.nextUrl.searchParams.get('categories') || '').split(',').filter(Boolean),
          keywords: (req.nextUrl.searchParams.get('keywords') || '').split(',').filter(Boolean),
          limit: parseInt(req.nextUrl.searchParams.get('limit') || '50')
        };

    // Validate parameters
    if (!searchParams.categories?.length) {
      return NextResponse.json({
        papers: [],
        totalResults: 0,
        matchedResults: 0,
        errors: ['At least one category is required']
      }, { status: 400 });
    }

    // Fetch and parse RSS feed
    const feedUrl = ArxivService.buildFeedUrl(searchParams.categories);
    const feedContent = await ArxivService.fetchFeed(feedUrl);
    const parsedFeed = await parseStringPromise(feedContent);

    // Process results
    const items = parsedFeed.rss.channel[0].item || [];
    const papers: Paper[] = items.map((item: unknown) => ArxivService.parsePaper(item));
    
    // Filter by keywords and limit results
    const matchedPapers = papers
      .filter(paper => ArxivService.matchesKeywords(paper, searchParams.keywords || []))
      .slice(0, searchParams.limit);

    return NextResponse.json({
      papers: matchedPapers,
      totalResults: papers.length,
      matchedResults: matchedPapers.length,
      errors: []
    });

  } catch (error) {
    console.error('Error processing papers request:', error);
    return NextResponse.json({
      papers: [],
      totalResults: 0,
      matchedResults: 0,
      errors: [(error as Error).message]
    }, { status: 500 });
  }
}
