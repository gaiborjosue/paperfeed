"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  Users,
  X,
  Telescope,
  RotateCcw,
  Sprout,
  LoaderCircle,
  TreeDeciduous,
  Droplet,
  Axe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { useSession } from "next-auth/react";
import { useUserCredits } from "@/app/providers";
import { Paper } from "@/types"; // Import Paper type from types
import { ArxivService } from "@/utils/arxiv";
import { BiorxivService } from "@/utils/biorxiv";
import { MedrxivService } from "@/utils/medrxiv";

interface PaperCardProps {
  paper: Paper;
}

// Function to parse LaTeX content in text
const renderLatexContent = (text: string) => {
  if (!text) return null;

  // Replace LaTeX patterns
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/gs);

  return parts.map((part, index) => {
    // Display block math ($$...$$)
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const formula = part.slice(2, -2);
      try {
        return <BlockMath key={index} math={formula} />;
      } catch (error) {
        console.error("Error rendering LaTeX block:", error);
        return (
          <span key={index} className="text-red-500">
            {part}
          </span>
        );
      }
    }
    // Display inline math ($...$)
    else if (part.startsWith("$") && part.endsWith("$")) {
      const formula = part.slice(1, -1);
      try {
        return <InlineMath key={index} math={formula} />;
      } catch (error) {
        console.error("Error rendering LaTeX inline:", error);
        return (
          <span key={index} className="text-red-500">
            {part}
          </span>
        );
      }
    }
    // Regular text
    else {
      return <span key={index}>{part}</span>;
    }
  });
};

