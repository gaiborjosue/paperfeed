import { Paper } from "@/types";
import { parseStringPromise } from 'xml2js';

interface CacheItem {
  data: string;
  timestamp: number;
}

interface MedrxivPaperDetails {
  doi: string;
  title: string;
  authors: string;
  author_corresponding: string;
  author_corresponding_institution: string;
  date: string;
  version: string;
  type: string;
  license: string;
  category: string;
  jatsxml: string;
  abstract: string;
  published: string;
  server: string;
}

export class MedrxivService {
  private static readonly RSS_URL = 'https://connect.medrxiv.org/medrxiv_xml.php?subject=';
  static readonly API_URL = 'https://api.medrxiv.org/details/medrxiv';
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private static cache: Record<string, CacheItem> = {};

  static buildFeedUrl(category: string): string {
    if (!category) {
      throw new Error('A category is required');
    }
    
    // Always use the RSS feed endpoint with the subject, regardless of the day
    return `${this.RSS_URL}${category}`;
  }
  
  /**
   * Builds a URL for the medRxiv API with date range for weekend queries
   * This gets papers from the previous week
   */
  private static buildWeekendQueryUrl(category: string): string {
    // Calculate the date range (previous 7 days)
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const startDate = formatDate(oneWeekAgo);
    const endDate = formatDate(today);
    
    // Build the date range API URL
    return `${this.API_URL}/${startDate}/${endDate}/0`;
  }
  
  static buildDateRangeUrl(startDate: string, endDate: string, cursor: number = 0): string {
    return `${this.API_URL}/${startDate}/${endDate}/${cursor}`;
  }
  
  static buildPaperDetailsUrl(doi: string): string {
    return `${this.API_URL}/${doi}`;
  }

  static async fetchFeed(url: string): Promise<string | any> {
    // TEMPORARILY DISABLED CACHING FOR TESTING
    
    // Check if this is a date range API URL (for weekends)
    const isDateRangeUrl = url.includes(`${this.API_URL}/`) && url.includes('-');
    
    // Fetch fresh data without using cache
    console.log('Fetching fresh medRxiv data for:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }
    
    // For date range API URLs, parse JSON directly
    if (isDateRangeUrl) {
      const data = await response.json();
      return data;
    } else {
      // Regular RSS feed
      const data = await response.text();
      return data;
    }
  }

  static async fetchJson(url: string): Promise<any> {
    // TEMPORARILY DISABLED CACHING FOR TESTING
    
    // Fetch fresh data without using cache
    console.log('Fetching fresh medRxiv JSON data for:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  }

  static parsePaper(item: any): Paper {
    // Debug the item structure to see exactly what we're working with
    console.log('Parsing RSS feed item:', JSON.stringify(item, null, 2).substring(0, 500) + '...');
    
    // Parse the RSS feed item format
    return {
      title: item.title?.[0]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')?.trim() || 'No title available',
      link: item.link?.[0]?.trim() || '',
      abstract: item.description?.[0]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')?.trim() || 'No abstract available',
      authors: item['dc:creator'] ? 
        item['dc:creator'][0].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
          .split(',')
          .map((author: string) => author.trim()) : 
        [],
      categories: [item['prism:section'] ? item['prism:section'][0] : 'Unknown'],
      publishDate: item['dc:date'] ? item['dc:date'][0] : '',
      announceType: 'new', // Default for medRxiv
      guid: item['dc:identifier'] ? item['dc:identifier'][0].replace('doi:', '') : null,
      source: 'medrxiv',
      publisher: item['dc:publisher'] ? item['dc:publisher'][0].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')?.trim() : undefined
    };
  }

  static parseJsonPaper(paperData: MedrxivPaperDetails): Paper {
    // Parse the JSON API response format
    return {
      title: paperData.title,
      link: `https://www.medrxiv.org/content/${paperData.doi}v${paperData.version}`,
      abstract: paperData.abstract,
      authors: paperData.authors.split(';').map(author => author.trim()),
      categories: [paperData.category],
      publishDate: paperData.date,
      announceType: paperData.type,
      guid: paperData.doi,
      source: 'medrxiv',
      publisher: undefined
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
   * Fetches a paper's details by its DOI
   * @param doi The DOI identifier
   * @returns The paper details or null if not found
   */
  static async fetchPaperByDoi(doi: string): Promise<Paper | null> {
    try {
      const url = this.buildPaperDetailsUrl(doi);
      const data = await this.fetchJson(url);
      
      if (!data.collection || data.collection.length === 0) {
        return null;
      }
      
      const paperDetails = data.collection[0];
      return this.parseJsonPaper(paperDetails);
    } catch (error) {
      console.error('Error fetching paper details:', error);
      return null;
    }
  }

  /**
   * Fetches papers published within a specific date range
   * @param startDate Start date in YYYY-MM-DD format
   * @param endDate End date in YYYY-MM-DD format
   * @param cursor Pagination cursor (optional)
   * @returns Array of papers
   */
  static async fetchPapersByDateRange(startDate: string, endDate: string, cursor: number = 0): Promise<Paper[]> {
    try {
      const url = this.buildDateRangeUrl(startDate, endDate, cursor);
      const data = await this.fetchJson(url);
      
      if (!data.collection || data.collection.length === 0) {
        return [];
      }
      
      return data.collection.map((paperData: MedrxivPaperDetails) => 
        this.parseJsonPaper(paperData)
      );
    } catch (error) {
      console.error('Error fetching papers by date range:', error);
      return [];
    }
  }

  /**
   * Extracts the DOI from a URL or identifier
   * @param source URL or identifier containing a DOI
   * @returns The extracted DOI or null if not found
   */
  static extractDoi(source: string): string | null {
    // From URL format like "https://www.medrxiv.org/content/10.1101/2025.03.01.641017v1"
    let match = source.match(/medrxiv\.org\/content\/([\d\.]+\/[\d\.]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // From DOI format like "10.1101/2025.03.01.641017"
    match = source.match(/(10\.1101\/[\d\.]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  }
}