import { Paper } from "@/types";
import { parseStringPromise } from 'xml2js';

export class ArxivService {
  private static readonly BASE_URL = 'https://rss.arxiv.org/rss/';
  private static readonly API_URL = 'https://export.arxiv.org/api/query';

  static buildFeedUrl(categories: string[]): string {
    if (!categories.length) {
      throw new Error('At least one category is required');
    }
    return `${this.BASE_URL}${categories.join('+')}`;
  }

  static async fetchFeed(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }
    return response.text();
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
      guid: item.guid?.[0]?._?.trim() || item.guid?.[0] || null // Extract guid if available
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