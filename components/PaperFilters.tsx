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

interface Category {
  key: string | null
  field: string
  description: string
}

interface PaperFiltersProps {
  onSearch: (filters: {
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
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedField, setSelectedField] = useState<string>("")
  const [fields, setFields] = useState<Category[]>([])
  const [keywords, setKeywords] = useState<string>("")
  const [isLoadingFields, setIsLoadingFields] = useState(false)
  const [hasSubfields, setHasSubfields] = useState<boolean>(true)

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

  const handleSearch = () => {
    if (!selectedCategory) return;

    const categoryCode = CATEGORY_MAP[selectedCategory];
    const searchParams = {
      category: categoryCode,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean)
    };

    if (hasSubfields && selectedField) {
      onSearch({ ...searchParams, field: selectedField });
    } else {
      onSearch(searchParams);
    }
  }

  return (
    <div className="space-y-6">
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

      {/* Search Button */}
      <Button 
        className="w-full md:w-auto md:px-8 mt-4"
        disabled={!selectedCategory || (hasSubfields && !selectedField)}
        onClick={handleSearch}
      >
        <Search className="mr-2 h-4 w-4" />
        Search Papers
      </Button>
    </div>
  )
}