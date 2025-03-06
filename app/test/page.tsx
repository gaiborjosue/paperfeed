"use client"

import { PaperCard } from "@/components/PaperCard"
import { samplePapersWithLatex } from "@/test/latex-sample"

export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">LaTeX Rendering Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {samplePapersWithLatex.map((paper) => (
          <PaperCard key={paper.link} paper={paper} />
        ))}
      </div>
    </div>
  )
}