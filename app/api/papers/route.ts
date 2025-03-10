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
          limit: parseInt(req.nextUrl.searchParams.get('limit') || '1000')
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

    // Construct URL - this will determine if we use RSS or API based on weekday
    const feedUrl = ArxivService.buildFeedUrl(searchParams.categories);
    const feedContent = await ArxivService.fetchFeed(feedUrl);
    
    // Check if we're using the API URL (for weekends) or RSS feed
    const isApiQuery = feedUrl.includes('export.arxiv.org/api/query');
    let papers: Paper[] = [];
    
    if (isApiQuery) {
      // Parse API response (XML format)
      const parsedData = await parseStringPromise(feedContent);
      
      // Extract papers from API response
      const entries = parsedData?.feed?.entry || [];
      papers = entries.map((entry: any) => {
        // Extract categories
        const categories = entry.category?.map((cat: any) => cat.$.term) || [];
        
        // Extract authors
        const authors = entry.author?.map((author: any) => author.name[0]) || [];
        
        // Extract link
        let link = '';
        if (Array.isArray(entry.link)) {
          const pdfLink = entry.link.find((l: any) => l.$.title === 'pdf');
          const absLink = entry.link.find((l: any) => l.$.rel === 'alternate');
          link = (absLink || pdfLink || entry.link[0])?.$.href || '';
        }
        
        return {
          title: entry.title ? entry.title[0] : '',
          link: link,
          abstract: entry.summary ? entry.summary[0] : '',
          authors: authors,
          categories: categories,
          publishDate: entry.published ? entry.published[0] : '',
          announceType: 'new',  // Default for API responses
          guid: entry.id ? entry.id[0] : null
        };
      });
    } else {
      // Parse regular RSS feed
      const parsedFeed = await parseStringPromise(feedContent);
      const items = parsedFeed.rss.channel[0].item || [];
      papers = items.map((item: unknown) => ArxivService.parsePaper(item));
    }
    
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