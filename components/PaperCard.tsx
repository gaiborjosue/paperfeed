"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarIcon, Users, X, Telescope, RotateCcw, Sprout, LoaderCircle, TreeDeciduous } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { DialogTitle } from "@radix-ui/react-dialog"

interface Paper {
  title: string
  link: string
  abstract: string
  authors: string[]
  categories: string[]
  publishDate: string
  announceType: string
}

interface PaperCardProps {
  paper: Paper
}

export function PaperCard({ paper }: PaperCardProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isSimplifying, setIsSimplifying] = useState(false)
  const [simplifiedAbstract, setSimplifiedAbstract] = useState<string | null>(null)
  const [showingOriginal, setShowingOriginal] = useState(true)

  // Load simplified abstract from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`simplified-${paper.link}`)
    if (stored) {
      setSimplifiedAbstract(stored)
    }
  }, [paper.link])

  const handleSimplify = async () => {
    // If we already have a simplified version, just toggle to it
    if (simplifiedAbstract) {
      setShowingOriginal(false)
      return
    }

    setIsSimplifying(true)
    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `Please simplify this scientific abstract and make it easier to understand for a general audience, while preserving the key points:\n\n${paper.abstract}`
        })
      });
      const data = await response.json();
      
      // Store in localStorage and state
      localStorage.setItem(`simplified-${paper.link}`, data.text)
      setSimplifiedAbstract(data.text)
      setShowingOriginal(false)
    } catch (error) {
      console.error('Error simplifying abstract:', error)
    } finally {
      setIsSimplifying(false)
    }
  }

  const toggleAbstract = () => {
    setShowingOriginal(!showingOriginal)
  }

  const PaperCardContent = () => (
    <>
      <CardHeader>
        <CardTitle className={cn(
          "text-lg font-semibold font-mono",
          isFocused ? "" : "line-clamp-2"
        )}>
          {paper.title}
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {new Date(paper.publishDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Abstract with Toggle Buttons */}
          <div>
            <p className={cn(
              "text-sm text-muted-foreground",
              isFocused ? "" : "line-clamp-3",
              !showingOriginal ? "text-black" : "text-gray-500"
            )}>
              {(showingOriginal ? paper.abstract : simplifiedAbstract) || paper.abstract}
            </p>
            
            {isFocused && (
              <div className="flex gap-2 mt-4">
                {!simplifiedAbstract ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSimplify}
                    disabled={isSimplifying}
                    className="bg-yellow-200"
                  >
                    {isSimplifying ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Simplifying...
                      </>
                    ) : (
                      <>
                        <TreeDeciduous className="mr-2 h-4 w-4" />
                        Simplify
                      </>
                    )}
                  </Button>
                ) : (
                  // Show toggle buttons if we have both versions
                  <div className="flex gap-2">
                    <Button
                      variant={showingOriginal ? "ghost" : "outline"}
                      size="sm"
                      onClick={toggleAbstract}
                      className={showingOriginal ? "bg-green-200" : "bg-gray-100"}
                    >
                      {showingOriginal ? (
                        <>
                          <Sprout className="mr-2 h-4 w-4" />
                          Show Simplified
                        </>
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4 text-red-600" />
                          Show Original
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {paper.categories.map((category) => (
              <Badge 
                key={category} 
                variant="secondary"
                className="text-xs"
              >
                {category}
              </Badge>
            ))}
          </div>

          {isFocused && (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-1 flex-shrink-0" />
                <p className="text-sm">
                  {paper.authors.join(", ")}
                </p>
              </div>
              
              <Button asChild className="w-full mt-4">
                <Link 
                  href={paper.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View on arXiv
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {!isFocused && (
        <CardFooter className="pt-6 z-[100]">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsFocused(true)}
          >
            <Telescope className="mr-2 h-4 w-4" />
            Focus
          </Button>
        </CardFooter>
      )}
    </>
  )

  return (
    <>
      <Card className="flex flex-col shadow-[0_0_30px_rgba(255,255,255,0.3)]">
        
            
        <PaperCardContent />
    </Card>

      <Dialog open={isFocused} onOpenChange={setIsFocused}>
        <DialogPortal>
          <DialogOverlay 
            className="bg-background/95 backdrop-blur-lg"
            style={{
              background: 'rgba(0, 0, 0, 0.7)'
            }}
          />
          <DialogTitle className="sr-only">Paper details</DialogTitle>
          <DialogContent className="sm:max-w-[800px] p-0 shadow-[0_0_1500px_rgba(255,255,255,0.3)] border-none bg-transparent">
            <Card 
              className={cn(
                "relative border bg-card",
                "shadow-white-500",
                "before:pointer-events-none"
              )}
            >
              <div className="absolute right-4 top-4 z-50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-background/20"
                  onClick={() => setIsFocused(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative z-10">
                <PaperCardContent />
              </div>
            </Card>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  )
}