export interface Paper {
  title: string;
  link: string;
  abstract: string;
  authors: string[];
  categories: string[];
  publishDate: string;
  announceType: string;
}

export interface SearchParams {
  categories: string[];
  keywords: string[];
  limit?: number;
}

export interface SearchResponse {
  papers: Paper[];
  totalResults: number;
  matchedResults: number;
  errors: string[];
}

export interface Category {
  category: string;
  field: string;
  description: string;
}
