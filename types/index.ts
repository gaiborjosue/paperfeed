export interface Paper {
  title: string;
  link: string;
  abstract: string;
  authors: string[];
  categories: string[];
  publishDate: string;
  announceType: string;
  guid?: string; // Optional GUID from arXiv or DOI from bioRxiv
  source?: 'arxiv' | 'biorxiv' | 'medrxiv'; // Source of the paper
  publisher?: string; // Optional publisher information from RSS feed
}

export interface SearchParams {
  categories: string[];
  keywords: string[];
  limit?: number;
}

export interface BiorxivSearchParams {
  category: string;
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

export interface BiorxivCategory {
  value: string; // ID used in API calls (with underscores)
  label: string; // Human-readable name
}