export function PaperCard({ paper }: PaperCardProps) {
  const { data: session } = useSession();
  // Use the shared user credits context instead of local state
  const { credits: remainingCredits, fetchCredits } = useUserCredits();

  const [isFocused, setIsFocused] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifiedAbstract, setSimplifiedAbstract] = useState<string | null>(
    null
  );
  const [showingOriginal, setShowingOriginal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load simplified abstract from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`simplified-${paper.link}`);
    if (stored) {
      setSimplifiedAbstract(stored);
    }
  }, [paper.link]);

  const handleSimplify = async () => {
    // If we already have a simplified version, just toggle to it
    if (simplifiedAbstract) {
      setShowingOriginal(false);
      return;
    }

    setIsSimplifying(true);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let paperId = "";
      let requestBody: any = {};

      // Handle based on paper source
      if (paper.source === "biorxiv" || paper.source === "medrxiv") {
        // For bioRxiv/medRxiv papers, use the DOI
        if (paper.guid) {
          paperId = paper.guid;
          requestBody = {
            doi: paperId,
            source: paper.source, // Send source to identify which service to use
          };
        } else {
          throw new Error(`Could not find valid DOI for ${paper.source} paper`);
        }
      } else {
        // For arXiv papers, extract the arXiv ID
        if (paper.guid) {
          paperId = ArxivService.extractArxivId(paper.guid) || "";
        }

        // If no valid GUID found, extract from the paper link as fallback
        if (!paperId && paper.link) {
          paperId = ArxivService.extractArxivId(paper.link) || "";
        }

        if (!paperId) {
          throw new Error("Could not extract valid arXiv ID");
        }

        requestBody = { arxivId: paperId };
      }

      // Send request to the completion endpoint which handles credit checking
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to simplify abstract");
      }

      const data = await response.json();

      // Always fetch the latest credits from the server after simplification
      fetchCredits();

      // Store in localStorage and state
      localStorage.setItem(`simplified-${paper.link}`, data.text);
      setSimplifiedAbstract(data.text);
      setShowingOriginal(false);
    } catch (error) {
      console.error("Error simplifying abstract:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An error occurred while simplifying");
      }
    } finally {
      setIsSimplifying(false);
      setIsLoading(false);
    }
  };

  const toggleAbstract = () => {
    setShowingOriginal(!showingOriginal);
  };

  // Render credit drops
  const renderCreditDrops = () => {
    if (remainingCredits === null || !session?.user) return null;

    return (
      <div className="flex items-center mb-2 text-gray-500 text-sm">
        <Axe className="h-4 w-4 mr-1" />
        {remainingCredits} Simplifications left
      </div>
    );
  };

  // Get appropriate view link text based on source
  const getViewLinkText = () => {
    switch (paper.source) {
      case "biorxiv":
        return "View on bioRxiv";
      case "medrxiv":
        return "View on medRxiv";
      default:
        return "View on arXiv";
    }
  };

  const PaperCardContent = () => (
    <>
      <CardHeader>
        <CardTitle
          className={cn(
            "text-lg font-semibold font-mono",
            isFocused ? "" : "line-clamp-4"
          )}
        >
          {renderLatexContent(paper.title)}
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {new Date(paper.publishDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Abstract with Toggle Buttons */}
          <div>
            <div
              className={cn(
                "text-sm text-muted-foreground",
                isFocused ? "" : "line-clamp-3",
                !showingOriginal ? "text-black" : "text-gray-500"
              )}
            >
              {renderLatexContent(
                (showingOriginal ? paper.abstract : simplifiedAbstract) ||
                  paper.abstract
              )}
            </div>

            {isFocused && (
              <div className="flex flex-col md:flex-row gap-2 mt-4 items-start md:items-center">
                {errorMessage && (
                  <div className="text-red-500 text-sm mb-2">
                    {errorMessage}
                  </div>
                )}

                {!simplifiedAbstract ? (
                  session?.user ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSimplify}
                      disabled={
                        isSimplifying ||
                        (remainingCredits !== null && remainingCredits <= 0)
                      }
                      className={cn(
                        "bg-yellow-200",
                        remainingCredits !== null &&
                          remainingCredits <= 0 &&
                          "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isSimplifying ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Simplifying...
                        </>
                      ) : (
                        <>
                          <TreeDeciduous className="mr-2 h-4 w-4" />
                          {remainingCredits !== null && remainingCredits <= 0
                            ? "No Simplifications Left"
                            : "Simplify"}
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <Link
                        href="/auth/signin"
                        className="text-blue-500 hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      to simplify this abstract
                    </div>
                  )
                ) : (
                  // Show toggle buttons if we have both versions
                  <div className="flex gap-2">
                    <Button
                      variant={showingOriginal ? "ghost" : "outline"}
                      size="sm"
                      onClick={toggleAbstract}
                      className={
                        showingOriginal ? "bg-green-200" : "bg-gray-100"
                      }
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

                {session?.user && renderCreditDrops()}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* For bioRxiv papers, show publisher badge only if publisher exists */}
            {paper.source === "biorxiv" && paper.publisher && (
              <Badge
                key="publisher"
                variant="outline"
                className="text-xs bg-green-100"
              >
                {paper.publisher}
              </Badge>
            )}

            {/* For medRxiv papers, show publisher badge only if publisher exists */}
            {paper.source === "medrxiv" && paper.publisher && (
              <Badge
                key="publisher"
                variant="outline"
                className="text-xs bg-blue-100"
              >
                {paper.publisher}
              </Badge>
            )}

            {/* For arXiv papers, show categories as before */}
            {paper.source !== "biorxiv" &&
              paper.source !== "medrxiv" &&
              paper.categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
          </div>

          {isFocused && (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-1 flex-shrink-0" />
                <p className="text-sm">{paper.authors.join(", ")}</p>
              </div>

              <Button asChild className="w-full mt-4">
                <Link
                  href={paper.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getViewLinkText()}
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
  );

  return (
    <>
      <Card className="flex flex-col shadow-[0_0_30px_rgba(255,255,255,0.3)] paper-card">
        <PaperCardContent />
      </Card>

      <Dialog open={isFocused} onOpenChange={setIsFocused}>
        <DialogContent className="sm:mx-auto sm:max-w-[800px] p-0 shadow-[0_0_1500px_rgba(255,255,255,0.3)] border-none bg-transparent max-h-[95vh] overflow-auto">
          <DialogTitle className="sr-only">Paper details</DialogTitle>
          <Card
            className={cn(
              "relative border bg-card paper-card",
              "shadow-white-500",
              "before:pointer-events-none"
            )}
          >
            {/* Sticky close button to ensure it's always visible */}
            <div className="sticky top-0 right-0 left-0 z-50 p-2 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-background/20"
                onClick={() => setIsFocused(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative z-10 px-1 pb-4">
              <PaperCardContent />
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
