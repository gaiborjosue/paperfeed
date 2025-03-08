"use client"

// components/ScientificPaperFeed.tsx
import { useState, useEffect } from "react"
import { Loader2, LayoutGrid, Square, Menu, InfoIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PaperFilters } from "./PaperFilters"
import { PaperCard } from "./PaperCard"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Paper {
  title: string
  link: string
  abstract: string
  authors: string[]
  categories: string[]
  publishDate: string
  announceType: string
  guid?: string
}

interface SearchResponse {
  papers: Paper[]
  totalResults: number
  matchedResults: number
  errors: string[]
}

type ViewMode = "grid" | "list"

export default function ScientificPaperFeed() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isWeekend, setIsWeekend] = useState(false)

  // Initialize view mode from localStorage and check if it's a weekend
  useEffect(() => {
    const savedViewMode = localStorage.getItem('paperfeed-view-mode') as ViewMode
    if (savedViewMode === "grid" || savedViewMode === "list") {
      setViewMode(savedViewMode)
    }
    
    // Check if today is a weekend
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
    setIsWeekend(dayOfWeek === 0 || dayOfWeek === 6)
  }, [])

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

      const response = await fetch('/api/papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categories,
          keywords: filters.keywords,
          // limit: 200
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

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    // Save preference to localStorage for persistence
    localStorage.setItem('paperfeed-view-mode', mode)
  }

  // Desktop view controls
  const DesktopViewControls = () => (
    <div className="hidden md:flex items-center space-x-2">
      <span className="text-sm text-gray-400">View:</span>
      <div className="border rounded-md p-1 space-x-1 flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", viewMode === "grid" && "bg-muted")}
              onClick={() => toggleViewMode("grid")}
            >
              <LayoutGrid size={16} />
              <span className="sr-only">Grid View</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Grid View</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn("h-8 w-8", viewMode === "list" && "bg-muted")}
              onClick={() => toggleViewMode("list")}
            >
              <Square size={16} />
              <span className="sr-only">List View</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>List View</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )

  // Mobile view controls dropdown
  const MobileViewControls = () => (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Menu className="h-4 w-4 mr-2" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => toggleViewMode("grid")} className={viewMode === "grid" ? "bg-muted" : ""}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleViewMode("list")} className={viewMode === "list" ? "bg-muted" : ""}>
            <Square className="h-4 w-4 mr-2" />
            List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  // Weekend notification banner
  const WeekendNotification = () => {
    if (!isWeekend) return null;
    
    return (
      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-600 dark:text-blue-400">Weekend Mode</AlertTitle>
        <AlertDescription className="text-blue-600/90 dark:text-blue-400/90">
          Since arXiv doesn't publish papers on weekends, we're showing papers from this past week. 
          Daily updates will resume on Monday.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 relative pt-32">
      <div className="mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Today's Research Papers</h1>
          
          <TooltipProvider>
            <div className="flex items-center">
              <DesktopViewControls />
              <MobileViewControls />
            </div>
          </TooltipProvider>
        </div>
        
        <PaperFilters onSearch={handleSearch} />
      </div>

      {/* Show weekend notification if it's a weekend */}
      <WeekendNotification />

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
        <div className={cn(
          "grid gap-4 md:gap-6",
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
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