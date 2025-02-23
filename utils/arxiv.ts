import { Paper } from "@/types";

export class ArxivService {
  private static readonly BASE_URL = 'https://rss.arxiv.org/rss/';

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
      announceType: item['arxiv:announce_type']?.[0] || 'unknown'
    };
  }

  static matchesKeywords(paper: Paper, keywords: string[]): boolean {
    if (!keywords.length) return true;
    
    const searchText = `${paper.title} ${paper.abstract}`.toLowerCase();
    return keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    );
  }
}