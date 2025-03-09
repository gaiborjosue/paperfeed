import { Paper } from "@/types";
import { parseStringPromise } from 'xml2js';

interface CacheItem {
  data: string;
  timestamp: number;
}

export class ArxivService {
  private static readonly BASE_URL = 'https://rss.arxiv.org/rss/';
  static readonly API_URL = 'https://export.arxiv.org/api/query';
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private static cache: Record<string, CacheItem> = {};

  static buildFeedUrl(categories: string[]): string {
    if (!categories.length) {
      throw new Error('At least one category is required');
    }
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // If today is a weekend (Saturday or Sunday), use the API query with date range
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return this.buildWeekendQueryUrl(categories);
    }
    
    // Otherwise use the RSS feed
    return `${this.BASE_URL}${categories.join('+')}`;
  }
  
  /**
   * Builds a URL for the arXiv API with date range for weekend queries
   * This gets papers from the previous Monday-Friday
   */
  private static buildWeekendQueryUrl(categories: string[]): string {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Calculate the date range for the previous week's Monday to Friday
    let mondayDate = new Date(today);
    if (dayOfWeek === 0) { // Sunday
      mondayDate.setDate(today.getDate() - 6); // Last Monday
    } else if (dayOfWeek === 6) { // Saturday
      mondayDate.setDate(today.getDate() - 5); // Last Monday
    }
    
    let fridayDate = new Date(mondayDate);
    fridayDate.setDate(mondayDate.getDate() + 4); // Friday of the same week
    
    // Format dates as YYYYMMDD0600 (using 06:00 GMT as the time for consistency)
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}0600`;
    };
    
    const mondayFormatted = formatDate(mondayDate);
    const fridayFormatted = formatDate(fridayDate);
    
    // Build categories part of the query (cat:cs.AI+OR+cat:cs.CV etc.)
    const categoriesQuery = categories.map(cat => `cat:${cat}`).join('+OR+');
    
    // Build the full API query URL with date range
    return `${this.API_URL}?search_query=(${categoriesQuery})+AND+submittedDate:[${mondayFormatted}+TO+${fridayFormatted}2359]&start=0&max_results=50`;
  }

  static async fetchFeed(url: string): Promise<string> {
    // Check if we have a valid cached response
    const cachedItem = this.cache[url];
    const now = Date.now();
    
    if (cachedItem && (now - cachedItem.timestamp) < this.CACHE_TTL) {
      console.log('Using cached arXiv data for:', url);
      return cachedItem.data;
    }

    // Fetch fresh data if no cache or cache expired
    console.log('Fetching fresh arXiv data for:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }
    
    const data = await response.text();
    
    // Update cache
    this.cache[url] = {
      data,
      timestamp: now
    };
    
    return data;
  }

  static parsePaper(item: any): Paper {
    return {
      title: item.title[0],
      link: item.link[0],
      abstract: item.description[0].split('Abstract:')[1]?.trim() || '',
      authors: (item['dc:creator'] || []).flatMap((creator: string) => 
        creator.split(', ').map(author => author.trim())
      ),
      categories: Array.isArray(item.category) ? item.category : [item.category],
      publishDate: item.pubDate[0],
      announceType: item['arxiv:announce_type']?.[0] || 'unknown',
      guid: item.guid?.[0]?._?.trim() || item.guid?.[0] || null, // Extract guid if available
      source: 'arxiv'
    };
  }

  static matchesKeywords(paper: Paper, keywords: string[]): boolean {
    if (!keywords.length) return true;
    
    const searchText = `${paper.title} ${paper.abstract}`.toLowerCase();
    return keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    );
  }

  /**
   * Fetches a paper's details by its arXiv ID using the official API
   * @param arxivId The arXiv ID (e.g., "2503.02283v1")
   * @returns The paper abstract or null if not found
   */
  static async fetchPaperById(arxivId: string): Promise<string | null> {
    // Check cache for this specific paper ID
    const cacheKey = `paper_${arxivId}`;
    const cachedItem = this.cache[cacheKey];
    const now = Date.now();
    
    if (cachedItem && (now - cachedItem.timestamp) < this.CACHE_TTL) {
      console.log('Using cached paper data for:', arxivId);
      return cachedItem.data;
    }
    
    try {
      const url = `${this.API_URL}?id_list=${encodeURIComponent(arxivId)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch paper details: ${response.statusText}`);
      }
      
      const xmlData = await response.text();
      const parsedData = await parseStringPromise(xmlData);
      
      // Navigate the complex XML structure to find the abstract
      const entry = parsedData?.feed?.entry?.[0];
      if (!entry) {
        return null;
      }
      
      const abstract = entry.summary?.[0]?.trim();
      
      // Cache the result
      if (abstract) {
        this.cache[cacheKey] = {
          data: abstract,
          timestamp: now
        };
      }
      
      return abstract || null;
    } catch (error) {
      console.error('Error fetching paper details:', error);
      return null;
    }
  }

  /**
   * Extracts the arXiv ID from a GUID or URL
   * @param source GUID or URL containing an arXiv ID
   * @returns The extracted arXiv ID or null if not found
   */
  static extractArxivId(source: string): string | null {
    // From GUID format like "oai:arXiv.org:2503.02283v1"
    let match = source.match(/oai:arXiv\.org:(.+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // From URL format like "https://arxiv.org/abs/2503.02283v1"
    match = source.match(/arxiv\.org\/abs\/(.+?)($|\/)/);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  }
}