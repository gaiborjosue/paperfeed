"use client"

// components/ScientificPaperFeed.tsx
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaperFilters } from "./PaperFilters"
import { PaperCard } from "./PaperCard"

interface Paper {
  title: string
  link: string
  abstract: string
  authors: string[]
  categories: string[]
  publishDate: string
  announceType: string
}

interface SearchResponse {
  papers: Paper[]
  totalResults: number
  matchedResults: number
  errors: string[]
}

export default function ScientificPaperFeed() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (filters: {
    category: string
    field?: string  // Made optional
    keywords: string[]
  }) => {
    try {
      setLoading(true)
      setError(null)
      setHasSearched(true)
      
      // Construct categories array based on whether field is present
      const categories = filters.field 
        ? [`${filters.category}.${filters.field}`]
        : [filters.category];

      const response = await fetch('/api/dummy/papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categories,
          keywords: filters.keywords,
          limit: 200
        })
      })

      const data: SearchResponse = await response.json()

      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0])
      }

      setPapers(data.papers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch papers')
      setPapers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Latest Research Papers</h1>
        <PaperFilters onSearch={handleSearch} />
      </div>

      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && hasSearched && papers.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No papers found matching your criteria. Try adjusting your search.
        </div>
      )}

      {!loading && !error && papers.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <PaperCard key={paper.link} paper={paper} />
          ))}
      </div>
      )}

      {!loading && !error && !hasSearched && (
        <div className="text-center text-muted-foreground py-12">
          Select a category and field to start searching for papers.
        </div>
      )}
    </div>
  )
}