// app/api/dummy/papers/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Paper {
  title: string;
  link: string;
  abstract: string;
  authors: string[];
  categories: string[];
  publishDate: string;
  announceType: string;
}

interface SearchResponse {
  papers: Paper[];
  totalResults: number;
  matchedResults: number;
  errors: string[];
}

const MOCK_PAPERS: Paper[] = [
  {
    title: "Large Language Models in Scientific Discovery: Applications, Challenges, and Future Prospects",
    link: "https://arxiv.org/abs/2502.13456",
    abstract: "Comparing composite models for multi-component observational data is a prevalent scientific challenge. When fitting composite models, there exists the potential for systematics from a poor fit of one model component to be absorbed by another, resulting in the composite model providing an accurate fit to the data in aggregate but yielding biased a posteriori estimates for individual components. We begin by defining a classification scheme for composite model comparison scenarios, identifying two categories: category I, where models with accurate and predictive components are separable through Bayesian comparison of the unvalidated composite models, and category II, where models with accurate and predictive components may not be separable due to interactions between components, leading to spurious detections or biased signal estimation. To address the limitations of category II model comparisons, we introduce the Bayesian Null Test Evidence Ratio-based (BaNTER) validation framework. Applying this classification scheme and BaNTER to a composite model comparison problem in 21-cm cosmology, where minor systematics from imperfect foreground modelling can bias global 21-cm signal recovery, we validate six composite models using mock data. We show that incorporating BaNTER alongside Bayes-factor-based comparison reliably ensures unbiased inferences of the signal of interest across both categories, positioning BaNTER as a valuable addition to Bayesian inference workflows with potential applications across diverse fields.",
    authors: ["Sarah Johnson", "Michael Chen", "David Williams", "Emily Brown"],
    categories: ["cs.AI", "cs.CL", "cs.LG"],
    publishDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    announceType: "new"
  },
  {
    title: "Quantum Computing Applications in High Energy Physics Simulations",
    link: "https://arxiv.org/abs/2502.13789",
    abstract: "We present a novel approach to simulating high-energy particle collisions using quantum computing algorithms. Our method demonstrates significant speedup in computing complex particle interactions compared to classical methods. The paper includes detailed performance comparisons and discusses the scalability of our approach for future quantum hardware.",
    authors: ["Alex Quantum", "Lisa Particle", "Robert Physics"],
    categories: ["quant-ph", "hep-th", "physics.comp-ph"],
    publishDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    announceType: "new"
  },
  {
    title: "Neural Architecture Search for Efficient Deep Learning in Resource-Constrained Environments",
    link: "https://arxiv.org/abs/2502.13234",
    abstract: "This paper introduces an efficient neural architecture search (NAS) methodology specifically designed for resource-constrained environments. We propose a novel search strategy that optimizes both model performance and computational efficiency. Experimental results show our approach achieves state-of-the-art performance while reducing computational requirements by 40%.",
    authors: ["Wei Zhang", "Maria Garcia", "James Smith"],
    categories: ["cs.LG", "cs.AI", "cs.AR"],
    publishDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    announceType: "new"
  },
  {
    title: "Advances in Mathematical Modeling of Climate Systems",
    link: "https://arxiv.org/abs/2502.13567",
    abstract: "We develop new mathematical frameworks for modeling complex climate systems. Our approach combines traditional differential equations with modern machine learning techniques to improve prediction accuracy. The model shows particular strength in capturing extreme weather events and long-term climate trends.",
    authors: ["Climate Researcher", "Math Expert", "ML Specialist"],
    categories: ["physics.ao-ph", "math.NA", "cs.LG"],
    publishDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    announceType: "new"
  },
  {
    title: "Graph Neural Networks for Molecular Property Prediction",
    link: "https://arxiv.org/abs/2502.13890",
    abstract: "This work presents a novel graph neural network architecture designed specifically for predicting molecular properties. We introduce new graph convolution operators that better capture molecular geometry and electronic properties. Extensive experiments on standard benchmark datasets demonstrate superior performance compared to existing methods.",
    authors: ["Chemistry Expert", "ML Researcher", "Graph Theory Specialist"],
    categories: ["cs.LG", "physics.chem-ph", "q-bio.BM"],
    publishDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    announceType: "new"
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const keywords = searchParams.get('keywords')?.split(',').filter(Boolean) || [];
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!categories.length) {
      return NextResponse.json({
        papers: [],
        totalResults: 0,
        matchedResults: 0,
        errors: ['At least one category is required']
      }, { status: 400 });
    }

    let matchedPapers = MOCK_PAPERS.filter(paper => 
      categories.some(category => 
        paper.categories.some(paperCategory => 
          paperCategory.toLowerCase().includes(category.toLowerCase())
        )
      )
    );

    if (keywords.length) {
      matchedPapers = matchedPapers.filter(paper => {
        const searchText = `${paper.title} ${paper.abstract}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    }

    matchedPapers = matchedPapers.slice(0, limit);

    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      papers: matchedPapers,
      totalResults: MOCK_PAPERS.length,
      matchedResults: matchedPapers.length,
      errors: []
    });

  } catch (error) {
    console.error('Error processing papers request:', error);
    return NextResponse.json({
      papers: [],
      totalResults: 0,
      matchedResults: 0,
      errors: [(error as Error).message]
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categories, keywords, limit } = body;

    if (!categories?.length) {
      return NextResponse.json({
        papers: [],
        totalResults: 0,
        matchedResults: 0,
        errors: ['At least one category is required']
      }, { status: 400 });
    }

    let matchedPapers = MOCK_PAPERS.filter(paper => 
      categories.some((category: string) => 
        paper.categories.some(paperCategory => 
          paperCategory.toLowerCase().includes(category.toLowerCase())
        )
      )
    );

    if (keywords?.length) {
      matchedPapers = matchedPapers.filter(paper => {
        const searchText = `${paper.title} ${paper.abstract}`.toLowerCase();
        return keywords.some((keyword: string) =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    }

    matchedPapers = matchedPapers.slice(0, limit || 50);

    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      papers: matchedPapers,
      totalResults: MOCK_PAPERS.length,
      matchedResults: matchedPapers.length,
      errors: []
    });

  } catch (error) {
    console.error('Error processing papers request:', error);
    return NextResponse.json({
      papers: [],
      totalResults: 0,
      matchedResults: 0,
      errors: [(error as Error).message]
    }, { status: 500 });
  }
}