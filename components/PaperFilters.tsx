"use client"

// components/PaperFilters.tsx
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"

interface Category {
  key: string | null
  field: string
  description: string
}

interface BiorxivCategory {
  value: string
  label: string
}

interface PaperFiltersProps {
  onSearch: (filters: {
    source: "arxiv" | "biorxiv"
    category: string
    field?: string
    keywords: string[]
  }) => void
}

const CATEGORY_MAP: { [key: string]: string } = {
  "Computer Science": "cs",
  "Economics": "econ",
  "Electrical Engineering and Systems Science": "eess",
  "Mathematics": "math",
  "Physics (Astrophysics)": "astro-ph",
  "Physics (Condensed Matter)": "cond-mat",
  "General Relativity and Quantum Cosmology": "gr-qc",
  "High Energy Physics - Experiment": "hep-ex",
  "High Energy Physics - Lattice": "hep-lat",
  "High Energy Physics - Phenomenology": "hep-ph",
  "High Energy Physics - Theory": "hep-th",
  "Mathematical Physics": "math-ph",
  "Nonlinear Sciences": "nlin",
  "Nuclear Experiment": "nucl-ex",
  "Nuclear Theory": "nucl-th",
  "Physics": "physics",
  "Quantitative Biology": "q-bio",
  "Quantitative Finance": "q-fin",
  "Statistics": "stat"
}

export function PaperFilters({ onSearch }: PaperFiltersProps) {
  // Current active source
  const [activeSource, setActiveSource] = useState<"arxiv" | "biorxiv">("arxiv")
  
  // arXiv state
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedField, setSelectedField] = useState<string>("")
  const [fields, setFields] = useState<Category[]>([])
  const [isLoadingFields, setIsLoadingFields] = useState(false)
  const [hasSubfields, setHasSubfields] = useState<boolean>(true)
  
  // bioRxiv state
  const [biorxivCategories, setBiorxivCategories] = useState<BiorxivCategory[]>([])
  const [selectedBiorxivCategory, setSelectedBiorxivCategory] = useState<string>("")
  const [isLoadingBioCategories, setIsLoadingBioCategories] = useState(false)
  
  // Shared state
  const [keywords, setKeywords] = useState<string>("")

  // Fetch arXiv fields when arXiv category changes
  useEffect(() => {
    const fetchFields = async () => {
      if (!selectedCategory) {
        setFields([])
        setHasSubfields(true)
        return
      }

      setIsLoadingFields(true)
      setSelectedField("")
      
      try {
        const response = await fetch(`/api/categories?category=${CATEGORY_MAP[selectedCategory]}`)
        const data = await response.json()

        const validFields = Array.isArray(data) ? data.filter(field => field.key !== null) : []
        setHasSubfields(validFields.length > 0)
        setFields(validFields)

        if (validFields.length === 0) {
          setSelectedField("")
        }
      } catch (error) {
        console.error('Error fetching fields:', error)
        setFields([])
        setHasSubfields(false)
      } finally {
        setIsLoadingFields(false)
      }
    }

    fetchFields()
  }, [selectedCategory])

  // Fetch bioRxiv categories on component mount
  useEffect(() => {
    const fetchBiorxivCategories = async () => {
      setIsLoadingBioCategories(true)
      
      try {
        const response = await fetch('/api/biorxiv/categories')
        const data = await response.json()
        
        if (data.categories && Array.isArray(data.categories)) {
          setBiorxivCategories(data.categories)
        }
      } catch (error) {
        console.error('Error fetching bioRxiv categories:', error)
        setBiorxivCategories([])
      } finally {
        setIsLoadingBioCategories(false)
      }
    }
    
    fetchBiorxivCategories()
  }, [])

  const handleSearch = () => {
    if (activeSource === "arxiv") {
      // Handle arXiv search
      if (!selectedCategory) return;

      const categoryCode = CATEGORY_MAP[selectedCategory];
      const searchParams = {
        source: "arxiv" as const,
        category: categoryCode,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean)
      };

      if (hasSubfields && selectedField) {
        onSearch({ ...searchParams, field: selectedField });
      } else {
        onSearch(searchParams);
      }
    } else {
      // Handle bioRxiv search
      if (!selectedBiorxivCategory) return;
      
      onSearch({
        source: "biorxiv",
        category: selectedBiorxivCategory,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean)
      });
    }
  }

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="arxiv" 
        value={activeSource}
        onValueChange={(value) => setActiveSource(value as "arxiv" | "biorxiv")}
        className="w-full"
      >
        <div className="flex justify-center mb-4">
          <TabsList className="grid w-[400px] max-w-full grid-cols-2">
            <TabsTrigger value="arxiv">arXiv</TabsTrigger>
            <TabsTrigger value="biorxiv">bioRxiv</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="arxiv" className="mt-0">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Category Selector */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[40vh] overflow-y-auto">
                  <SelectGroup>
                    {Object.keys(CATEGORY_MAP).map((category) => (
                      <SelectItem 
                        key={category} 
                        value={category}
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Field Selector */}
            <div className="space-y-2">
              <Label>Field</Label>
              <Select
                value={selectedField}
                onValueChange={setSelectedField}
                disabled={!selectedCategory || !hasSubfields || isLoadingFields}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    isLoadingFields 
                      ? "Loading fields..." 
                      : !hasSubfields 
                      ? "No fields available" 
                      : "Select field"
                  } />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[40vh] overflow-y-auto">
                  <SelectGroup>
                    {fields.map((field) => (
                      <SelectItem 
                        key={field.key} 
                        value={field.key || ""}
                      >
                        <span className="flex items-center justify-between w-full">
                          <span className="truncate mr-1">{field.field}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            ({field.key})
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Keywords Input */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label>Keywords (comma-separated)</Label>
              <Input
                placeholder="e.g., neural networks, deep learning"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="biorxiv" className="mt-0">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* bioRxiv Category Selector */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedBiorxivCategory}
                onValueChange={setSelectedBiorxivCategory}
                disabled={isLoadingBioCategories}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingBioCategories ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[40vh] overflow-y-auto">
                  <SelectGroup>
                    {biorxivCategories.map((category) => (
                      <SelectItem 
                        key={category.value} 
                        value={category.value}
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Keywords Input */}
            <div className="space-y-2">
              <Label>Keywords (comma-separated)</Label>
              <Input
                placeholder="e.g., genomics, CRISPR, virus"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Search Button */}
      <Button 
        className="w-full md:px-8 mt-4"
        disabled={
          (activeSource === "arxiv" && (!selectedCategory || (hasSubfields && !selectedField))) ||
          (activeSource === "biorxiv" && !selectedBiorxivCategory)
        }
        onClick={handleSearch}
      >
        <Search className="mr-2 h-4 w-4" />
        Search {activeSource === "arxiv" ? "arXiv" : "bioRxiv"} Papers
      </Button>
    </div>
  )
}